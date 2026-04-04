"""
Landmark Stabilization & Jitter Reduction
==========================================
Provides two smoothing strategies for MediaPipe's 33 pose landmarks:

1. OneEuroFilter  — adapts cutoff frequency to landmark velocity.
                     Zero latency at rest, responsive to fast motion.
                     Best for real-time / interactive use.

2. SimpleKalmanFilter — classic 1-D Kalman with fixed process/measurement noise.
                         Good for offline video analysis with consistent noise.

Usage:
    stabilizer = LandmarkStabilizer(method="one_euro")
    # inside frame loop:
    smoothed_landmarks = stabilizer.smooth(results.pose_landmarks.landmark, fps)
"""

import math
import numpy as np
from typing import List, Optional


# ---------------------------------------------------------------------------
# One Euro Filter (Casiez, Roussel, Vogel 2012)
# ---------------------------------------------------------------------------
class _LowPassFilter:
    """First-order low-pass filter with adaptive alpha."""
    __slots__ = ("_y", "_initialized")

    def __init__(self) -> None:
        self._y: float = 0.0
        self._initialized: bool = False

    def apply(self, value: float, alpha: float) -> float:
        if not self._initialized:
            self._y = value
            self._initialized = True
            return value
        self._y = alpha * value + (1.0 - alpha) * self._y
        return self._y

    @property
    def last(self) -> float:
        return self._y

    def reset(self) -> None:
        self._initialized = False


class OneEuroFilter1D:
    """One Euro Filter for a single scalar signal."""
    __slots__ = ("_min_cutoff", "_beta", "_d_cutoff", "_x_filter", "_dx_filter", "_last_time")

    def __init__(self, min_cutoff: float = 1.0, beta: float = 0.007, d_cutoff: float = 1.0) -> None:
        self._min_cutoff = min_cutoff
        self._beta = beta
        self._d_cutoff = d_cutoff
        self._x_filter = _LowPassFilter()
        self._dx_filter = _LowPassFilter()
        self._last_time: Optional[float] = None

    @staticmethod
    def _alpha(cutoff: float, dt: float) -> float:
        tau = 1.0 / (2.0 * math.pi * cutoff)
        return 1.0 / (1.0 + tau / dt)

    def apply(self, value: float, timestamp: float) -> float:
        if self._last_time is None:
            dt = 1.0 / 30.0  # assume 30 fps initially
        else:
            dt = timestamp - self._last_time
            if dt <= 0:
                dt = 1.0 / 30.0
        self._last_time = timestamp

        # Derivative estimation
        dx = (value - self._x_filter.last) / dt if self._x_filter._initialized else 0.0
        edx = self._dx_filter.apply(dx, self._alpha(self._d_cutoff, dt))

        # Adaptive cutoff
        cutoff = self._min_cutoff + self._beta * abs(edx)
        return self._x_filter.apply(value, self._alpha(cutoff, dt))

    def reset(self) -> None:
        self._x_filter.reset()
        self._dx_filter.reset()
        self._last_time = None


# ---------------------------------------------------------------------------
# Simple 1-D Kalman Filter
# ---------------------------------------------------------------------------
class SimpleKalman1D:
    """Minimal 1-D Kalman filter with position-only state."""
    __slots__ = ("_q", "_r", "_x", "_p", "_initialized")

    def __init__(self, process_noise: float = 0.01, measurement_noise: float = 0.1) -> None:
        self._q = process_noise
        self._r = measurement_noise
        self._x: float = 0.0
        self._p: float = 1.0
        self._initialized: bool = False

    def apply(self, measurement: float) -> float:
        if not self._initialized:
            self._x = measurement
            self._p = 1.0
            self._initialized = True
            return measurement

        # Predict
        self._p += self._q

        # Update
        k = self._p / (self._p + self._r)
        self._x += k * (measurement - self._x)
        self._p *= (1.0 - k)
        return self._x

    def reset(self) -> None:
        self._initialized = False


# ---------------------------------------------------------------------------
# Landmark Stabilizer — facade for all 33 landmarks × 4 channels (x, y, z, visibility)
# ---------------------------------------------------------------------------
NUM_LANDMARKS: int = 33
CHANNELS: int = 4  # x, y, z, visibility


class LandmarkStabilizer:
    """
    Smooths all 33 MediaPipe pose landmarks across frames.

    Parameters
    ----------
    method : str
        "one_euro" (default, recommended) or "kalman".
    min_cutoff : float
        OneEuro: minimum cutoff frequency. Lower = smoother but more lag.
    beta : float
        OneEuro: speed coefficient. Higher = more responsive to fast motion.
    process_noise : float
        Kalman: process noise Q.
    measurement_noise : float
        Kalman: measurement noise R.
    """

    def __init__(
        self,
        method: str = "one_euro",
        min_cutoff: float = 1.0,
        beta: float = 0.007,
        d_cutoff: float = 1.0,
        process_noise: float = 0.005,
        measurement_noise: float = 0.05,
    ) -> None:
        self._method = method
        self._frame_count: int = 0

        if method == "one_euro":
            self._filters: List[OneEuroFilter1D] = [
                OneEuroFilter1D(min_cutoff=min_cutoff, beta=beta, d_cutoff=d_cutoff)
                for _ in range(NUM_LANDMARKS * CHANNELS)
            ]
        elif method == "kalman":
            self._filters: List[SimpleKalman1D] = [
                SimpleKalman1D(process_noise=process_noise, measurement_noise=measurement_noise)
                for _ in range(NUM_LANDMARKS * CHANNELS)
            ]
        else:
            raise ValueError(f"Unknown method: {method}. Use 'one_euro' or 'kalman'.")

    def smooth(self, landmarks, fps: float = 30.0):
        """
        Smooth landmarks in-place and return the same landmark list.

        Parameters
        ----------
        landmarks : list of mediapipe NormalizedLandmark
            The 33 landmarks from `results.pose_landmarks.landmark`.
        fps : float
            Video FPS (used for One Euro timestamp computation).

        Returns
        -------
        The same landmarks list, with coordinates smoothed.
        """
        self._frame_count += 1
        timestamp = self._frame_count / fps

        for i, lm in enumerate(landmarks):
            base_idx = i * CHANNELS
            vals = [lm.x, lm.y, lm.z, lm.visibility]

            smoothed = []
            for ch, val in enumerate(vals):
                filt = self._filters[base_idx + ch]
                if self._method == "one_euro":
                    smoothed.append(filt.apply(val, timestamp))
                else:
                    smoothed.append(filt.apply(val))

            lm.x = smoothed[0]
            lm.y = smoothed[1]
            lm.z = smoothed[2]
            lm.visibility = smoothed[3]

        return landmarks

    def reset(self) -> None:
        """Reset all filters (e.g. between videos)."""
        for f in self._filters:
            f.reset()
        self._frame_count = 0

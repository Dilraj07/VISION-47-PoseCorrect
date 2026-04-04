"""
Velocity & Acceleration Tracker for Rep Validation
====================================================
Computes frame-to-frame angular velocity and acceleration for key joints.
Validates reps by rejecting partial movements, micro-drifts, and jerky motion.

Integration:
    tracker = VelocityTracker(fps=30.0)
    # inside frame loop:
    tracker.update(current_angle)
    # at rep boundary:
    if tracker.is_valid_rep(min_displacement=40):
        rep_count += 1
"""

import numpy as np
from typing import List, Optional
from collections import deque


class VelocityTracker:
    """
    Tracks angular velocity and acceleration for a single joint angle stream.

    Parameters
    ----------
    fps : float
        Video frame rate.
    smoothing_window : int
        Window size for velocity smoothing (moving average).
    min_velocity_threshold : float
        Minimum peak angular velocity (deg/s) during rep to be valid.
        Rejects stationary drifts.
    min_displacement : float
        Minimum total angular displacement (degrees) for a valid rep.
        Rejects micro-movements.
    max_jerk_ratio : float
        Maximum ratio of acceleration variance to mean velocity.
        High values indicate jerky, uncontrolled motion.
    """

    def __init__(
        self,
        fps: float = 30.0,
        smoothing_window: int = 5,
        min_velocity_threshold: float = 30.0,
        min_displacement: float = 40.0,
        max_jerk_ratio: float = 5.0,
    ) -> None:
        self._fps = fps
        self._dt = 1.0 / fps
        self._smoothing_window = smoothing_window
        self._min_velocity_threshold = min_velocity_threshold
        self._min_displacement = min_displacement
        self._max_jerk_ratio = max_jerk_ratio

        # Per-rep tracking
        self._angle_history: List[float] = []
        self._velocity_history: List[float] = []
        self._acceleration_history: List[float] = []
        self._prev_angle: Optional[float] = None
        self._prev_velocity: Optional[float] = None

        # Smoothing buffer
        self._velocity_buffer: deque = deque(maxlen=smoothing_window)

    def update(self, angle: float) -> dict:
        """
        Feed a new angle measurement. Computes velocity/acceleration.

        Parameters
        ----------
        angle : float
            Current joint angle in degrees.

        Returns
        -------
        dict with 'velocity' (deg/s), 'acceleration' (deg/s²), 'smoothed_velocity' (deg/s).
        """
        self._angle_history.append(angle)

        velocity = 0.0
        acceleration = 0.0
        smoothed_velocity = 0.0

        if self._prev_angle is not None:
            velocity = (angle - self._prev_angle) / self._dt

        self._velocity_buffer.append(velocity)
        smoothed_velocity = float(np.mean(self._velocity_buffer))
        self._velocity_history.append(smoothed_velocity)

        if self._prev_velocity is not None:
            acceleration = (smoothed_velocity - self._prev_velocity) / self._dt
        self._acceleration_history.append(acceleration)

        self._prev_angle = angle
        self._prev_velocity = smoothed_velocity

        return {
            "velocity": round(velocity, 2),
            "acceleration": round(acceleration, 2),
            "smoothed_velocity": round(smoothed_velocity, 2),
        }

    def is_valid_rep(
        self,
        min_displacement: Optional[float] = None,
        min_velocity: Optional[float] = None,
    ) -> bool:
        """
        Validate whether the accumulated angle history constitutes a real rep.

        Call this at the rep boundary (when state machine detects rep completion).
        Returns True if the movement meets quality criteria.

        Parameters
        ----------
        min_displacement : float, optional
            Override default minimum angular displacement.
        min_velocity : float, optional
            Override default minimum peak velocity.
        """
        if len(self._angle_history) < 3:
            return False

        min_disp = min_displacement if min_displacement is not None else self._min_displacement
        min_vel = min_velocity if min_velocity is not None else self._min_velocity_threshold

        angles = np.array(self._angle_history)

        # 1. Check total displacement (peak-to-trough range)
        displacement = float(np.max(angles) - np.min(angles))
        if displacement < min_disp:
            return False

        # 2. Check peak angular velocity
        if self._velocity_history:
            peak_velocity = float(np.max(np.abs(self._velocity_history)))
            if peak_velocity < min_vel:
                return False

        # 3. Check for jerkiness (optional — too much noise = bad rep)
        if len(self._acceleration_history) > 3 and len(self._velocity_history) > 3:
            accel_var = float(np.var(self._acceleration_history))
            mean_vel = float(np.mean(np.abs(self._velocity_history))) + 1e-6
            jerk_ratio = accel_var / mean_vel
            if jerk_ratio > self._max_jerk_ratio * 1000:  # Scaled appropriately
                return False

        return True

    def get_rep_metrics(self) -> dict:
        """Return detailed metrics for the current rep buffer."""
        if not self._angle_history:
            return {}

        angles = np.array(self._angle_history)
        velocities = np.array(self._velocity_history) if self._velocity_history else np.array([0.0])

        return {
            "displacement": round(float(np.max(angles) - np.min(angles)), 1),
            "peak_velocity": round(float(np.max(np.abs(velocities))), 1),
            "avg_velocity": round(float(np.mean(np.abs(velocities))), 1),
            "duration_frames": len(self._angle_history),
            "duration_seconds": round(len(self._angle_history) / self._fps, 2),
        }

    def start_new_rep(self) -> None:
        """Clear history for a new rep. Call after is_valid_rep()."""
        self._angle_history.clear()
        self._velocity_history.clear()
        self._acceleration_history.clear()
        self._velocity_buffer.clear()
        self._prev_velocity = None
        # Keep prev_angle for continuity

    def reset(self) -> None:
        """Full reset between videos."""
        self._angle_history.clear()
        self._velocity_history.clear()
        self._acceleration_history.clear()
        self._velocity_buffer.clear()
        self._prev_angle = None
        self._prev_velocity = None

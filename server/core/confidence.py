"""
Confidence-Aware Processing
============================
Evaluates per-landmark visibility scores from MediaPipe and determines
whether a frame's pose estimation is reliable enough for angle computation.

When confidence is low, the analyzer should:
1. Skip angle computation (avoid hallucinated angles).
2. Carry forward previous frame's state.
3. Draw a visible "POOR VISIBILITY" warning overlay.
"""

import cv2
import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional


# Key landmarks for exercise analysis (indices into 33-landmark array)
# We focus on the landmarks actually used for angle computation.
KEY_LANDMARK_INDICES: List[int] = [
    11, 12,  # shoulders
    13, 14,  # elbows
    15, 16,  # wrists
    23, 24,  # hips
    25, 26,  # knees
    27, 28,  # ankles
    29, 30,  # heels
]


@dataclass
class FrameConfidence:
    """Result of confidence evaluation for a single frame."""
    is_reliable: bool
    avg_confidence: float
    min_confidence: float
    low_confidence_landmarks: List[int] = field(default_factory=list)
    low_confidence_names: List[str] = field(default_factory=list)


# Human-readable names for key landmarks
_LANDMARK_NAMES = {
    11: "L.Shoulder", 12: "R.Shoulder",
    13: "L.Elbow", 14: "R.Elbow",
    15: "L.Wrist", 16: "R.Wrist",
    23: "L.Hip", 24: "R.Hip",
    25: "L.Knee", 26: "R.Knee",
    27: "L.Ankle", 28: "R.Ankle",
    29: "L.Heel", 30: "R.Heel",
}


class ConfidenceChecker:
    """
    Evaluates per-landmark visibility/confidence scores.

    Parameters
    ----------
    threshold : float
        Minimum visibility score for a landmark to be considered reliable.
        MediaPipe visibility is 0.0–1.0.
    min_reliable_ratio : float
        Fraction of key landmarks that must be above threshold for
        the entire frame to be considered reliable.
    """

    def __init__(
        self,
        threshold: float = 0.65,
        min_reliable_ratio: float = 0.7,
    ) -> None:
        self._threshold = threshold
        self._min_reliable_ratio = min_reliable_ratio
        self._total_frames: int = 0
        self._low_confidence_frames: int = 0

    def evaluate(self, landmarks) -> FrameConfidence:
        """
        Evaluate confidence of a pose estimation result.

        Parameters
        ----------
        landmarks : list of NormalizedLandmark
            The 33 landmarks from `results.pose_landmarks.landmark`.

        Returns
        -------
        FrameConfidence
        """
        self._total_frames += 1

        visibilities = []
        low_indices = []
        low_names = []

        for idx in KEY_LANDMARK_INDICES:
            vis = landmarks[idx].visibility
            visibilities.append(vis)
            if vis < self._threshold:
                low_indices.append(idx)
                low_names.append(_LANDMARK_NAMES.get(idx, f"LM_{idx}"))

        avg_conf = float(np.mean(visibilities))
        min_conf = float(np.min(visibilities))
        reliable_count = sum(1 for v in visibilities if v >= self._threshold)
        is_reliable = (reliable_count / len(KEY_LANDMARK_INDICES)) >= self._min_reliable_ratio

        if not is_reliable:
            self._low_confidence_frames += 1

        return FrameConfidence(
            is_reliable=is_reliable,
            avg_confidence=round(avg_conf, 3),
            min_confidence=round(min_conf, 3),
            low_confidence_landmarks=low_indices,
            low_confidence_names=low_names,
        )

    @property
    def stats(self) -> dict:
        return {
            "total_frames_evaluated": self._total_frames,
            "low_confidence_frames": self._low_confidence_frames,
            "confidence_pass_rate": round(
                (self._total_frames - self._low_confidence_frames) / max(self._total_frames, 1), 3
            ),
        }

    def reset(self) -> None:
        self._total_frames = 0
        self._low_confidence_frames = 0


def draw_confidence_warning(
    image: np.ndarray,
    frame_confidence: FrameConfidence,
    show_details: bool = True,
) -> np.ndarray:
    """
    Draw a semi-transparent 'POOR VISIBILITY' banner on unreliable frames.

    Parameters
    ----------
    image : np.ndarray
        The output frame (RGB or BGR).
    frame_confidence : FrameConfidence
        Result of ConfidenceChecker.evaluate().
    show_details : bool
        If True, list the specific low-confidence landmarks.

    Returns
    -------
    np.ndarray
        Image with warning overlay.
    """
    if frame_confidence.is_reliable:
        return image

    h, w = image.shape[:2]

    # Semi-transparent red banner at top
    overlay = image.copy()
    banner_h = 60 if not show_details else 80
    cv2.rectangle(overlay, (0, 0), (w, banner_h), (30, 30, 30), -1)
    cv2.addWeighted(overlay, 0.7, image, 0.3, 0, image)

    # Warning icon (triangle) + text
    WARNING_COLOR = (0, 100, 255)  # Orange-red in BGR/RGB
    cv2.putText(
        image,
        "!! POOR VISIBILITY - RESULTS MAY BE INACCURATE !!",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        WARNING_COLOR,
        2,
        cv2.LINE_AA,
    )

    # Confidence bar
    bar_x = w - 180
    bar_w = 150
    bar_y = 15
    bar_h = 15
    fill_w = int(bar_w * frame_confidence.avg_confidence)
    cv2.rectangle(image, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (80, 80, 80), -1)
    bar_color = (0, 200, 0) if frame_confidence.avg_confidence > 0.5 else (0, 0, 200)
    cv2.rectangle(image, (bar_x, bar_y), (bar_x + fill_w, bar_y + bar_h), bar_color, -1)
    cv2.putText(
        image,
        f"{frame_confidence.avg_confidence:.0%}",
        (bar_x + bar_w + 5, bar_y + 13),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.4,
        (200, 200, 200),
        1,
        cv2.LINE_AA,
    )

    if show_details and frame_confidence.low_confidence_names:
        detail_str = "Low: " + ", ".join(frame_confidence.low_confidence_names[:5])
        if len(frame_confidence.low_confidence_names) > 5:
            detail_str += f" +{len(frame_confidence.low_confidence_names) - 5} more"
        cv2.putText(
            image,
            detail_str,
            (20, 65),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (180, 180, 180),
            1,
            cv2.LINE_AA,
        )

    return image

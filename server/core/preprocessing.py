"""
Adaptive Lighting & Environment Preprocessing
==============================================
Dynamically selects and applies image preprocessing to compensate for
poor lighting conditions common in home workouts.

Strategy per frame:
- Dark  (mean luminance < 80):  CLAHE with aggressive clip limit
- Bright (mean luminance > 200): Gamma correction (γ > 1 to darken)
- Normal (80–200):              Mild CLAHE for consistency

All operations use OpenCV only — zero additional dependencies.
"""

import cv2
import numpy as np
from typing import Tuple


class AdaptivePreprocessor:
    """
    Per-frame adaptive preprocessing for pose estimation reliability.

    Parameters
    ----------
    clahe_clip_limit : float
        CLAHE clip limit for dark frames.
    clahe_tile_grid : tuple
        CLAHE tile grid size.
    mild_clip_limit : float
        CLAHE clip limit for normal frames (subtle enhancement).
    dark_threshold : int
        Mean luminance below which frame is considered dark.
    bright_threshold : int
        Mean luminance above which frame is considered overexposed.
    bright_gamma : float
        Gamma value for bright frames (> 1.0 darkens).
    """

    def __init__(
        self,
        clahe_clip_limit: float = 3.0,
        clahe_tile_grid: Tuple[int, int] = (8, 8),
        mild_clip_limit: float = 1.5,
        dark_threshold: int = 80,
        bright_threshold: int = 200,
        bright_gamma: float = 1.5,
    ) -> None:
        self._clahe_dark = cv2.createCLAHE(
            clipLimit=clahe_clip_limit, tileGridSize=clahe_tile_grid
        )
        self._clahe_mild = cv2.createCLAHE(
            clipLimit=mild_clip_limit, tileGridSize=clahe_tile_grid
        )
        self._dark_threshold = dark_threshold
        self._bright_threshold = bright_threshold

        # Precompute gamma LUT
        inv_gamma = 1.0 / bright_gamma
        self._gamma_lut = np.array(
            [((i / 255.0) ** inv_gamma) * 255 for i in range(256)],
            dtype=np.uint8,
        )

        # Per-video stats
        self._frames_dark: int = 0
        self._frames_bright: int = 0
        self._frames_normal: int = 0

    def enhance(self, frame_bgr: np.ndarray) -> np.ndarray:
        """
        Apply adaptive preprocessing to a BGR frame.

        Parameters
        ----------
        frame_bgr : np.ndarray
            Input BGR image (as read by cv2.VideoCapture).

        Returns
        -------
        np.ndarray
            Enhanced BGR image, same shape.
        """
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        mean_luminance = int(np.mean(gray))

        if mean_luminance < self._dark_threshold:
            # Dark frame — aggressive CLAHE on L channel of LAB
            self._frames_dark += 1
            return self._apply_clahe(frame_bgr, self._clahe_dark)

        elif mean_luminance > self._bright_threshold:
            # Overexposed — gamma correction
            self._frames_bright += 1
            return cv2.LUT(frame_bgr, self._gamma_lut)

        else:
            # Normal — mild CLAHE for consistency
            self._frames_normal += 1
            return self._apply_clahe(frame_bgr, self._clahe_mild)

    def _apply_clahe(self, frame_bgr: np.ndarray, clahe: cv2.CLAHE) -> np.ndarray:
        """Apply CLAHE on the L channel of LAB color space."""
        lab = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        l_channel = clahe.apply(l_channel)
        enhanced_lab = cv2.merge([l_channel, a_channel, b_channel])
        return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    @property
    def stats(self) -> dict:
        """Return preprocessing statistics for this video."""
        total = self._frames_dark + self._frames_bright + self._frames_normal
        return {
            "total_frames_preprocessed": total,
            "dark_frames": self._frames_dark,
            "bright_frames": self._frames_bright,
            "normal_frames": self._frames_normal,
            "preprocessing_applied": True,
        }

    def reset(self) -> None:
        """Reset per-video counters."""
        self._frames_dark = 0
        self._frames_bright = 0
        self._frames_normal = 0

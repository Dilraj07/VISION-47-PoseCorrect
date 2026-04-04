"""
Personalization & Calibration System
=====================================
Extracts body proportions from a T-pose frame or user-supplied anthropometrics,
and dynamically adjusts exercise thresholds for different body types.

Flow:
1. User submits T-pose image → extract_proportions_from_tpose() → CalibrationProfile
2. OR user provides height/weight/age → CalibrationProfile from anthropometrics
3. Analyzer calls adjust_thresholds(base, profile) → personalized angle ranges
"""

import math
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, Optional, Tuple


@dataclass
class CalibrationProfile:
    """
    Stores body proportions extracted from T-pose or user input.
    All ratios are normalized (dimensionless).
    """
    # Limb length ratios (normalized to total height)
    torso_ratio: float = 0.30       # shoulder-to-hip / total_height
    femur_ratio: float = 0.25       # hip-to-knee / total_height
    tibia_ratio: float = 0.22       # knee-to-ankle / total_height
    upper_arm_ratio: float = 0.19   # shoulder-to-elbow / total_height
    forearm_ratio: float = 0.16     # elbow-to-wrist / total_height

    # Absolute measurements (if available)
    height_cm: float = 175.0
    weight_kg: float = 70.0
    age: int = 25

    # Derived
    bmi: float = 0.0
    limb_proportion_class: str = "average"  # short_limbed, average, long_limbed

    def __post_init__(self):
        if self.height_cm > 0 and self.weight_kg > 0:
            self.bmi = self.weight_kg / ((self.height_cm / 100.0) ** 2)

        # Classify limb proportions
        leg_ratio = self.femur_ratio + self.tibia_ratio
        if leg_ratio > 0.52:
            self.limb_proportion_class = "long_limbed"
        elif leg_ratio < 0.42:
            self.limb_proportion_class = "short_limbed"
        else:
            self.limb_proportion_class = "average"

    def to_dict(self) -> dict:
        return {
            "torso_ratio": round(self.torso_ratio, 4),
            "femur_ratio": round(self.femur_ratio, 4),
            "tibia_ratio": round(self.tibia_ratio, 4),
            "upper_arm_ratio": round(self.upper_arm_ratio, 4),
            "forearm_ratio": round(self.forearm_ratio, 4),
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "age": self.age,
            "bmi": round(self.bmi, 1),
            "limb_proportion_class": self.limb_proportion_class,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "CalibrationProfile":
        return cls(
            torso_ratio=data.get("torso_ratio", 0.30),
            femur_ratio=data.get("femur_ratio", 0.25),
            tibia_ratio=data.get("tibia_ratio", 0.22),
            upper_arm_ratio=data.get("upper_arm_ratio", 0.19),
            forearm_ratio=data.get("forearm_ratio", 0.16),
            height_cm=data.get("height_cm", 175.0),
            weight_kg=data.get("weight_kg", 70.0),
            age=data.get("age", 25),
        )


def _landmark_distance(lm_a, lm_b) -> float:
    """Euclidean distance between two MediaPipe NormalizedLandmark objects."""
    return math.sqrt(
        (lm_a.x - lm_b.x) ** 2 +
        (lm_a.y - lm_b.y) ** 2 +
        (lm_a.z - lm_b.z) ** 2
    )


def extract_proportions_from_tpose(landmarks) -> CalibrationProfile:
    """
    Extract body proportions from a T-pose frame.

    Parameters
    ----------
    landmarks : list of NormalizedLandmark
        33 MediaPipe pose landmarks from a T-pose frame.

    Returns
    -------
    CalibrationProfile with computed ratios.
    """
    # Key landmark indices
    L_SHOULDER, R_SHOULDER = 11, 12
    L_ELBOW, R_ELBOW = 13, 14
    L_WRIST, R_WRIST = 15, 16
    L_HIP, R_HIP = 23, 24
    L_KNEE, R_KNEE = 25, 26
    L_ANKLE, R_ANKLE = 27, 28

    # Compute segment lengths (average of left and right)
    torso_l = _landmark_distance(landmarks[L_SHOULDER], landmarks[L_HIP])
    torso_r = _landmark_distance(landmarks[R_SHOULDER], landmarks[R_HIP])
    torso = (torso_l + torso_r) / 2.0

    femur_l = _landmark_distance(landmarks[L_HIP], landmarks[L_KNEE])
    femur_r = _landmark_distance(landmarks[R_HIP], landmarks[R_KNEE])
    femur = (femur_l + femur_r) / 2.0

    tibia_l = _landmark_distance(landmarks[L_KNEE], landmarks[L_ANKLE])
    tibia_r = _landmark_distance(landmarks[R_KNEE], landmarks[R_ANKLE])
    tibia = (tibia_l + tibia_r) / 2.0

    upper_arm_l = _landmark_distance(landmarks[L_SHOULDER], landmarks[L_ELBOW])
    upper_arm_r = _landmark_distance(landmarks[R_SHOULDER], landmarks[R_ELBOW])
    upper_arm = (upper_arm_l + upper_arm_r) / 2.0

    forearm_l = _landmark_distance(landmarks[L_ELBOW], landmarks[L_WRIST])
    forearm_r = _landmark_distance(landmarks[R_ELBOW], landmarks[R_WRIST])
    forearm = (forearm_l + forearm_r) / 2.0

    # Total "height" proxy from landmarks (shoulder-to-ankle, since head isn't reliable)
    total_height = torso + femur + tibia
    if total_height < 0.01:
        total_height = 1.0  # Prevent division by zero

    return CalibrationProfile(
        torso_ratio=torso / total_height,
        femur_ratio=femur / total_height,
        tibia_ratio=tibia / total_height,
        upper_arm_ratio=upper_arm / total_height,
        forearm_ratio=forearm / total_height,
    )


def adjust_thresholds(
    base_thresholds: Dict[str, dict],
    profile: CalibrationProfile,
    exercise: str = "squat",
) -> Dict[str, dict]:
    """
    Adjust exercise angle thresholds based on body proportions.

    Parameters
    ----------
    base_thresholds : dict
        E.g. {"knee": {"range": (80, 100), "ideal": 90}, ...}
    profile : CalibrationProfile
        User's body proportions.
    exercise : str
        Exercise name.

    Returns
    -------
    dict with adjusted thresholds.

    Biomechanical rationale:
    - Long femurs relative to torso → deeper natural squat depth → widen knee angle range.
    - Higher BMI → more torso lean tolerance.
    - Short-limbed → tighter angle ranges (less ROM needed for parallel).
    """
    adjusted = {}
    for joint, params in base_thresholds.items():
        rng = list(params.get("range", (80, 100)))
        ideal = params.get("ideal", 90)

        if exercise in ("squat", "lunge"):
            if joint == "knee":
                # Long femur → natural deeper squat → widen range
                femur_adj = (profile.femur_ratio - 0.25) * 40  # ±5° per 0.125 ratio delta
                rng[0] = max(60, rng[0] - femur_adj)
                rng[1] = min(130, rng[1] + femur_adj)
                ideal = int(ideal - femur_adj * 0.5)

            if joint == "torso":
                # Higher BMI → more lean tolerance
                bmi_adj = max(0, (profile.bmi - 25) * 1.5)  # +1.5° per BMI point above 25
                rng[1] = min(70, rng[1] + bmi_adj)

        elif exercise in ("pushup", "benchpress"):
            if joint == "elbow":
                # Longer forearms → slightly wider elbow angle at bottom
                forearm_adj = (profile.forearm_ratio - 0.16) * 30
                rng[0] = max(60, rng[0] - forearm_adj)
                rng[1] = min(120, rng[1] + forearm_adj)

        elif exercise == "deadlift":
            if joint == "back_angle":
                # Long torso → naturally more upright start → tighter range
                torso_adj = (profile.torso_ratio - 0.30) * 20
                rng[0] = max(30, rng[0] + torso_adj)
                rng[1] = min(60, rng[1] - torso_adj * 0.5)

        adjusted[joint] = {
            "range": (int(rng[0]), int(rng[1])),
            "ideal": int(ideal),
        }

    return adjusted

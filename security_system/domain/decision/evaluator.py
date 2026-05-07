"""
Risk evaluator for security analysis results.

Responsible for:
- Determining the decision type (FAIL / WARN / PASS) from a risk score
- Providing the reasoning string for that determination

Contains no I/O, no side effects — pure evaluation logic.
"""

from __future__ import annotations

from security_system_v1.domain.models import AnalysisResult, DecisionType

# Thresholds inlined from security_system.config.constants
RISK_THRESHOLD_FAIL: float = 7.0  # Decision: FAIL (block commit)
RISK_THRESHOLD_WARN: float = 4.0  # Decision: WARN (allow with notification)


class RiskEvaluator:
    """
    Evaluates an AnalysisResult and returns a (DecisionType, reason) pair.

    Thresholds are injected at construction time so they can be adjusted
    per environment or overridden in tests without touching constants.

    Default thresholds:
        fail_threshold = 7.0  → FAIL if risk_score >= this
        warn_threshold = 4.0  → WARN if risk_score >= this
    """

    def __init__(
        self,
        fail_threshold: float = RISK_THRESHOLD_FAIL,
        warn_threshold: float = RISK_THRESHOLD_WARN,
    ) -> None:
        if warn_threshold >= fail_threshold:
            raise ValueError(
                f"warn_threshold ({warn_threshold}) must be "
                f"less than fail_threshold ({fail_threshold})"
            )
        self.fail_threshold = fail_threshold
        self.warn_threshold = warn_threshold

    def evaluate(self, result: AnalysisResult) -> tuple[DecisionType, str]:
        """
        Determines the security decision for a given AnalysisResult.

        Evaluation priority (highest first):
          1. Malicious intent flag set by LLM → FAIL immediately
          2. risk_score >= fail_threshold      → FAIL
          3. risk_score >= warn_threshold      → WARN
          4. Otherwise                         → PASS

        Args:
            result: The AnalysisResult produced by the LLM analyzer.

        Returns:
            A (DecisionType, reason) tuple.
        """
        if result.is_malicious:
            return (
                "FAIL",
                "Malicious intent detected by LLM analysis",
            )

        score = result.risk_score

        if score >= self.fail_threshold:
            return (
                "FAIL",
                f"Risk score {score:.1f} meets or exceeds fail threshold {self.fail_threshold}",
            )

        if score >= self.warn_threshold:
            return (
                "WARN",
                f"Risk score {score:.1f} meets or exceeds warn threshold {self.warn_threshold}",
            )

        return (
            "PASS",
            f"Risk score {score:.1f} is within acceptable range (threshold: {self.warn_threshold})",
        )

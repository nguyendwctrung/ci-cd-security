"""
AnalysisResult data model.

Represents the output produced by the LLM security analysis step.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List


@dataclass
class AnalysisResult:
	"""
	Output of the LLM-based security analysis.

	Attributes:
		timestamp:         ISO 8601 time when the analysis was performed.
		risk_score:        Numeric risk score in the range [0.0, 10.0].
		risk_level:        Human-readable risk label (LOW / MEDIUM / HIGH / CRITICAL).
		is_malicious:      True if the LLM flagged the commit as potentially malicious.
		detected_patterns: List of identified threat patterns (e.g. 'hardcoded secret').
		recommendations:   Suggested remediation actions.
		reasoning:         LLM's natural-language justification.
		scan_issues_count: Total number of issues from all scan tools.
		errors:            Non-fatal errors encountered during analysis.
	"""

	timestamp: str
	risk_score: float
	risk_level: str
	is_malicious: bool
	detected_patterns: List[str] = field(default_factory=list)
	recommendations: List[str] = field(default_factory=list)
	reasoning: str = ""
	scan_issues_count: int = 0
	errors: List[str] = field(default_factory=list)

	def to_dict(self) -> dict:
		return {
			"timestamp": self.timestamp,
			"risk_score": self.risk_score,
			"risk_level": self.risk_level,
			"is_malicious": self.is_malicious,
			"detected_patterns": self.detected_patterns,
			"recommendations": self.recommendations,
			"reasoning": self.reasoning,
			"scan_issues_count": self.scan_issues_count,
			"errors": self.errors,
		}

	@classmethod
	def fallback(cls, timestamp: str, error_message: str) -> "AnalysisResult":
		"""
		Creates a safe fallback result when LLM analysis fails.
		Risk score is set conservatively to WARN range (5.0).
		"""
		return cls(
			timestamp=timestamp,
			risk_score=5.0,
			risk_level="MEDIUM",
			is_malicious=False,
			detected_patterns=[],
			recommendations=["Manual review required — automated analysis failed."],
			reasoning="LLM analysis unavailable.",
			scan_issues_count=0,
			errors=[error_message],
		)

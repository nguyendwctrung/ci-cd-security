"""
Abstract base class for all security tool parsers.

Defines the shared interface and shared helpers (empty summary, severity map).
Every concrete parser must subclass BaseParser and implement `parse()`.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path

from security_system_v1.domain.models import SecurityIssue, Severity

logger = logging.getLogger(__name__)

# Canonical empty breakdown used as a safe default
_EMPTY_SEVERITY: dict[str, int] = {
	"LOW": 0,
	"MEDIUM": 0,
	"HIGH": 0,
	"CRITICAL": 0,
}


@dataclass
class ToolSummary:
	"""
	Aggregated results from a single scan tool.

	Attributes:
		tool:           Tool name (e.g. 'semgrep').
		total_findings: Total number of issues found.
		by_severity:    Issue count per severity level.
		issues:         Normalized SecurityIssue objects.
		average_score:  Mean severity score across all issues.
	"""

	tool: str
	total_findings: int
	by_severity: dict[str, int]
	issues: list[SecurityIssue]
	average_score: float

	def to_dict(self) -> dict:
		return {
			"tool": self.tool,
			"total_findings": self.total_findings,
			"by_severity": self.by_severity,
			"issues": [i.to_dict() for i in self.issues],
			"average_score": self.average_score,
		}


class BaseParser(ABC):
	"""
	Abstract base class for scan-tool parsers.

	Subclasses must implement `parse(report_path)` and set `tool_name`.
	"""

	tool_name: str = ""

	def parse_file(self, report_path: Path) -> ToolSummary:
		"""
		Public entry point.  Validates the path then delegates to `parse()`.
		Returns an empty ToolSummary if the file is missing.
		"""
		if not report_path.exists():
			logger.info("[%s] Report not found: %s", self.tool_name, report_path)
			return self._empty_summary()

		logger.info("[%s] Parsing report: %s", self.tool_name, report_path)
		try:
			return self.parse(report_path)
		except Exception as exc:  # pylint: disable=broad-except
			logger.warning("[%s] Failed to parse report: %s", self.tool_name, exc)
			return self._empty_summary()

	@abstractmethod
	def parse(self, report_path: Path) -> ToolSummary:
		"""
		Parse a scan-tool report and return normalized findings.

		Args:
			report_path: Guaranteed-existing path to the JSON report.

		Returns:
			ToolSummary with normalized SecurityIssue objects.
		"""

	def _empty_summary(self) -> ToolSummary:
		"""Returns a zero-finding summary for this tool."""
		return ToolSummary(
			tool=self.tool_name,
			total_findings=0,
			by_severity=dict(_EMPTY_SEVERITY),
			issues=[],
			average_score=0.0,
		)

	@staticmethod
	def _compute_average(issues: list[SecurityIssue]) -> float:
		"""Calculates the mean severity score; returns 0.0 for empty lists."""
		if not issues:
			return 0.0
		return round(sum(i.score for i in issues) / len(issues), 2)

	@staticmethod
	def _count_by_severity(issues: list[SecurityIssue]) -> dict[str, int]:
		"""Returns a severity-keyed count dict from a list of SecurityIssues."""
		counts: dict[str, int] = dict(_EMPTY_SEVERITY)
		for issue in issues:
			level = issue.severity.value
			if level in counts:
				counts[level] += 1
		return counts

	@staticmethod
	def _normalize_severity(raw: str, mapping: dict[str, str]) -> Severity:
		"""
		Maps a tool-specific severity string to a canonical Severity value.

		Args:
			raw:     Raw severity string from the tool (case-insensitive).
			mapping: Dict of tool-label -> canonical-label (e.g. {"ERROR": "HIGH"}).
		"""
		canonical = mapping.get(raw.upper(), "MEDIUM")
		return Severity.from_string(canonical)

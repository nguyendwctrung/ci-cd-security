"""
Semgrep parser.

Reads the semgrep-report.json produced by:
	semgrep --config=p/security-audit --json --output <file>

Semgrep uses its own severity labels (INFO / WARNING / ERROR).
These are mapped to the canonical levels used by this system.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from security_system_v1.domain.models import SecurityIssue

from .base import BaseParser, ToolSummary

logger = logging.getLogger(__name__)

SEMGREP_SEVERITY_MAP: dict[str, str] = {
	"INFO": "LOW",
	"WARNING": "MEDIUM",
	"ERROR": "HIGH",
}

# Maximum characters preserved from a Semgrep message for readability
_MESSAGE_MAX_LEN = 200


class SemgrepParser(BaseParser):
	"""Parses Semgrep JSON report into normalized SecurityIssue objects."""

	tool_name = "semgrep"

	def parse(self, report_path: Path) -> ToolSummary:
		with report_path.open("r", encoding="utf-8") as fh:
			raw = json.load(fh)

		results: list = raw.get("results", [])
		issues: list[SecurityIssue] = []

		for result in results:
			severity = self._normalize_severity(
				result.get("severity", ""),
				SEMGREP_SEVERITY_MAP,
			)

			rule_id = result.get("check_id", "unknown-rule")
			message = result.get("extra", {}).get("message", "No message provided")
			message = message[:_MESSAGE_MAX_LEN]

			issue = SecurityIssue(
				tool=self.tool_name,
				severity=severity,
				type=rule_id,
				message=message,
				file=result.get("path"),
				line=result.get("start", {}).get("line"),
			)
			issues.append(issue)

		logger.info("[%s] Found %d finding(s)", self.tool_name, len(issues))

		return ToolSummary(
			tool=self.tool_name,
			total_findings=len(issues),
			by_severity=self._count_by_severity(issues),
			issues=issues,
			average_score=self._compute_average(issues),
		)

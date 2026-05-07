"""
Gitleaks parser.

Reads the gitleaks-report.json produced by:
	gitleaks detect --report-format json --report-path <file>

Gitleaks reports detected secrets. All findings are treated as HIGH or
CRITICAL depending on Shannon entropy — secrets are inherently high risk.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from security_system_v1.domain.models import SecurityIssue, Severity

from .base import BaseParser, ToolSummary

logger = logging.getLogger(__name__)

# Entropy threshold above which a secret is escalated to CRITICAL
_CRITICAL_ENTROPY_THRESHOLD = 4.5

# Maximum characters preserved from the matched secret (for message context)
_MATCH_PREVIEW_LEN = 50


class GitleaksParser(BaseParser):
	"""Parses Gitleaks JSON report into normalized SecurityIssue objects."""

	tool_name = "gitleaks"

	def parse(self, report_path: Path) -> ToolSummary:
		with report_path.open("r", encoding="utf-8") as fh:
			raw = json.load(fh)

		# Gitleaks v8 wraps findings under a top-level "Leaks" key;
		# some versions emit a plain list.
		leaks: list = raw if isinstance(raw, list) else raw.get("Leaks", [])

		issues: list[SecurityIssue] = []

		for leak in leaks:
			severity = self._severity_from_entropy(leak.get("Entropy", 0.0))
			secret_type = leak.get("RuleID") or leak.get("SecretType") or "unknown-secret"
			match_preview = str(leak.get("Match", ""))[:_MATCH_PREVIEW_LEN]

			issue = SecurityIssue(
				tool=self.tool_name,
				severity=severity,
				type=secret_type,
				message=f"Secret detected ({secret_type}): {match_preview}",
				file=leak.get("File") or leak.get("Path"),
				line=leak.get("StartLine") or leak.get("Line"),
			)
			issues.append(issue)

		logger.info("[%s] Found %d secret(s)", self.tool_name, len(issues))

		return ToolSummary(
			tool=self.tool_name,
			total_findings=len(issues),
			by_severity=self._count_by_severity(issues),
			issues=issues,
			average_score=self._compute_average(issues),
		)

	@staticmethod
	def _severity_from_entropy(entropy: float) -> Severity:
		"""
		Escalates to CRITICAL for high-entropy secrets; otherwise HIGH.
		All Gitleaks findings are at minimum HIGH — they are exposed secrets.
		"""
		if entropy >= _CRITICAL_ENTROPY_THRESHOLD:
			return Severity.CRITICAL
		return Severity.HIGH

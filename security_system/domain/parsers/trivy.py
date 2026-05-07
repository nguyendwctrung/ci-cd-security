"""
Trivy parser.

Reads the trivy-report.json produced by:
	trivy fs --severity HIGH,CRITICAL --format json --output <file>

Trivy reports cover both vulnerabilities (CVEs) and misconfigurations.
Both result types are normalized into SecurityIssue objects.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from security_system_v1.domain.models import SecurityIssue

from .base import BaseParser, ToolSummary

logger = logging.getLogger(__name__)

TRIVY_SEVERITY_MAP: dict[str, str] = {
	"LOW": "LOW",
	"MEDIUM": "MEDIUM",
	"HIGH": "HIGH",
	"CRITICAL": "CRITICAL",
}

# Maximum characters preserved from a Trivy description
_DESC_MAX_LEN = 150


class TrivyParser(BaseParser):
	"""Parses Trivy JSON report into normalized SecurityIssue objects."""

	tool_name = "trivy"

	def parse(self, report_path: Path) -> ToolSummary:
		with report_path.open("r", encoding="utf-8") as fh:
			raw = json.load(fh)

		results: list = raw.get("Results", [])
		issues: list[SecurityIssue] = []

		for result in results:
			target = result.get("Target", "unknown")
			issues.extend(self._parse_vulnerabilities(result, target))
			issues.extend(self._parse_misconfigurations(result, target))

		logger.info("[%s] Found %d finding(s)", self.tool_name, len(issues))

		return ToolSummary(
			tool=self.tool_name,
			total_findings=len(issues),
			by_severity=self._count_by_severity(issues),
			issues=issues,
			average_score=self._compute_average(issues),
		)

	def _parse_vulnerabilities(
		self,
		result: dict,
		target: str,
	) -> list[SecurityIssue]:
		"""Converts Trivy Vulnerabilities entries into SecurityIssue objects."""
		issues: list[SecurityIssue] = []

		for vuln in result.get("Vulnerabilities", []):
			severity = self._normalize_severity(
				vuln.get("Severity", ""),
				TRIVY_SEVERITY_MAP,
			)
			pkg = vuln.get("PkgName", "unknown-package")
			cve_id = vuln.get("VulnerabilityID", "unknown-cve")
			title = vuln.get("Title") or vuln.get("Description", "")
			title = title[:_DESC_MAX_LEN]

			issues.append(SecurityIssue(
				tool=self.tool_name,
				severity=severity,
				type=cve_id,
				message=f"{pkg}: {title}",
				file=target,
				line=None,
			))

		return issues

	def _parse_misconfigurations(
		self,
		result: dict,
		target: str,
	) -> list[SecurityIssue]:
		"""Converts Trivy Misconfigurations entries into SecurityIssue objects."""
		issues: list[SecurityIssue] = []

		for misconfig in result.get("Misconfigurations", []):
			severity = self._normalize_severity(
				misconfig.get("Severity", ""),
				TRIVY_SEVERITY_MAP,
			)
			rule_id = misconfig.get("ID", "unknown-rule")
			title = misconfig.get("Title", "")
			desc = misconfig.get("Description", "")[:_DESC_MAX_LEN]
			message = f"{title}: {desc}" if title else desc

			issues.append(SecurityIssue(
				tool=self.tool_name,
				severity=severity,
				type=rule_id,
				message=message,
				file=target,
				line=None,
			))

		return issues

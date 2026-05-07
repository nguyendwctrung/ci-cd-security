"""
run_scan use case — orchestrates scanner execution and parsing.

Dependency flow:
  infrastructure/scanners → (raw JSON files) → domain/parsers → ScanOutput

No business logic here. Only wires infra CLI runners to domain parsers.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List

from security_system_v1.domain.models import SecurityIssue
from security_system_v1.domain.parsers import (
	GitleaksParser,
	SemgrepParser,
	TrivyParser,
	ToolSummary,
)
from security_system_v1.infrastructure.scanners import run_gitleaks, run_semgrep, run_trivy
from security_system_v1.infrastructure.storage.artifact_store import (
	GITLEAKS_REPORT,
	SEMGREP_REPORT,
	TRIVY_REPORT,
)

logger = logging.getLogger(__name__)


@dataclass
class ScanOutput:
	"""
	Result of the scan step.

	Attributes:
		summaries:  Per-tool ToolSummary objects (normalized findings + stats).
		raw_data:   Raw JSON findings per tool — used to build LLM prompt.
		all_issues: Flat list of all normalized SecurityIssue objects.
	"""

	summaries: Dict[str, ToolSummary] = field(default_factory=dict)
	raw_data: Dict[str, List[Any]] = field(default_factory=dict)
	all_issues: List[SecurityIssue] = field(default_factory=list)


def run_scan(target: Path, reports_dir: Path) -> ScanOutput:
	"""
	Run all three security scanners against *target* and return normalized output.

	Steps:
	  1. Execute Gitleaks / Semgrep / Trivy CLI via infrastructure adapters,
		 writing JSON reports to *reports_dir*.
	  2. Parse each report with the corresponding domain parser.
	  3. Build raw_data dict (for LLM prompt consumption).
	  4. Return ScanOutput.

	Args:
		target:      Path to the repository or directory to scan.
		reports_dir: Directory where scanner JSON reports will be written.

	Returns:
		ScanOutput with summaries, raw findings, and flattened issue list.

	Raises:
		RuntimeError: If a scanner binary is not found (returns None).
	"""
	reports_dir.mkdir(parents=True, exist_ok=True)

	gl_path = reports_dir / GITLEAKS_REPORT
	sg_path = reports_dir / SEMGREP_REPORT
	tv_path = reports_dir / TRIVY_REPORT

	# --- Step 1: Run scanners (CLI via infra) --------------------------------
	logger.info("Running Gitleaks on %s", target)
	gl_raw = run_gitleaks(target, output_path=gl_path)
	if gl_raw is None:
		raise RuntimeError("Gitleaks scanner failed or is not installed.")

	logger.info("Running Semgrep on %s", target)
	sg_raw = run_semgrep(target, output_path=sg_path)
	if sg_raw is None:
		raise RuntimeError("Semgrep scanner failed or is not installed.")

	logger.info("Running Trivy on %s", target)
	tv_raw = run_trivy(target, output_path=tv_path)
	if tv_raw is None:
		raise RuntimeError("Trivy scanner failed or is not installed.")

	# --- Step 2: Parse with domain parsers -----------------------------------
	logger.info("Parsing scan reports")
	gl_summary = GitleaksParser().parse_file(gl_path)
	sg_summary = SemgrepParser().parse_file(sg_path)
	tv_summary = TrivyParser().parse_file(tv_path)

	summaries: Dict[str, ToolSummary] = {
		"gitleaks": gl_summary,
		"semgrep": sg_summary,
		"trivy": tv_summary,
	}

	# --- Step 3: Build raw_data for LLM prompt --------------------------------
	raw_data: Dict[str, List[Any]] = {
		"gitleaks": gl_raw,
		"semgrep": sg_raw,
		"trivy": tv_raw,
	}

	# --- Step 4: Flatten all issues -------------------------------------------
	all_issues: List[SecurityIssue] = [
		issue
		for summary in summaries.values()
		for issue in summary.issues
	]

	logger.info(
		"Scan complete — %d total findings (%d gitleaks, %d semgrep, %d trivy)",
		len(all_issues),
		len(gl_summary.issues),
		len(sg_summary.issues),
		len(tv_summary.issues),
	)

	return ScanOutput(summaries=summaries, raw_data=raw_data, all_issues=all_issues)

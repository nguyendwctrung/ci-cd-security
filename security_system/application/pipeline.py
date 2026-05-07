"""
Security pipeline orchestrator.

Wires together all layers in sequence:
  1. run_scan    — CLI scanners + domain parsers
  2. analyze     — LLM analysis (injected GeminiProvider)
  3. make_decision — domain risk evaluation
  4. Save artifacts via infrastructure/storage

Contains NO business logic — only calls use cases and saves results.

Entry point:
	python -m security_system_v1.application.pipeline
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Optional

from security_system_v1.application.use_cases.run_scan import run_scan
from security_system_v1.application.use_cases.analyze import analyze
from security_system_v1.application.use_cases.make_decision import make_decision, _build_summary_dict
from security_system_v1.config.constants import REPORTS_DIR as DEFAULT_REPORTS_DIR
from security_system_v1.domain.models import DecisionReport
from security_system_v1.domain.services import GitService
from security_system_v1.infrastructure.storage import ArtifactStore, ensure_dir

logger = logging.getLogger(__name__)


def run_pipeline(
    target: Path = Path("."),
    reports_dir: Path = DEFAULT_REPORTS_DIR,
    *,
    api_key: Optional[str] = None,
) -> DecisionReport:
	"""
	Execute the full CI/CD security pipeline.

	Args:
		target:      Repository or directory to scan (default: current dir).
		reports_dir: Where to write all reports (default: reports/artifacts/).
		api_key:     Explicit Gemini API key; falls back to GOOGLE_API_KEY env var.

	Returns:
		DecisionReport with PASS / WARN / FAIL decision.

	Raises:
		RuntimeError: If any scanner binary is missing.
	"""
	ensure_dir(reports_dir)

	logger.info("=" * 60)
	logger.info("CI/CD Security Pipeline started (target: %s)", target)
	logger.info("=" * 60)

	# --- Step 1: Git context --------------------------------------------------
	logger.info("Step 1/4 — Collecting git context")
	git_ctx = GitService().get_context()
	logger.info("Commit: %s by %s", git_ctx.commit_hash, git_ctx.author)

	# --- Step 2: Scan ---------------------------------------------------------
	logger.info("Step 2/4 — Running security scanners")
	scan_output = run_scan(target, reports_dir)

	# --- Step 3: Analyze ------------------------------------------------------
	logger.info("Step 3/4 — Running LLM analysis")
	analysis = analyze(scan_output, git_ctx, api_key=api_key)

	# --- Step 4: Decide -------------------------------------------------------
	logger.info("Step 4/4 — Making security decision")
	report = make_decision(analysis, scan_output.summaries, reports_dir)

	# --- Save artifacts -------------------------------------------------------
	store = ArtifactStore(reports_dir)
	store.save_analysis(analysis.to_dict())
	store.save_decision(report.to_dict())
	store.save_summary(_build_summary_dict(scan_output.summaries))

	logger.info("=" * 60)
	logger.info("Pipeline complete — decision: %s", report.decision)
	logger.info("=" * 60)

	return report


# ---------------------------------------------------------------------------
# Module entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
	logging.basicConfig(
		level=logging.INFO,
		format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
	)
	decision = run_pipeline()
	sys.exit(decision.exit_code())

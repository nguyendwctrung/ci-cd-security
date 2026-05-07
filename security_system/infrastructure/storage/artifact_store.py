"""
Artifact store — infrastructure adapter for persisting pipeline reports.

Handles saving the structured output artifacts produced by the pipeline:
  - AI analysis report
  - Decision report
  - Scan summary

No business logic. Delegates all file I/O to ``file_store``.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict

from security_system_v1.config.constants import (
    REPORTS_DIR as DEFAULT_REPORTS_DIR,
    GITLEAKS_REPORT,
    SEMGREP_REPORT,
    TRIVY_REPORT,
    SUMMARY_REPORT,
    AI_ANALYSIS_REPORT,
    DECISION_REPORT,
)
from .file_store import ensure_dir, write_json

logger = logging.getLogger(__name__)

__all__ = [
    "DEFAULT_REPORTS_DIR",
    "GITLEAKS_REPORT",
    "SEMGREP_REPORT",
    "TRIVY_REPORT",
    "SUMMARY_REPORT",
    "AI_ANALYSIS_REPORT",
    "DECISION_REPORT",
    "ArtifactStore",
]


class ArtifactStore:
    """
    Saves pipeline artifacts (reports) to a configurable reports directory.

    Usage:
        store = ArtifactStore(reports_dir=Path("reports"))
        store.save_analysis(result.to_dict())
        store.save_decision(report.to_dict())
        store.save_summary(summary_dict)
    """

    def __init__(self, reports_dir: Path) -> None:
        self._reports_dir = reports_dir
        ensure_dir(reports_dir)

    # ------------------------------------------------------------------
    # Public save methods
    # ------------------------------------------------------------------

    def save_analysis(self, data: Dict[str, Any]) -> bool:
        """Persist the AI analysis report."""
        return self._save(AI_ANALYSIS_REPORT, data)

    def save_decision(self, data: Dict[str, Any]) -> bool:
        """Persist the decision report."""
        return self._save(DECISION_REPORT, data)

    def save_summary(self, data: Dict[str, Any]) -> bool:
        """Persist the aggregated scan summary."""
        return self._save(SUMMARY_REPORT, data)

    def save_scanner_report(self, tool: str, data: Any) -> bool:
        """
        Persist a raw scanner JSON output.

        Args:
            tool: One of ``"gitleaks"``, ``"semgrep"``, or ``"trivy"``.
            data: JSON-serialisable report data.
        """
        name_map = {
            "gitleaks": GITLEAKS_REPORT,
            "semgrep": SEMGREP_REPORT,
            "trivy": TRIVY_REPORT,
        }
        filename = name_map.get(tool)
        if not filename:
            logger.error("Unknown scanner tool: %s", tool)
            return False
        return self._save(filename, data)

    def report_path(self, filename: str) -> Path:
        """Return the absolute path for a report file inside the reports dir."""
        return self._reports_dir / filename

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _save(self, filename: str, data: Any) -> bool:
        path = self._reports_dir / filename
        success = write_json(path, data)
        if success:
            logger.info("Artifact saved: %s", path)
        return success

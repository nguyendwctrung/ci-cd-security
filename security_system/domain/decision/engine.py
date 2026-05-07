"""
Decision engine for CI/CD pipeline security enforcement.

Responsible for:
- Combining AnalysisResult + optional scan summary into a DecisionReport
- Logging the outcome
- Persisting the report to disk via utils.file_utils

Delegates pure risk evaluation to RiskEvaluator.
"""

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from security_system_v1.domain.models import AnalysisResult, DecisionReport
from security_system_v1.utils.file_utils import write_json
from .evaluator import RiskEvaluator

logger = logging.getLogger(__name__)

# Report filename constant inlined from security_system.config.constants
DECISION_REPORT: str = "decision_report.json"


class DecisionEngine:
    """
    Produces and persists a DecisionReport from an AnalysisResult.

    Usage:
        engine = DecisionEngine(reports_dir=Path("/some/dir"))
        report = engine.decide(analysis_result)
        engine.save(report)
    """

    def __init__(
        self,
        reports_dir: Path,
        evaluator: Optional[RiskEvaluator] = None,
    ) -> None:
        self._evaluator = evaluator or RiskEvaluator()
        self._reports_dir = reports_dir

    def decide(
        self,
        result: AnalysisResult,
        summary: Optional[Dict[str, Any]] = None,
    ) -> DecisionReport:
        """
        Builds a DecisionReport from the analysis result.

        Args:
            result:  AnalysisResult from the LLM analyzer.
            summary: Optional aggregated scan summary (adds context to metadata).

        Returns:
            A fully populated DecisionReport.
        """
        decision, reason = self._evaluator.evaluate(result)

        metadata = self._build_metadata(result, summary)

        report = DecisionReport(
            timestamp=result.timestamp or datetime.now().isoformat(),
            decision=decision,
            reason=reason,
            risk_score=result.risk_score,
            is_malicious=result.is_malicious,
            fail_threshold=self._evaluator.fail_threshold,
            warn_threshold=self._evaluator.warn_threshold,
            detected_patterns=list(result.detected_patterns),
            recommendations=list(result.recommendations),
            metadata=metadata,
        )

        self._log_decision(report)
        return report

    def save(self, report: DecisionReport) -> bool:
        """
        Persists the DecisionReport to JSON.

        Returns:
            True on success, False on failure.
        """
        output_path = self._reports_dir / DECISION_REPORT
        success = write_json(output_path, report.to_dict())
        if success:
            logger.info("Decision report saved to %s", output_path)
        return success

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _build_metadata(
        result: AnalysisResult,
        summary: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Assembles the metadata block stored in the DecisionReport."""
        metadata: Dict[str, Any] = {
            "risk_level": result.risk_level,
            "scan_issues_count": result.scan_issues_count,
            "patterns_count": len(result.detected_patterns),
            "recommendations_count": len(result.recommendations),
            "analysis_errors": len(result.errors),
        }

        if summary:
            metadata["scan_summary"] = {
                "total_findings": summary.get("total_findings", 0),
                "by_tool": summary.get("by_tool", {}),
                "by_severity": summary.get("by_severity", {}),
                "overall_score": summary.get("overall_score", 0.0),
            }

        return metadata

    @staticmethod
    def _log_decision(report: DecisionReport) -> None:
        """Emits a structured log line for the final decision."""
        log_fn = {
            "FAIL": logger.error,
            "WARN": logger.warning,
            "PASS": logger.info,
        }.get(report.decision, logger.info)

        log_fn(
            "[%s] Risk=%.1f | Malicious=%s | %s",
            report.decision,
            report.risk_score,
            report.is_malicious,
            report.reason,
        )

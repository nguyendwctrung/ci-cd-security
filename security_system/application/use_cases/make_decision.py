"""
make_decision use case — orchestrates risk evaluation and report creation.

Dependency flow:
  AnalysisResult + summaries → domain/decision/DecisionEngine → DecisionReport

No business logic here. Only assembles inputs and calls the domain engine.
"""

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from security_system_v1.domain.decision import DecisionEngine
from security_system_v1.domain.models import AnalysisResult, DecisionReport
from security_system_v1.domain.parsers import ToolSummary

logger = logging.getLogger(__name__)


def make_decision(
	analysis: AnalysisResult,
	summaries: Dict[str, ToolSummary],
	reports_dir: Path,
) -> DecisionReport:
	"""
	Evaluate the analysis result and produce a final DecisionReport.

	Args:
		analysis:    AnalysisResult from the analyze use case.
		summaries:   Per-tool ToolSummary objects from the run_scan use case.
		reports_dir: Directory where the decision report will be persisted.

	Returns:
		DecisionReport with PASS / WARN / FAIL decision.
	"""
	summary_dict = _build_summary_dict(summaries)

	engine = DecisionEngine(reports_dir=reports_dir)
	report = engine.decide(analysis, summary_dict)

	logger.info("Decision: %s (risk=%.1f)", report.decision, report.risk_score)
	return report


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _build_summary_dict(summaries: Dict[str, ToolSummary]) -> Dict[str, Any]:
	"""
	Aggregates ToolSummary objects into the summary dict expected by
	DecisionEngine.decide() as optional metadata.
	"""
	by_severity: Dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
	for ts in summaries.values():
		for level, count in ts.by_severity.items():
			by_severity[level] = by_severity.get(level, 0) + count

	total = sum(ts.total_findings for ts in summaries.values())
	avg_score = (
		sum(ts.average_score for ts in summaries.values()) / len(summaries)
		if summaries
		else 0.0
	)

	return {
		"timestamp": datetime.now().isoformat(),
		"total_findings": total,
		"by_tool": {name: ts.total_findings for name, ts in summaries.items()},
		"by_severity": by_severity,
		"overall_score": round(avg_score, 1),
		"tools": [ts.to_dict() for ts in summaries.values()],
	}

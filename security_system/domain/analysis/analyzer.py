"""
LLM security analyzer orchestration.

Coordinates:
  1. Building analysis prompt from git and scan data
  2. Calling LLM client via injected dependency
  3. Validating and mapping response to AnalysisResult
  4. Returning conservative fallback on any error
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional, Protocol

from security_system.domain.models import AnalysisResult, GitContext
from .llm_client import normalize_analysis_payload
from .prompts import SYSTEM_PROMPT, build_analysis_prompt

logger = logging.getLogger(__name__)

class LLMClientProtocol(Protocol):
	"""Interface-like dependency for LLM generation."""

	def generate_json(self, system_prompt: str, user_prompt: str) -> Optional[dict]:
		"""Generate a JSON-like dict from prompts."""

class LLMAnalyzer:
	"""
	Orchestrates LLM-based security analysis.

	Usage:
		analyzer = LLMAnalyzer(llm_client)
		result = analyzer.analyze(git_ctx, scan_data)
	"""

	def __init__(self, llm_client: LLMClientProtocol) -> None:
		self._client = llm_client

	def analyze(
		self,
		git_ctx: GitContext,
		scan_data: Dict[str, Any],
	) -> AnalysisResult:
		"""
		Run LLM analysis and return AnalysisResult.

		Always returns valid AnalysisResult — uses conservative fallback
		(risk_score=5.0, MEDIUM) if LLM call fails or response is invalid.

		Args:
			git_ctx:   Commit metadata and diff
			scan_data: Raw results from {gitleaks, semgrep, trivy}

		Returns:
			AnalysisResult (never raises)
		"""
		timestamp = datetime.now().isoformat()
		issue_count = sum(
			len(scan_data.get(tool, []))
			for tool in ("gitleaks", "semgrep", "trivy")
		)

		logger.info("Starting LLM analysis (commit: %s)", git_ctx.commit_hash)

		# Call LLM client (returns dict or None)
		user_prompt = build_analysis_prompt(git_ctx, scan_data)
		raw = self._client.generate_json(SYSTEM_PROMPT, user_prompt)

		# Case 1: LLM API call failed
		if raw is None:
			logger.warning("LLM call returned no response")
			return AnalysisResult.fallback(
				timestamp,
				"LLM call returned no response",
			)

		# Case 2: Response is not a dict
		if not isinstance(raw, dict):
			logger.warning("LLM response is not a dict: %s", type(raw))
			return AnalysisResult.fallback(timestamp, "Invalid LLM response format")

		normalized, error = normalize_analysis_payload(raw, scan_data)
		if error or normalized is None:
			logger.warning("LLM response normalization failed: %s", error)
			return AnalysisResult.fallback(
				timestamp,
				error or "Invalid LLM response format",
			)

		# All validations passed — build result
		return AnalysisResult(
			timestamp=timestamp,
			risk_score=float(normalized["risk_score"]),
			risk_level=str(normalized["risk_level"]),
			is_malicious=bool(normalized["is_malicious"]),
			detected_patterns=list(normalized["detected_patterns"]),
			recommendations=list(normalized["recommendations"]),
			reasoning=str(normalized["reasoning"]),
			scan_issues_count=issue_count,
			errors=[],
		)

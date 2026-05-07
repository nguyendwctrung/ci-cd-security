"""
analyze use case — orchestrates LLM security analysis.

Dependency flow:
  infrastructure/llm/GeminiProvider → injected into → domain/analysis/LLMAnalyzer

No prompt logic or scoring lives here.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from security_system_v1.domain.analysis import LLMAnalyzer
from security_system_v1.domain.models import AnalysisResult, GitContext
from .run_scan import ScanOutput

logger = logging.getLogger(__name__)


def analyze(
	scan_output: ScanOutput,
	git_ctx: GitContext,
	*,
	api_key: Optional[str] = None,
) -> AnalysisResult:
	"""
	Run LLM security analysis on scan findings and return an AnalysisResult.

	If the LLM provider cannot be initialised (e.g. missing API key), a
	conservative fallback AnalysisResult is returned instead of raising.

	Args:
		scan_output: Output from the run_scan use case.
		git_ctx:     Git commit context for prompt construction.
		api_key:     Optional explicit Gemini API key.
					 Falls back to GOOGLE_API_KEY environment variable.

	Returns:
		AnalysisResult — never raises.
	"""
	timestamp = datetime.now().isoformat()

	# Import provider here to keep infrastructure out of module-level scope
	# and to enable easy mocking in tests.
	try:
		from security_system_v1.infrastructure.llm import GeminiProvider
		provider = GeminiProvider(api_key=api_key)
	except EnvironmentError as exc:
		logger.warning("LLM provider unavailable — using fallback: %s", exc)
		return AnalysisResult.fallback(timestamp, str(exc))

	analyzer = LLMAnalyzer(provider)
	return analyzer.analyze(git_ctx, scan_output.raw_data)

"""
Utilities for LLM response parsing and normalization.

This module keeps LLM-output safety checks in one place:
- Extract and parse strict JSON from model text
- Enforce scanner-aligned severity vocabulary
- Filter obvious non-English responses
- Normalize lists/strings for stable report quality
"""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Tuple

SEVERITY_ORDER: tuple[str, ...] = ("LOW", "MEDIUM", "HIGH", "CRITICAL")
_SEVERITY_SET = set(SEVERITY_ORDER)

# Common Indonesian / Vietnamese terms used as a defensive language gate.
_NON_ENGLISH_TOKENS = {
	"penggunaan",
	"kerentanan",
	"berbahaya",
	"dari",
	"pada",
	"dengan",
	"dan",
	"yang",
	"khong",
	"không",
	"nguy",
	"hiem",
	"bao",
	"mat",
}


def normalize_severity(value: Any, default: str = "MEDIUM") -> str:
	"""Normalize severity label to LOW/MEDIUM/HIGH/CRITICAL."""
	if value is None:
		return default
	label = str(value).strip().upper()
	return label if label in _SEVERITY_SET else default


def _severity_rank(label: str) -> int:
	"""Return ordinal rank for a normalized severity label."""
	return SEVERITY_ORDER.index(label)


def max_scanner_severity(scan_data: Dict[str, Any]) -> str:
	"""Return highest scanner severity found across Semgrep/Trivy/Gitleaks."""
	max_level = "LOW"

	def _bump(candidate: Any) -> None:
		nonlocal max_level
		level = normalize_severity(candidate, default="LOW")
		if _severity_rank(level) > _severity_rank(max_level):
			max_level = level

	for item in scan_data.get("semgrep", []):
		_bump(item.get("severity") or item.get("extra", {}).get("severity"))

	for item in scan_data.get("gitleaks", []):
		_bump(item.get("Severity") or item.get("severity"))

	for group in scan_data.get("trivy", []):
		for vuln in group.get("Vulnerabilities", []):
			_bump(vuln.get("Severity"))

	return max_level


def extract_json_payload(text: str) -> str:
	"""Extract probable JSON object text from an LLM response."""
	candidate = text.strip()

	if candidate.startswith("```"):
		candidate = candidate.split("\n", 1)[-1]
		candidate = candidate.rsplit("```", 1)[0].strip()

	start = candidate.find("{")
	end = candidate.rfind("}")
	if start == -1 or end == -1 or end < start:
		return candidate

	return candidate[start : end + 1]


def parse_llm_json_response(text: str) -> Optional[Dict[str, Any]]:
	"""Parse JSON dict from model text. Returns None on malformed payload."""
	json_text = extract_json_payload(text)
	try:
		obj = json.loads(json_text)
		return obj if isinstance(obj, dict) else None
	except json.JSONDecodeError:
		return None


def _has_non_english_tokens(value: str) -> bool:
	"""Detect obvious non-English tokens to reject mixed-language output."""
	words = re.findall(r"[a-zA-Z\u00C0-\u024F']+", value.lower())
	return any(token in _NON_ENGLISH_TOKENS for token in words)


def is_english_only_payload(payload: Dict[str, Any]) -> bool:
	"""Best-effort language gate for textual fields in LLM output."""
	chunks: List[str] = []

	reasoning = payload.get("reasoning", "")
	if isinstance(reasoning, str):
		chunks.append(reasoning)

	for key in ("detected_patterns", "recommendations"):
		value = payload.get(key, [])
		if isinstance(value, list):
			chunks.extend(str(item) for item in value)

	return not any(_has_non_english_tokens(chunk) for chunk in chunks if chunk)


def _clean_text_list(values: Any, *, limit: int, max_len: int) -> List[str]:
	"""Normalize a list of short strings, removing empty and duplicate values."""
	if not isinstance(values, list):
		return []

	cleaned: List[str] = []
	seen = set()
	for item in values:
		text = " ".join(str(item).split()).strip()
		if not text:
			continue
		if len(text) > max_len:
			text = text[: max_len - 1].rstrip() + "…"
		key = text.lower()
		if key in seen:
			continue
		seen.add(key)
		cleaned.append(text)
		if len(cleaned) >= limit:
			break
	return cleaned


def normalize_analysis_payload(
	raw: Dict[str, Any],
	scan_data: Dict[str, Any],
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
	"""
	Validate and normalize LLM output payload for AnalysisResult mapping.

	Returns:
		(normalized_payload, error_message)
	"""
	if not isinstance(raw, dict):
		return None, "Invalid LLM response format"

	for field in ("risk_score", "risk_level", "is_malicious"):
		if field not in raw:
			return None, f"Missing required fields: {field}"

	risk_score_value = raw["risk_score"]
	try:
		risk_score = float(risk_score_value)
	except (TypeError, ValueError):
		return None, "Invalid risk_score value"

	if risk_score < 0.0 or risk_score > 10.0:
		return None, "risk_score out of range"

	max_scan_level = max_scanner_severity(scan_data)
	model_level = normalize_severity(raw.get("risk_level"), default="MEDIUM")
	risk_level = model_level
	if _severity_rank(model_level) > _severity_rank(max_scan_level):
		risk_level = max_scan_level

	payload: Dict[str, Any] = {
		"risk_score": round(risk_score, 2),
		"risk_level": risk_level,
		"is_malicious": bool(raw.get("is_malicious", False)),
		"detected_patterns": _clean_text_list(raw.get("detected_patterns", []), limit=8, max_len=120),
		"recommendations": _clean_text_list(raw.get("recommendations", []), limit=8, max_len=160),
		"reasoning": " ".join(str(raw.get("reasoning", "")).split()).strip(),
	}

	if not payload["recommendations"]:
		payload["recommendations"] = [
			"Verify findings manually and confirm exploitability before remediation.",
			"Patch affected dependencies and rerun Trivy/Semgrep in CI.",
		]

	if not payload["reasoning"]:
		payload["reasoning"] = "Risk assessment based on scanner findings and commit context."

	if not is_english_only_payload(payload):
		return None, "Non-English content detected in LLM response"

	return payload, None

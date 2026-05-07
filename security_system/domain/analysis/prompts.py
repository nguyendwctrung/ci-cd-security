"""
Prompt templates for LLM security analysis.

Keeps all prompt engineering in one place.
`build_analysis_prompt()` is the single entry point used by the analyzer.
"""

from __future__ import annotations

from typing import Any, Dict, List

from security_system_v1.domain.models import GitContext

# ---------------------------------------------------------------------------
# System prompt — defines the model's role and output schema
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a cybersecurity expert analyzing code changes for malicious intent.

Your task:
1. Analyze security scan results (Gitleaks, Semgrep, Trivy)
2. Review the git diff and commit context
3. Detect patterns indicative of malicious activity
4. Assign a risk score from 0 to 10
5. Provide concrete, actionable recommendations

Malicious indicators to look for:
- Hardcoded credentials or secrets
- Unauthorized privilege escalation
- Data exfiltration patterns
- Backdoors or reverse shells
- Supply chain attack vectors
- Obfuscated or encoded payloads
- Suspicious dependency additions
- Certificate or key generation for unauthorized access

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.
Use this exact structure:
{
	"risk_score": <float 0.0-10.0>,
	"risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>",
	"is_malicious": <true|false>,
	"detected_patterns": ["<pattern>", ...],
	"recommendations": ["<action>", ...],
	"reasoning": "<concise explanation>"
}"""

# ---------------------------------------------------------------------------
# User prompt template — filled in with real commit and scan data
# ---------------------------------------------------------------------------

_USER_PROMPT_TEMPLATE = """\
Analyze this code change for security threats.

COMMIT INFORMATION:
- Hash: {commit_hash}
- Author: {author}
- Message: {commit_message}
- Timestamp: {timestamp}

CHANGED FILES:
{files_changed}

CODE DIFF:
{diff}

SECURITY SCAN RESULTS:
{scan_summary}

ISSUE COUNTS:
- Total: {issue_count}
- Gitleaks: {gitleaks_count}
- Semgrep: {semgrep_count}
- Trivy: {trivy_count}

Respond in JSON only."""


# ---------------------------------------------------------------------------
# Public builder
# ---------------------------------------------------------------------------

def build_analysis_prompt(git_ctx: GitContext, scan_data: Dict[str, Any]) -> str:
	"""
	Formats the user prompt using the git context and scan results.

	Args:
		git_ctx:   Commit metadata and diff.
		scan_data: Raw scan results keyed by tool name.

	Returns:
		Formatted user prompt string ready to pass to the LLM.
	"""
	files_list = "\n".join(f"  - {file_path}" for file_path in git_ctx.files_changed) or "  (none)"
	diff_text = git_ctx.diff or "(no diff available)"

	gitleaks: List = scan_data.get("gitleaks", [])
	semgrep: List = scan_data.get("semgrep", [])
	trivy: List = scan_data.get("trivy", [])

	return _USER_PROMPT_TEMPLATE.format(
		commit_hash=git_ctx.commit_hash,
		author=git_ctx.author,
		commit_message=git_ctx.commit_message,
		timestamp=git_ctx.timestamp,
		files_changed=files_list,
		diff=diff_text,
		scan_summary=_format_scan_summary(gitleaks, semgrep, trivy),
		issue_count=len(gitleaks) + len(semgrep) + len(trivy),
		gitleaks_count=len(gitleaks),
		semgrep_count=len(semgrep),
		trivy_count=len(trivy),
	)


# ---------------------------------------------------------------------------
# Private formatting helper
# ---------------------------------------------------------------------------

def _format_scan_summary(
	gitleaks: List[dict],
	semgrep: List[dict],
	trivy: List[dict],
) -> str:
	"""Produces a compact, human-readable scan summary for the LLM prompt."""
	lines: List[str] = []
	max_findings = 5  # findings shown per tool

	if gitleaks:
		lines.append("GITLEAKS (secrets):")
		for item in gitleaks[:max_findings]:
			lines.append(
				f"  - {item.get('RuleID') or item.get('SecretType', 'Unknown')} "
				f"in {item.get('File', '?')}"
			)
		if len(gitleaks) > max_findings:
			lines.append(f"  ... and {len(gitleaks) - max_findings} more")
	else:
		lines.append("GITLEAKS: No secrets detected")

	lines.append("")

	if semgrep:
		lines.append("SEMGREP (code analysis):")
		for item in semgrep[:max_findings]:
			rule = item.get("check_id", "unknown")
			msg = item.get("extra", {}).get("message", "")[:80]
			lines.append(f"  - {rule}: {msg}")
		if len(semgrep) > max_findings:
			lines.append(f"  ... and {len(semgrep) - max_findings} more")
	else:
		lines.append("SEMGREP: No issues detected")

	lines.append("")

	if trivy:
		lines.append("TRIVY (dependencies/misconfigs):")
		shown = 0
		for group in trivy:
			for vuln in group.get("Vulnerabilities", [])[:max_findings]:
				lines.append(
					f"  - [{vuln.get('Severity', '?')}] "
					f"{vuln.get('PkgName', '?')}: {vuln.get('VulnerabilityID', '?')}"
				)
				shown += 1
				if shown >= max_findings:
					break
			if shown >= max_findings:
				break
	else:
		lines.append("TRIVY: No vulnerabilities detected")

	return "\n".join(lines)

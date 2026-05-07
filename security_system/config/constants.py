"""
Central constants for security_system_v1.

Defines paths, file names, and configuration values used across the system.
"""

from pathlib import Path

# ============================================================================
# Directory Paths (package-relative)
# ============================================================================

# Base directory: /path/to/security_system_v1/
BASE_DIR = Path(__file__).resolve().parents[1]

# Reports directory: /path/to/security_system_v1/reports/artifacts/
REPORTS_DIR = BASE_DIR / "reports" / "artifacts"

# ============================================================================
# Report File Names
# ============================================================================

GITLEAKS_REPORT = "gitleaks-report.json"
SEMGREP_REPORT = "semgrep-report.json"
TRIVY_REPORT = "trivy-report.json"
SUMMARY_REPORT = "summary.json"
AI_ANALYSIS_REPORT = "ai_analysis.json"
DECISION_REPORT = "decision_report.json"

# ============================================================================
# Risk Thresholds
# ============================================================================

RISK_THRESHOLD_FAIL = 7.0   # Decision: FAIL (block commit)
RISK_THRESHOLD_WARN = 4.0   # Decision: WARN (allow with notification)

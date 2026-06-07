"""
Semgrep CLI wrapper.

Runs the `semgrep` binary via subprocess and returns the parsed JSON results.
No parsing logic lives here — raw JSON is returned for domain/parsers to consume.
"""

from __future__ import annotations

import json
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Default CLI timeout (seconds)
_TIMEOUT = 120

# Semgrep registry rule set used for security analysis
_DEFAULT_CONFIG = "p/security-audit"


def run_semgrep(
    target: Path,
    *,
    config: str = _DEFAULT_CONFIG,
    output_path: Optional[Path] = None,
    timeout: int = _TIMEOUT,
) -> Optional[list[Any]]:
    """
    Execute ``semgrep`` against *target* and return raw JSON results list.

    Args:
        target:      File or directory to scan.
        config:      Semgrep rule config (registry key, file path, or URL).
        output_path: Optional file path to write the JSON report to.
        timeout:     Subprocess timeout in seconds.

    Returns:
        List of result dicts (may be empty), or ``None`` on execution failure.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        report_file = Path(tmp.name)

    try:
        cmd = [
            "semgrep",
            "--config", config,
            "--json",
            "--output", str(report_file),
            str(target),
        ]

        logger.info("Running Semgrep: %s", " ".join(cmd))
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        logger.debug("Semgrep exit code: %d", result.returncode)
        if result.stderr:
            logger.debug("Semgrep stderr: %s", result.stderr.strip())

        if output_path is not None:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(report_file.read_bytes())

        raw = _load_json(report_file)
        if raw is None:
            return []
        # Semgrep JSON envelope: {"results": [...], "errors": [...]}
        if isinstance(raw, dict):
            return raw.get("results", [])
        return raw  # already a list

    except FileNotFoundError:
        logger.error("Semgrep binary not found. Install: https://semgrep.dev/docs/getting-started/")
        return None
    except subprocess.TimeoutExpired:
        logger.error("Semgrep scan timed out after %ds", timeout)
        return None
    except Exception as exc:  # pylint: disable=broad-except
        logger.error("Semgrep execution failed: %s", exc)
        return None
    finally:
        report_file.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _load_json(path: Path) -> Optional[Any]:
    """Read and parse a JSON file; return None on any error."""
    if not path.exists() or path.stat().st_size == 0:
        return None
    try:
        with path.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Semgrep JSON output: %s", exc)
        return None

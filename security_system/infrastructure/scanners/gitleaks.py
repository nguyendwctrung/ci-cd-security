"""
Gitleaks CLI wrapper.

Runs the `gitleaks` binary via subprocess and returns the parsed JSON output.
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
_TIMEOUT = 60


def run_gitleaks(
    source: Path,
    *,
    staged_only: bool = False,
    output_path: Optional[Path] = None,
    timeout: int = _TIMEOUT,
) -> Optional[list[Any]]:
    """
    Execute `gitleaks detect` against *source* and return raw JSON findings.

    Args:
        source:      Repository or directory to scan.
        staged_only: Pass ``--staged`` flag (useful in pre-commit context).
        output_path: Optional file path to write the JSON report to.
                     If omitted, a temporary file is used and discarded.
        timeout:     Subprocess timeout in seconds.

    Returns:
        List of finding dicts (may be empty), or ``None`` on execution failure.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        report_file = Path(tmp.name)

    try:
        cmd = [
            "gitleaks",
            "detect",
            "--source", str(source),
            "--report-format", "json",
            "--report-path", str(report_file),
            "--exit-code", "0",  # never fail on findings — let caller decide
        ]
        if staged_only:
            cmd.append("--staged")

        logger.info("Running Gitleaks: %s", " ".join(cmd))
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        logger.debug("Gitleaks exit code: %d", result.returncode)
        if result.stderr:
            logger.debug("Gitleaks stderr: %s", result.stderr.strip())

        # Copy report to caller-specified location if requested
        if output_path is not None:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(report_file.read_bytes())

        # Parse and return findings
        raw = _load_json(report_file)
        if raw is None:
            return []
        # Gitleaks JSON is either a top-level list or {"Leaks": [...]}
        if isinstance(raw, list):
            return raw
        return raw.get("Leaks", [])

    except FileNotFoundError:
        logger.error("Gitleaks binary not found. Install: https://github.com/gitleaks/gitleaks")
        return None
    except subprocess.TimeoutExpired:
        logger.error("Gitleaks scan timed out after %ds", timeout)
        return None
    except Exception as exc:  # pylint: disable=broad-except
        logger.error("Gitleaks execution failed: %s", exc)
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
        logger.error("Failed to parse Gitleaks JSON output: %s", exc)
        return None

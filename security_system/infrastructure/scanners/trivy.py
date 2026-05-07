"""
Trivy CLI wrapper.

Runs the `trivy` binary via subprocess and returns the parsed JSON results.
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
_TIMEOUT = 180

# Severities scanned by default (matching original hook behaviour)
_DEFAULT_SEVERITIES = "HIGH,CRITICAL"


def run_trivy(
    target: Path,
    *,
    severities: str = _DEFAULT_SEVERITIES,
    output_path: Optional[Path] = None,
    timeout: int = _TIMEOUT,
) -> Optional[list[Any]]:
    """
    Execute ``trivy fs`` against *target* and return raw JSON Results list.

    Args:
        target:      File or directory to scan.
        severities:  Comma-separated severity filter (e.g. ``"HIGH,CRITICAL"``).
        output_path: Optional file path to write the JSON report to.
        timeout:     Subprocess timeout in seconds.

    Returns:
        List of result group dicts (may be empty), or ``None`` on execution failure.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        report_file = Path(tmp.name)

    try:
        cmd = [
            "trivy",
            "fs",
            "--severity", severities,
            "--format", "json",
            "--output", str(report_file),
            str(target),
        ]

        logger.info("Running Trivy: %s", " ".join(cmd))
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        logger.debug("Trivy exit code: %d", result.returncode)
        if result.stderr:
            logger.debug("Trivy stderr: %s", result.stderr.strip())

        if output_path is not None:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(report_file.read_bytes())

        raw = _load_json(report_file)
        if raw is None:
            return []
        # Trivy JSON envelope: {"Results": [...]}
        if isinstance(raw, dict):
            return raw.get("Results", [])
        return raw  # already a list

    except FileNotFoundError:
        logger.error("Trivy binary not found. Install: https://trivy.dev/docs/getting-started/installation/")
        return None
    except subprocess.TimeoutExpired:
        logger.error("Trivy scan timed out after %ds", timeout)
        return None
    except Exception as exc:  # pylint: disable=broad-except
        logger.error("Trivy execution failed: %s", exc)
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
        logger.error("Failed to parse Trivy JSON output: %s", exc)
        return None

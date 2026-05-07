"""
Git service for extracting commit context.

Provides safe subprocess-based access to git diff, commit metadata,
and changed file lists. Returns a structured GitContext model.
"""

from __future__ import annotations

import logging
import subprocess
from datetime import datetime
from typing import Dict, List, Optional

from security_system_v1.domain.models import GitContext

logger = logging.getLogger(__name__)

_GIT_TIMEOUT = 5
MAX_DIFF_SIZE = 10_000
MAX_COMMIT_MESSAGE_SIZE = 500
MAX_FILE_PATH_SIZE = 200


class GitService:
	"""Provides read-only access to the local git repository."""

	def get_context(self, staged: bool = True) -> GitContext:
		"""
		Builds a complete GitContext from the current repository state.

		Returns GitContext.empty() on total failure.
		"""
		try:
			commit_info = self.get_commit_info()
			return GitContext(
				commit_hash=commit_info["commit_hash"],
				author=commit_info["author"],
				commit_message=commit_info["commit_message"],
				timestamp=commit_info["timestamp"],
				files_changed=self.get_changed_files(staged=staged),
				diff=self.get_git_diff(staged=staged),
			)
		except Exception as exc:  # pylint: disable=broad-except
			logger.warning("Failed to build GitContext: %s", exc)
			return GitContext.empty()

	def get_git_diff(self, staged: bool = True) -> str:
		"""Returns the git diff, truncated to MAX_DIFF_SIZE characters."""
		cmd = ["git", "diff", "--cached"] if staged else ["git", "diff", "HEAD"]
		output = self._run(cmd)
		if output and len(output) > MAX_DIFF_SIZE:
			logger.warning("Diff truncated from %d to %d chars", len(output), MAX_DIFF_SIZE)
			output = output[:MAX_DIFF_SIZE] + "\n... (truncated)"
		return output or ""

	def get_commit_info(self) -> Dict[str, str]:
		"""Returns basic metadata about the most recent commit."""
		info: Dict[str, str] = {
			"commit_hash": "unknown",
			"author": "unknown",
			"commit_message": "",
			"timestamp": datetime.now().isoformat(),
		}
		hash_out = self._run(["git", "rev-parse", "HEAD"])
		if hash_out:
			info["commit_hash"] = hash_out[:12]
		author_out = self._run(["git", "log", "-1", "--pretty=%an <%ae>"])
		if author_out:
			info["author"] = author_out
		message_out = self._run(["git", "log", "-1", "--pretty=%B"])
		if message_out:
			msg = message_out.strip()
			if len(msg) > MAX_COMMIT_MESSAGE_SIZE:
				msg = msg[:MAX_COMMIT_MESSAGE_SIZE] + "..."
			info["commit_message"] = msg
		ts_out = self._run(["git", "log", "-1", "--pretty=%aI"])
		if ts_out:
			info["timestamp"] = ts_out
		return info

	def get_changed_files(self, staged: bool = True) -> List[str]:
		"""Returns a list of file paths modified in the current change set."""
		cmd = (
			["git", "diff", "--cached", "--name-only"]
			if staged
			else ["git", "diff", "HEAD", "--name-only"]
		)
		output = self._run(cmd)
		if not output:
			return []
		files: List[str] = []
		for path in output.splitlines():
			path = path.strip()
			if not path:
				continue
			if len(path) > MAX_FILE_PATH_SIZE:
				path = path[:MAX_FILE_PATH_SIZE] + "..."
			files.append(path)
		return files

	@staticmethod
	def _run(cmd: List[str]) -> Optional[str]:
		"""Runs a git command and returns stripped stdout, or None on failure."""
		try:
			result = subprocess.run(
				cmd,
				capture_output=True,
				text=True,
				timeout=_GIT_TIMEOUT,
				check=False,
			)
			if result.returncode != 0:
				logger.warning("git command failed (%s): %s", " ".join(cmd), result.stderr.strip())
				return None
			return result.stdout.strip() or None
		except subprocess.TimeoutExpired:
			logger.warning("git command timed out: %s", " ".join(cmd))
			return None
		except FileNotFoundError:
			logger.error("git executable not found in PATH")
			return None
		except Exception as exc:  # pylint: disable=broad-except
			logger.warning("Unexpected error running %s: %s", " ".join(cmd), exc)
			return None

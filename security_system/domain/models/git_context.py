"""
GitContext data model.

Captures the relevant git commit context passed to the LLM for analysis.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List


@dataclass
class GitContext:
	"""
	Git commit context used as input for LLM security analysis.

	Attributes:
		commit_hash:    Full or abbreviated git commit SHA.
		author:         Commit author in 'Name <email>' format.
		commit_message: The commit message body.
		timestamp:      ISO 8601 formatted commit timestamp.
		files_changed:  List of file paths modified in this commit.
		diff:           Git diff output (may be truncated by MAX_DIFF_SIZE).
	"""

	commit_hash: str
	author: str
	commit_message: str
	timestamp: str
	files_changed: List[str] = field(default_factory=list)
	diff: str = ""

	def is_empty(self) -> bool:
		"""Returns True if no meaningful context is available."""
		return not self.commit_hash and not self.diff

	def to_dict(self) -> dict:
		return {
			"commit_hash": self.commit_hash,
			"author": self.author,
			"commit_message": self.commit_message,
			"timestamp": self.timestamp,
			"files_changed": self.files_changed,
			"diff": self.diff,
		}

	@classmethod
	def empty(cls) -> "GitContext":
		"""Returns a GitContext with no data (used as a safe fallback)."""
		return cls(
			commit_hash="unknown",
			author="unknown",
			commit_message="",
			timestamp="",
			files_changed=[],
			diff="",
		)

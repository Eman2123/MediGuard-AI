"""
Simple in-memory log of recent shipment assessments — powers /api/history.
Thread-safe, capped size (doesn't grow unbounded across a long demo session).
"""
import threading
from typing import Dict, Any, List

_lock = threading.Lock()
_history: List[Dict[str, Any]] = []
MAX_HISTORY = 50


def record_assessment(entry: Dict[str, Any]) -> None:
    with _lock:
        _history.append(entry)
        if len(_history) > MAX_HISTORY:
            _history.pop(0)


def get_history() -> List[Dict[str, Any]]:
    with _lock:
        return list(reversed(_history))  # most recent first
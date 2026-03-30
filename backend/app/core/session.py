from app.indexer.indexer import FolderIndex

# In-memory store: session_id -> FolderIndex
_sessions: dict[str, FolderIndex] = {}

def set_index(session_id: str, index: FolderIndex):
    _sessions[session_id] = index

def get_index(session_id: str) -> FolderIndex | None:
    return _sessions.get(session_id)

def clear_session(session_id: str):
    _sessions.pop(session_id, None)
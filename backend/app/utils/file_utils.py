import os
from pathlib import Path

def safe_resolve(base_folder: str, target_path: str) -> Path | None:
    """
    Resolves target_path and ensures it is strictly inside base_folder.
    Returns None if path traversal is detected.
    """
    base = Path(base_folder).resolve()
    target = (base / target_path).resolve()
    if not str(target).startswith(str(base)):
        return None
    return target

def is_inside_folder(base_folder: str, path: str) -> bool:
    base = Path(base_folder).resolve()
    target = Path(path).resolve()
    return str(target).startswith(str(base))
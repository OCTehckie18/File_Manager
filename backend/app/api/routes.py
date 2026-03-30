from fastapi import APIRouter, HTTPException
from app.api.schemas import SetFolderRequest, QueryRequest, QueryResponse, IndexStatusResponse
from app.indexer.indexer import build_index
from app.core.session import set_index, get_index
from app.agent.bot import ask_agent
import os
import traceback

router = APIRouter()

@router.post("/set-folder")
def set_folder(req: SetFolderRequest):
    if not os.path.isdir(req.folder_path):
        raise HTTPException(status_code=400, detail="Invalid folder path.")
    index = build_index(req.folder_path)
    set_index(req.session_id, index)
    return {"success": True, "total_files": index.total_files, "folder": req.folder_path}

@router.get("/index-status/{session_id}", response_model=IndexStatusResponse)
def index_status(session_id: str):
    index = get_index(session_id)
    if not index:
        return IndexStatusResponse(session_id=session_id, indexed=False)
    return IndexStatusResponse(
        session_id=session_id,
        indexed=True,
        total_files=index.total_files,
        folder=index.base_folder
    )

@router.get("/debug-index/{session_id}")
def debug_index(session_id: str):
    index = get_index(session_id)
    if not index:
        return {"error": "No index found for this session"}
    return {
        "folder": index.base_folder,
        "total_files": index.total_files,
        "files": [
            {
                "name": f.name,
                "size_kb": round(f.size_bytes / 1024, 2),
                "has_content": f.content is not None
            }
            for f in index.files
        ]
    }

@router.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    try:
        index = get_index(req.session_id)
        if not index:
            return QueryResponse(
                reply="",
                error="No folder set for this session. Please call /set-folder first."
            )
        reply = ask_agent(index, req.message)
        return QueryResponse(reply=reply)
    except Exception as e:
        traceback.print_exc()
        return QueryResponse(reply="", error=str(e))
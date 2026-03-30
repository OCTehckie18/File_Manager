from fastapi import APIRouter, HTTPException
from app.api.schemas import SetFolderRequest, QueryRequest, QueryResponse, IndexStatusResponse
from app.indexer.indexer import build_index
from app.core.session import set_index, get_index
from app.agent.bot import ask_agent
import os

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

@router.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    index = get_index(req.session_id)
    if not index:
        return QueryResponse(reply="", error="No folder set for this session. Please set a folder first.")
    reply = ask_agent(index, req.message)
    return QueryResponse(reply=reply)
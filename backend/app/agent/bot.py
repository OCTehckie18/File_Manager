import httpx
import json
from app.indexer.indexer import FolderIndex
from app.core.config import settings
from app.agent import tools

SYSTEM_PROMPT = """
You are a file manager assistant. You have been given full access to a specific folder.
You know everything about the files in that folder — their names, sizes, types, and contents.

When the user asks a question, use the provided tool results to answer accurately.
Be concise and helpful. Always refer to actual file names in your answers.
Never make up file names or contents.
""".strip()

TOOLS_DESCRIPTION = """
You have access to the following tools. When you need information, call the appropriate tool by responding with JSON in this format:
{"tool": "<tool_name>", "args": {<args>}}

Available tools:
- list_files: Lists all files with sizes. No args needed.
- files_above_size: Lists files above a certain size. Args: {"size_mb": <number>}
- search_content: Searches all file contents for a keyword. Args: {"keyword": "<string>"}
- get_file_content: Returns content of a specific file. Args: {"filename": "<string>"}
- get_file_stats: Returns overall folder stats. No args needed.

If no tool is needed, just reply normally.
""".strip()


def run_tool(index: FolderIndex, tool_name: str, args: dict) -> str:
    if tool_name == "list_files":
        return tools.list_files(index)
    elif tool_name == "files_above_size":
        return tools.files_above_size(index, args.get("size_mb", 1))
    elif tool_name == "search_content":
        return tools.search_content(index, args.get("keyword", ""))
    elif tool_name == "get_file_content":
        return tools.get_file_content(index, args.get("filename", ""))
    elif tool_name == "get_file_stats":
        return tools.get_file_stats(index)
    else:
        return f"Unknown tool: {tool_name}"


def call_ollama(messages: list[dict]) -> str:
    response = httpx.post(
        f"{settings.ollama_base_url}/api/chat",
        json={
            "model": settings.ollama_model,
            "messages": messages,
            "stream": False
        },
        timeout=120
    )
    response.raise_for_status()
    return response.json()["message"]["content"]


def ask_agent(index: FolderIndex, user_message: str) -> str:
    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{TOOLS_DESCRIPTION}"},
        {"role": "user", "content": user_message}
    ]

    # First LLM call — may request a tool
    reply = call_ollama(messages)

    # Check if LLM wants to use a tool
    try:
        parsed = json.loads(reply.strip())
        if "tool" in parsed:
            tool_result = run_tool(index, parsed["tool"], parsed.get("args", {}))
            # Send tool result back and get final answer
            messages.append({"role": "assistant", "content": reply})
            messages.append({"role": "user", "content": f"Tool result:\n{tool_result}"})
            reply = call_ollama(messages)
    except (json.JSONDecodeError, TypeError):
        pass  # LLM answered directly without a tool call

    return reply
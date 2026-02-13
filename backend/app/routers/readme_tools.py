from fastapi import APIRouter, HTTPException

from app.llm.client import get_openrouter_client
from app.models.llm import ReadmeRewriteRequest, ReadmeRewriteResult


router = APIRouter(prefix="/rewrite-readme", tags=["readme"])


@router.post("", response_model=ReadmeRewriteResult)
async def rewrite_readme(payload: ReadmeRewriteRequest) -> ReadmeRewriteResult:
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="README content cannot be empty.")

    client = await get_openrouter_client()

    prompt = (
        "Rewrite this GitHub README professionally.\n"
        "Add or improve the following sections where appropriate:\n"
        "- Project overview\n"
        "- Features\n"
        "- Tech stack\n"
        "- Installation\n"
        "- Usage\n"
        "- Business impact framing\n"
        "- Future improvements\n\n"
        "Return only the rewritten Markdown, nothing else.\n\n"
        f"Original README:\n{payload.content}"
    )

    rewritten = await client.chat(
        model="mistralai/mistral-7b-instruct:free",
        messages=[
            {"role": "system", "content": "You are a senior developer relations writer."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
    )

    return ReadmeRewriteResult(rewritten=rewritten.strip())


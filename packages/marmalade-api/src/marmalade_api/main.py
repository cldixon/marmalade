"""FastAPI application for Marmalade."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from marmalade import chunk_text
from pydantic import BaseModel

app = FastAPI(title="Marmalade API", version="0.1.0")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChunkRequest(BaseModel):
    """Request model for chunking text."""

    text: str
    tokenizer_name: str = "bert-base-uncased"
    chunk_size: int = 512


class ChunkData(BaseModel):
    """Single chunk data."""

    text: str
    tokens: list[str]
    token_ids: list[int]
    start_char: int
    end_char: int


class ChunkResponse(BaseModel):
    """Response model for chunked text."""

    chunks: list[ChunkData]
    tokenizer_name: str
    total_tokens: int


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "Marmalade API", "version": "0.1.0"}


@app.post("/chunk", response_model=ChunkResponse)
def chunk_endpoint(request: ChunkRequest):
    """
    Chunk text using specified tokenizer.

    Args:
        request: ChunkRequest with text, tokenizer_name, and chunk_size

    Returns:
        ChunkResponse with chunked text data
    """
    result = chunk_text(
        text=request.text,
        tokenizer_name=request.tokenizer_name,
        chunk_size=request.chunk_size,
    )

    return ChunkResponse(
        chunks=[
            ChunkData(
                text=chunk.text,
                tokens=chunk.tokens,
                token_ids=chunk.token_ids,
                start_char=chunk.start_char,
                end_char=chunk.end_char,
            )
            for chunk in result.chunks
        ],
        tokenizer_name=result.tokenizer_name,
        total_tokens=result.total_tokens,
    )

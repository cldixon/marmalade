from core import TextChunker
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    chunker = TextChunker("bert-base-uncased")
    chunked_text = chunker.chunk_text("Hello, world!", 5)
    return {"message": "Marmalade API", "chunks": chunked_text}

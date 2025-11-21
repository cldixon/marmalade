from fastapi import FastAPI

from core.chunks import TextChunker

app = FastAPI()


@app.get("/")
def root():
    chunker = TextChunker("bert-base-uncased", max_tokens=128)
    chunked_text = chunker.chunk(text="Mmm, marmalade is so delicious!")
    return {"message": "Marmalade API", "chunks": chunked_text, "new_field": 3}


@app.get("/health")
def health():
    return {"status": "ok"}

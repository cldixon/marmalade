# Marmalade

Text chunking and visualization using HuggingFace tokenizers.

## Components

### 1. marmalade-lib (Python Library)

Install dependencies:
```bash
cd marmalade-lib
uv sync
```

Basic usage:
```python
from marmalade_lib import chunk_text

result = chunk_text(
    text="Your text here",
    tokenizer_name="bert-base-uncased",
    chunk_size=512
)

for chunk in result.chunks:
    print(f"Text: {chunk.text}")
    print(f"Tokens: {chunk.tokens}")
```

### 2. marmalade-api (FastAPI)

Run the server:
```bash
cd marmalade-api
PYTHONPATH=src uv run uvicorn marmalade_api.main:app --host 0.0.0.0 --port 8000
```

Make requests:
```python
import requests

response = requests.post(
    "http://localhost:8000/chunk",
    json={
        "text": "Your text here",
        "tokenizer_name": "bert-base-uncased",
        "chunk_size": 512
    }
)

data = response.json()
print(f"Total tokens: {data['total_tokens']}")
print(f"Number of chunks: {len(data['chunks'])}")
```

### 3. marmalade-web (Svelte)

Install and run:
```bash
cd marmalade-web
npm install
npm run dev
```

The app runs at http://localhost:5173 (or next available port).

Ensure the API is running before using the web interface.

"""Core chunking functionality for Marmalade."""

from dataclasses import dataclass

from transformers import AutoTokenizer


@dataclass
class Chunk:
    """Represents a single chunk of text."""

    text: str
    tokens: list[str]
    token_ids: list[int]
    start_char: int
    end_char: int


@dataclass
class ChunkedText:
    """Result of chunking operation."""

    chunks: list[Chunk]
    tokenizer_name: str
    total_tokens: int


def chunk_text(
    text: str, tokenizer_name: str = "bert-base-uncased", chunk_size: int = 512
) -> ChunkedText:
    """
    Chunk text using specified tokenizer.

    Args:
        text: Input text to chunk
        tokenizer_name: HuggingFace tokenizer identifier
        chunk_size: Maximum tokens per chunk

    Returns:
        ChunkedText object with chunking results
    """
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)

    # Tokenize the full text
    encoding = tokenizer(text, return_offsets_mapping=True, add_special_tokens=False)
    token_ids = encoding["input_ids"]
    tokens = tokenizer.convert_ids_to_tokens(token_ids)
    offsets = encoding["offset_mapping"]

    # Simple chunking: split into fixed-size chunks
    chunks = []
    for i in range(0, len(token_ids), chunk_size):
        chunk_token_ids = token_ids[i : i + chunk_size]
        chunk_tokens = tokens[i : i + chunk_size]

        # Get character positions from offsets
        start_char = offsets[i][0]
        end_char = offsets[min(i + chunk_size - 1, len(offsets) - 1)][1]
        chunk_text = text[start_char:end_char]

        chunks.append(
            Chunk(
                text=chunk_text,
                tokens=chunk_tokens,
                token_ids=chunk_token_ids,
                start_char=start_char,
                end_char=end_char,
            )
        )

    return ChunkedText(
        chunks=chunks, tokenizer_name=tokenizer_name, total_tokens=len(token_ids)
    )

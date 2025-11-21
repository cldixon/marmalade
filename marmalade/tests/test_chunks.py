"""
Simple tests for the TextChunker class.

Run with: python -m pytest test_chunks.py -v
Or simply: python test_chunks.py
"""

import pytest

from marmalade.chunks import (
    ChunkingError,
    TextChunker,
    TokenLimitExceededError,
)

# Simple test text
SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. " * 20


def test_basic_chunking():
    """Test basic chunking without overlap"""
    chunker = TextChunker("bert-base-uncased", max_tokens=50)
    chunks = chunker.chunk(SAMPLE_TEXT)

    assert len(chunks) > 1, "Should produce multiple chunks"
    assert all(
        isinstance(chunk, str) for chunk in chunks
    ), "All chunks should be strings"


def test_chunking_with_overlap():
    """Test chunking with overlap between chunks"""
    chunker = TextChunker("bert-base-uncased", max_tokens=50, overlap=10)
    chunks = chunker.chunk(SAMPLE_TEXT)

    assert len(chunks) > 1, "Should produce multiple chunks"


def test_default_max_tokens():
    """Test that default max_tokens uses model maximum"""
    chunker = TextChunker("bert-base-uncased")

    assert chunker.max_tokens == 512, "Should default to BERT's 512 token limit"


def test_custom_max_tokens():
    """Test setting custom max_tokens"""
    chunker = TextChunker("bert-base-uncased", max_tokens=128)

    assert chunker.max_tokens == 128, "Should use custom max_tokens"


def test_token_limit_exceeded():
    """Test that exceeding model max raises error"""
    with pytest.raises(TokenLimitExceededError):
        TextChunker("bert-base-uncased", max_tokens=1024)


def test_overlap_validation():
    """Test that invalid overlap raises error"""
    with pytest.raises(ChunkingError):
        TextChunker("bert-base-uncased", max_tokens=100, overlap=150)


def test_negative_overlap():
    """Test that negative overlap raises error"""
    with pytest.raises(ChunkingError):
        TextChunker("bert-base-uncased", overlap=-10)


def test_short_text():
    """Test that short text produces single chunk"""
    short_text = "Hello world"
    chunker = TextChunker("bert-base-uncased", max_tokens=50)
    chunks = chunker.chunk(short_text)

    assert len(chunks) == 1, "Short text should produce single chunk"


def test_get_chunk_info():
    """Test chunk info method"""
    chunker = TextChunker("bert-base-uncased", max_tokens=128, overlap=20)
    info = chunker.get_chunk_info()

    assert info["strategy"] == "fixed"
    assert info["max_tokens"] == 128
    assert info["overlap"] == 20
    assert info["model_max_tokens"] == 512


def test_fixed_strategy():
    """Test explicit fixed strategy"""
    chunker = TextChunker("bert-base-uncased", strategy="fixed", max_tokens=50)
    chunks = chunker.chunk(SAMPLE_TEXT)

    assert len(chunks) > 0, "Should produce chunks with fixed strategy"


if __name__ == "__main__":
    # Run tests without pytest
    print("Running simple tests...\n")

    try:
        test_basic_chunking()
        print("✓ Basic chunking works")

        test_chunking_with_overlap()
        print("✓ Chunking with overlap works")

        test_default_max_tokens()
        print("✓ Default max tokens correct")

        test_custom_max_tokens()
        print("✓ Custom max tokens works")

        test_token_limit_exceeded()
        print("✓ Token limit validation works")

        test_overlap_validation()
        print("✓ Overlap validation works")

        test_negative_overlap()
        print("✓ Negative overlap validation works")

        test_short_text()
        print("✓ Short text handling works")

        test_get_chunk_info()
        print("✓ Chunk info method works")

        test_fixed_strategy()
        print("✓ Fixed strategy works")

        print("\n✓ All tests passed!")

    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
    except Exception as e:
        print(f"\n✗ Error: {e}")

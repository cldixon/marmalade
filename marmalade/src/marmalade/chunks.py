from typing import Literal

from tokenizers import Tokenizer

# Registry of common embedding models and their max token limits
MODEL_MAX_TOKENS = {
    "bert-base-uncased": 512,
    "bert-large-uncased": 512,
    "distilbert-base-uncased": 512,
    "sentence-transformers/all-MiniLM-L6-v2": 512,
    "sentence-transformers/all-mpnet-base-v2": 512,
    "sentence-transformers/paraphrase-MiniLM-L6-v2": 512,
    "openai/clip-vit-base-patch32": 77,
    "microsoft/codebert-base": 512,
    "roberta-base": 512,
    "roberta-large": 512,
}

ChunkingStrategy = Literal["fixed"]


class ChunkingError(Exception):
    """Base exception for chunking-related errors"""

    pass


class TokenLimitExceededError(ChunkingError):
    """Raised when specified token limit exceeds model's maximum"""

    pass


## ---- FUNCTIONAL INTERFACE FOR TEXT CHUNKING ---- ##
def chunk_text(tokenizer: Tokenizer, text: str, max_length: int) -> list[str]:
    """
    Simple fixed-size chunking without overlap.

    Args:
        tokenizer: The tokenizer to use
        text: Input text to chunk
        max_length: Maximum tokens per chunk

    Returns:
        List of text chunks
    """
    tokens = tokenizer.encode(text).tokens
    chunks = [tokens[i : i + max_length] for i in range(0, len(tokens), max_length)]
    return [" ".join(chunk) for chunk in chunks]


def chunk_text_with_overlap(
    tokenizer: Tokenizer, text: str, max_length: int, overlap: int
) -> list[str]:
    """
    Fixed-size chunking with overlap between chunks.

    The overlap parameter specifies how many tokens from the end of one chunk
    should appear at the beginning of the next chunk, providing context continuity.

    Args:
        tokenizer: The tokenizer to use
        text: Input text to chunk
        max_length: Maximum tokens per chunk
        overlap: Number of tokens to overlap between chunks

    Returns:
        List of text chunks with overlapping context
    """
    if overlap >= max_length:
        raise ChunkingError(
            f"Overlap ({overlap}) must be less than max_length ({max_length})"
        )

    tokens = tokenizer.encode(text).tokens
    chunks = []

    if len(tokens) <= max_length:
        # Text fits in a single chunk
        return [" ".join(tokens)]

    # Calculate the stride (step size between chunk starts)
    stride = max_length - overlap

    # Create overlapping chunks
    for i in range(0, len(tokens), stride):
        chunk = tokens[i : i + max_length]
        chunks.append(" ".join(chunk))

        # Stop if we've processed all tokens
        if i + max_length >= len(tokens):
            break

    return chunks


class TextChunker:
    """
    A configurable text chunker that splits text into chunks based on token counts.

    The chunker supports different strategies and can be configured with overlap
    to maintain context across chunk boundaries.

    Args:
        tokenizer: Either a tokenizer name (str) or a Tokenizer instance
        strategy: The chunking strategy to use (currently only "fixed" is supported)
        max_tokens: Maximum tokens per chunk. If None, uses the model's default max.
        overlap: Number of tokens to overlap between chunks (default: 0)
        model_name: Optional model name for looking up max token limits

    Example:
        >>> chunker = TextChunker("bert-base-uncased", max_tokens=128, overlap=20)
        >>> chunks = chunker.chunk("Your long text here...")
    """

    def __init__(
        self,
        tokenizer: str | Tokenizer,
        strategy: ChunkingStrategy = "fixed",
        max_tokens: int | None = None,
        overlap: int = 0,
        model_name: str | None = None,
    ):
        # Initialize tokenizer
        if isinstance(tokenizer, str):
            self.tokenizer = Tokenizer.from_pretrained(tokenizer)
            # If no model_name provided, use tokenizer name for limit lookup
            if model_name is None:
                model_name = tokenizer
        else:
            self.tokenizer = tokenizer

        self.strategy = strategy
        self.model_name = model_name
        self.overlap = overlap

        # Determine max tokens for the model
        self.model_max_tokens = self._get_model_max_tokens()

        # Set max_tokens with validation
        if max_tokens is None:
            self.max_tokens = self.model_max_tokens
        else:
            if max_tokens > self.model_max_tokens:
                raise TokenLimitExceededError(
                    f"Specified max_tokens ({max_tokens}) exceeds model maximum "
                    f"({self.model_max_tokens}) for {self.model_name or 'this model'}"
                )
            self.max_tokens = max_tokens

        # Validate overlap
        if overlap < 0:
            raise ChunkingError("Overlap must be non-negative")
        if overlap >= self.max_tokens:
            raise ChunkingError(
                f"Overlap ({overlap}) must be less than max_tokens ({self.max_tokens})"
            )

    def _get_model_max_tokens(self) -> int:
        """
        Get the maximum token limit for the model.

        Returns:
            Maximum number of tokens the model can handle
        """
        if self.model_name and self.model_name in MODEL_MAX_TOKENS:
            return MODEL_MAX_TOKENS[self.model_name]

        # Default to 512 if model not in registry (common for BERT-based models)
        return 512

    def chunk(self, text: str) -> list[str]:
        """
        Chunk the input text according to the configured strategy.

        Args:
            text: The text to chunk

        Returns:
            List of text chunks

        Raises:
            ChunkingError: If chunking fails
        """
        if self.strategy == "fixed":
            if self.overlap > 0:
                return chunk_text_with_overlap(
                    self.tokenizer, text, self.max_tokens, self.overlap
                )
            else:
                return chunk_text(self.tokenizer, text, self.max_tokens)
        else:
            raise ChunkingError(f"Unknown chunking strategy: {self.strategy}")

    def get_chunk_info(self) -> dict:
        """
        Get information about the chunker configuration.

        Returns:
            Dictionary with chunker settings
        """
        return {
            "strategy": self.strategy,
            "max_tokens": self.max_tokens,
            "model_max_tokens": self.model_max_tokens,
            "overlap": self.overlap,
            "model_name": self.model_name,
        }

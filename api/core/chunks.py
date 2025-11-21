from tokenizers import Tokenizer


class TextChunker:
    def __init__(self, tokenizer: str | Tokenizer):
        self.tokenzier = (
            Tokenizer.from_pretrained(tokenizer)
            if isinstance(tokenizer, str)
            else tokenizer
        )

    def chunk_text(self, text: str, max_length: int) -> list[str]:
        tokens = self.tokenzier.encode(text).tokens
        chunks = [tokens[i : i + max_length] for i in range(0, len(tokens), max_length)]
        return [" ".join(chunk) for chunk in chunks]

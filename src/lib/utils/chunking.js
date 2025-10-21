export function calculateChunks(text, strategy, maxTokens, overlap) {
	if (!text) return [];

	let newChunks = [];

	if (strategy === 'paragraph') {
		newChunks = text.split(/\n\n+/).filter((p) => p.trim());
	} else if (strategy === 'sentence') {
		newChunks = text.match(/[^.!?]+[.!?]+/g) || [text];
	} else if (strategy === 'tokens') {
		const words = text.split(/\s+/);
		const wordsPerChunk = Math.floor(maxTokens / 1.3);
		for (let i = 0; i < words.length; i += wordsPerChunk - overlap) {
			const chunk = words.slice(i, i + wordsPerChunk).join(' ');
			if (chunk.trim()) newChunks.push(chunk);
		}
	} else if (strategy === 'hybrid') {
		const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
		let current = [];
		let currentLength = 0;
		const avgTokensPerWord = 1.3;

		for (let i = 0; i < sentences.length; i++) {
			const sentence = sentences[i];
			const sentenceWords = sentence.split(/\s+/).length;
			const estimatedTokens = sentenceWords * avgTokensPerWord;

			if (currentLength + estimatedTokens > maxTokens && current.length > 0) {
				newChunks.push(current.join(' '));
				current = [sentence];
				currentLength = estimatedTokens;
			} else {
				current.push(sentence);
				currentLength += estimatedTokens;
			}
		}

		if (current.length > 0) {
			newChunks.push(current.join(' '));
		}
	}

	return newChunks;
}

export function getChunkColor(index, theme) {
	if (index % 2 === 0) {
		return { bg: theme.light, border: theme.primary };
	}
	return { bg: theme.background, border: theme.accent };
}

export function getChunkMetadata(chunk, strategy, maxTokens, overlap) {
	const words = chunk.split(/\s+/).filter((w) => w.length > 0).length;
	const chars = chunk.length;
	const sentenceMatches = chunk.match(/[.!?]+/g);
	const sentences = sentenceMatches ? sentenceMatches.length : 0;
	const estimatedTokens = Math.ceil(words * 1.3);
	const util = estimatedTokens / maxTokens;

	let qual = 'Good';
	if (util > 0.7 && util < 0.95) {
		qual = 'Excellent';
	} else if (util < 0.5) {
		qual = 'Low';
	}

	const endsClean = /[.!?]\s*$/.test(chunk.trim());
	if (!endsClean && strategy !== 'tokens') {
		qual = 'Warning';
	}

	const overlapTok = strategy === 'tokens' ? overlap : 0;

	return {
		words: words,
		chars: chars,
		sentences: sentences,
		estimatedTokens: estimatedTokens,
		utilization: Math.round(util * 100),
		quality: qual,
		overlapTokens: overlapTok
	};
}

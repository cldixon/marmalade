import { x as attr_style, y as stringify } from "../../chunks/index.js";
import { e as escape_html } from "../../chunks/context.js";
const themes = {
  classic: {
    primary: "#FF8C42",
    accent: "#1E40AF",
    dark: "#4A3728",
    light: "#FFF8E7",
    background: "#FFFBF5",
    cardBg: "white",
    border: "#FFF8E7"
  }
};
const tokenizers = [
  {
    id: "bert-base",
    name: "BERT Base",
    model: "bert-base-uncased",
    contextWindow: 512,
    description: "Original BERT - great for general embeddings"
  },
  {
    id: "mpnet",
    name: "MPNet (all-mpnet-base-v2)",
    model: "sentence-transformers/all-mpnet-base-v2",
    contextWindow: 384,
    description: "Excellent sentence embeddings, balanced performance"
  },
  {
    id: "minilm",
    name: "MiniLM (all-MiniLM-L6-v2)",
    model: "sentence-transformers/all-MiniLM-L6-v2",
    contextWindow: 256,
    description: "Fast and lightweight, good for most tasks"
  },
  {
    id: "e5-small",
    name: "E5 Small",
    model: "intfloat/e5-small-v2",
    contextWindow: 512,
    description: "Microsoft E5 - strong multilingual support"
  },
  {
    id: "gte-small",
    name: "GTE Small",
    model: "thenlper/gte-small",
    contextWindow: 512,
    description: "Alibaba GTE - high quality general embeddings"
  }
];
const strategies = [
  { id: "tokens", name: "Fixed Tokens", description: "Split by token count" },
  { id: "paragraph", name: "Paragraphs", description: "Split by paragraphs" },
  { id: "sentence", name: "Sentences", description: "Split by sentences" },
  { id: "hybrid", name: "Hybrid", description: "Sentences with token limit" }
];
function calculateChunks(text, strategy, maxTokens, overlap) {
  return [];
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentTokenizer, chunks;
    let text = "";
    let strategy = "tokens";
    let selectedTokenizer = "mpnet";
    let maxTokens = 384;
    const currentTheme = themes.classic;
    currentTokenizer = tokenizers.find((t) => t.id === selectedTokenizer);
    if (currentTokenizer) {
      maxTokens = currentTokenizer.contextWindow;
    }
    chunks = calculateChunks();
    $$renderer2.push(`<div${attr_style(`background-color: ${stringify(currentTheme.background)}; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`)}><header${attr_style(`background-color: ${stringify(currentTheme.primary)}; color: white; padding: 1.5rem 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`)}><div style="max-width: 1400px; margin: 0 auto;"><h1 style="margin: 0; font-size: 2rem; font-weight: bold;">🫙 Marmalade</h1> <p style="margin: 0.25rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">Visualize your text chunks</p></div></header> <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_style(`background-color: ${stringify(currentTheme.cardBg)}; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; box-shadow: ${stringify("0 2px 8px rgba(0,0,0,0.1)")}; border: 2px solid ${stringify(currentTheme.border)};`)}><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"><h4${attr_style(`margin: 0; color: ${stringify(currentTheme.dark)}; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;`)}>Active Configuration</h4> <button${attr_style(`padding: 0.25rem 0.75rem; background-color: ${stringify(currentTheme.light)}; border: 1px solid ${stringify(currentTheme.border)}; border-radius: 6px; cursor: pointer; font-size: 0.75rem; color: ${stringify(currentTheme.dark)}; font-weight: 500;`)}>Modify</button></div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"><div><div${attr_style(`font-size: 0.75rem; color: ${stringify("#6b7280")}; margin-bottom: 0.25rem;`)}>Tokenizer</div> <div${attr_style(`font-size: 0.9rem; font-weight: 600; color: ${stringify(currentTheme.dark)};`)}>${escape_html(currentTokenizer.name)}</div> <div${attr_style(`font-size: 0.75rem; color: ${stringify("#6b7280")}; font-family: monospace; margin-top: 0.125rem;`)}>${escape_html(currentTokenizer.model)}</div></div> <div><div${attr_style(`font-size: 0.75rem; color: ${stringify("#6b7280")}; margin-bottom: 0.25rem;`)}>Strategy</div> <div${attr_style(`font-size: 0.9rem; font-weight: 600; color: ${stringify(currentTheme.dark)};`)}>${escape_html(strategies.find((s) => s.id === strategy).name)}</div> <div${attr_style(`font-size: 0.75rem; color: ${stringify("#6b7280")}; margin-top: 0.125rem;`)}>`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(maxTokens)} tokens/chunk`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div> `);
    if (chunks.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_style(`background-color: ${stringify(currentTheme.cardBg)}; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; box-shadow: ${stringify("0 2px 8px rgba(0,0,0,0.1)")}; border: 2px solid ${stringify(currentTheme.border)}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;`)}><div style="display: flex; gap: 2rem; align-items: center;"><div><div${attr_style(`font-size: 0.75rem; color: ${stringify("#6b7280")}; text-transform: uppercase; font-weight: 600;`)}>Total Chunks</div> <div${attr_style(`font-size: 1.5rem; font-weight: bold; color: ${stringify(currentTheme.primary)};`)}>${escape_html(chunks.length)}</div></div> <div><div${attr_style(`font-size: 0.75rem; color: ${stringify("#6b7280")}; text-transform: uppercase; font-weight: 600;`)}>Avg Words/Chunk</div> <div${attr_style(`font-size: 1.5rem; font-weight: bold; color: ${stringify(currentTheme.accent)};`)}>${escape_html(Math.round(chunks.reduce((sum, c) => sum + c.split(/\s+/).length, 0) / chunks.length))}</div></div></div> <div${attr_style(`font-size: 0.85rem; color: ${stringify("#6b7280")};`)}>Hover over chunks to see details</div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_style(`background-color: ${stringify(currentTheme.cardBg)}; border-radius: 12px; padding: 1.5rem; box-shadow: ${stringify("0 2px 8px rgba(0,0,0,0.1)")}; border: 2px solid ${stringify(currentTheme.border)}; min-height: 500px; display: flex; gap: 1.5rem;`)}><div${attr_style(`flex: ${stringify("1")};`)}><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"><h3${attr_style(`margin: 0; color: ${stringify(currentTheme.dark)};`)}>${escape_html(
      "Enter Text"
    )}</h3> <div style="display: flex; gap: 0.5rem;"><button${attr_style(`padding: 0.5rem 1rem; background-color: ${stringify(currentTheme.accent)}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;`)}>Load Sample</button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div><textarea placeholder="Paste your text here..."${attr_style(`width: 100%; height: 400px; padding: 1rem; border-radius: 8px; border: 2px solid ${stringify(currentTheme.border)}; font-size: 1rem; font-family: inherit; resize: vertical; box-sizing: border-box; line-height: 1.7; background-color: ${stringify("white")}; color: ${stringify(currentTheme.dark)};`)}>`);
      const $$body = escape_html(text);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea> <div${attr_style(`margin-top: 0.75rem; font-size: 0.85rem; color: ${stringify("#6b7280")};`)}>`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Paste text above or click "Load Sample" to get started`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
export {
  _page as default
};

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const MODEL      = "claude-sonnet-4-20250514";

/**
 * Call the Claude API.
 * @param {Array}  messages  - Array of { role: "user"|"assistant", content: string }
 * @param {string} system    - Optional system prompt
 * @param {number} maxTokens - Max tokens to generate (default 1000)
 * @returns {Promise<string>} - Plain text response
 */
export async function callClaude(messages, system = "", maxTokens = 1000) {
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    system: system || "You are EduAI, a smart educational assistant. Be concise, clear, and helpful.",
    messages,
  };

  const res  = await fetch(CLAUDE_API, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "Sorry, I could not generate a response.";
}

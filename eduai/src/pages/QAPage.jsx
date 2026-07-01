import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { DB } from "../lib/db";
import "../styles/qa.css";

const SUGGESTIONS = [
  "Explain the key concepts in my uploaded documents",
  "What are the main topics I should focus on?",
  "Give me a summary of the uploaded material",
  "What are the most important formulas or definitions?",
];

export default function QAPage() {
  const { user } = useApp();

  const initMessages = DB.chatHistory.length > 0
    ? DB.chatHistory
    : [
        {
          role: "ai",
          text: "Hello! Upload some documents and ask me anything — I'll answer based on your materials."
        }
      ];

  const [messages, setMessages] = useState(initMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // =========================
  // 🔥 SEND QUESTION
  // =========================
  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || thinking) return;

    setInput("");

    const userMsg = { role: "user", text: q };
    const updated = [...messages, userMsg];

    setMessages(updated);
    DB.chatHistory.push(userMsg);

    if (user?.stats) user.stats.qa = (user.stats.qa || 0) + 1;

    setThinking(true);

    try {
      // 🔥 CALL BACKEND
      const res = await fetch("http://127.0.0.1:9000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: q })
      });

      const data = await res.json();
      console.log("🔥 BACKEND:", data);

      // 🔥 choose best answer
      let finalAnswer = data.answer || "No answer";

      const aiMsg = {
        role: "ai",
        text: finalAnswer
      };

      DB.chatHistory.push(aiMsg);
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error("❌ Error:", err);

      const aiMsg = {
        role: "ai",
        text: "Backend error ❌ Make sure FastAPI is running"
      };

      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setThinking(false);
    }
  };

  const docsReady = DB.uploadedFiles.filter(f => f.status === "ready").length;

  return (
    <div className="fu">
      <div className="ph">
        <div className="pt">Ask Anything</div>
        <div className="ps">AI answers from your uploaded documents</div>
      </div>

      <div className="qa-layout">

        {/* CHAT */}
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-live-dot" />
            <div className="chat-title">EduAI — RAG System</div>
            <div className="chat-doc-cnt">
              {docsReady} doc{docsReady !== 1 ? "s" : ""} loaded
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "user" ? "u" : "a"}`}>
                {m.role === "ai" && <div className="msg-label">EDUAI</div>}
                {m.text}
              </div>
            ))}

            {thinking && (
              <div className="msg a typing">
                <div className="msg-label">EDUAI</div>
                <div className="dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* INPUT */}
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={1}
              placeholder="Ask about your uploaded materials… (Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />

            <button
              className="btn-send"
              onClick={() => send()}
              disabled={!input.trim() || thinking}
            >
              ➤
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Suggestions */}
          <div className="card">
            <div className="ct">💡 Suggested Questions</div>
            <div className="cs" style={{ marginBottom: 12 }}>
              Click to ask instantly
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="sugg-btn" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="ct">📊 Session Stats</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {[
                ["Questions asked", messages.filter(m => m.role === "user").length],
                ["Docs available", docsReady],
                ["Total messages", messages.length],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--t2)" }}>{l}</span>
                  <span style={{
                    fontFamily: "var(--fm)",
                    fontSize: 14,
                    color: "var(--gold)",
                    fontWeight: 600
                  }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Docs */}
          <div className="card">
            <div className="ct">📁 Loaded Documents</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {docsReady === 0 ? (
                <div style={{ fontSize: 13, color: "var(--t3)" }}>
                  No documents yet. Upload some files first.
                </div>
              ) : (
                DB.uploadedFiles
                  .filter(f => f.status === "ready")
                  .map(f => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{f.type === "img" ? "🖼️" : "📄"}</span>
                      <span style={{
                        fontSize: 13,
                        color: "var(--t2)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {f.name}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
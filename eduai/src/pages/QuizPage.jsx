import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { DB } from "../lib/db";
import "../styles/quiz.css";

export default function QuizPage() {
  const { user } = useApp();

  const [state, setState] = useState("config");
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [topic, setTopic] = useState("General Knowledge");
  const [numQ, setNumQ] = useState(5);

  // ⏱ Timer
  useEffect(() => {
    if (state !== "quiz" || revealed) return;
    if (timer <= 0) {
      handleReveal();
      return;
    }
    const t = setTimeout(() => setTimer(x => x - 1), 1000);
    return () => clearTimeout(t);
  });

  // 🚀 NEW: CALL YOUR BACKEND
  const generateQuiz = async () => {
    setState("loading");

    try {
      const res = await fetch("http://127.0.0.1:9000/generate-mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic,
          num_questions: numQ
        })
      });

      const data = await res.json();
      console.log("🔥 BACKEND MCQ:", data);

      if (!data.mcqs) {
        throw new Error("No MCQs returned");
      }

      // ✅ CASE 1: JSON already correct
      if (Array.isArray(data.mcqs)) {
        setQuestions(data.mcqs);
      }

      // ⚠️ CASE 2: string → convert to usable format
      else {
        const parsed = parseTextMCQ(data.mcqs);
        setQuestions(parsed);
      }

      setQIdx(0);
      setAnswers([]);
      setSelected(null);
      setRevealed(false);
      setTimer(30);
      setState("quiz");

    } catch (e) {
      console.error("❌ Quiz error:", e);
      alert("Failed to generate quiz");
      setState("config");
    }
  };

  // 🔥 convert plain text MCQ → JSON
  const parseTextMCQ = (text) => {
    const blocks = text.split("Q").slice(1);

    return blocks.map((b) => {
      const lines = b.split("\n").filter(x => x.trim());

      const q = lines[0].replace(/^\d+\.\s*/, "");

      const opts = lines.slice(1, 5).map(x =>
        x.replace(/^[A-D]\.\s*/, "")
      );

      const ansLine = lines.find(l => l.toLowerCase().includes("answer")) || "A";

      const ansLetter = ansLine.match(/[A-D]/)?.[0] || "A";
      const ans = ["A", "B", "C", "D"].indexOf(ansLetter);

      return { q, opts, ans, exp: "" };
    });
  };

  const handleReveal = () => {
    setRevealed(true);
    setAnswers(a => [...a, { q: qIdx, sel: selected }]);
  };

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      const allAnswers = [...answers, { q: qIdx, sel: selected }];
      const score = allAnswers.filter(a => a.sel === questions[a.q]?.ans).length;
      const pct = Math.round((score / questions.length) * 100);

      if (user?.stats) {
        user.stats.quizzes = (user.stats.quizzes || 0) + 1;
        user.stats.avgScore =
          ((user.stats.avgScore || 0) * (user.stats.quizzes - 1) + pct) /
          user.stats.quizzes;
      }

      DB.quizResults.push({
        date: new Date().toLocaleDateString(),
        score,
        total: questions.length,
        topic,
        pct
      });

      setAnswers(allAnswers);
      setState("result");
      return;
    }

    setQIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
    setTimer(30);
  };

  // CONFIG UI
  if (state === "config") return (
    <div className="fu">
      <div className="ph">
        <div className="pt">Quiz & MCQ</div>
        <div className="ps">AI generates questions from your documents</div>
      </div>

      <div className="gen-wrap">
        <div className="gen-icon">🧠</div>
        <div className="gen-title">Generate an AI-Powered Quiz</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380, margin: "0 auto" }}>
          <input className="fi" value={topic} onChange={e => setTopic(e.target.value)} />
          <select className="fi" value={numQ} onChange={e => setNumQ(Number(e.target.value))}>
            {[3,5,8,10].map(n => <option key={n}>{n}</option>)}
          </select>

          <button className="bact" onClick={generateQuiz}>
            Generate Quiz with AI →
          </button>
        </div>
      </div>
    </div>
  );

  if (state === "loading") return (
    <div className="fu">
      <div className="ph"><div className="pt">Generating Quiz…</div></div>
    </div>
  );

  if (state === "result") {
    const last = DB.quizResults.at(-1);
    return (
      <div className="fu">
        <div className="pt">Score: {last?.pct}%</div>
        <button onClick={() => setState("config")}>New Quiz</button>
      </div>
    );
  }

  // QUIZ UI
  const q = questions[qIdx];

  return (
    <div className="fu">
      <div>Q {qIdx + 1}/{questions.length}</div>
      <h3>{q?.q}</h3>

      {q?.opts?.map((opt, i) => (
        <button key={i} onClick={() => !revealed && setSelected(i)}>
          {opt}
        </button>
      ))}

      {!revealed
        ? <button onClick={handleReveal} disabled={selected === null}>Check</button>
        : <button onClick={handleNext}>Next</button>
      }
    </div>
  );
}
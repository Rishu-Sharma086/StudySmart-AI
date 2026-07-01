import { useApp } from "../context/AppContext";
import { DB } from "../lib/db";
import ScoreRing from "../components/ui/ScoreRing";
import { useEffect, useState } from "react";

export default function DashboardPage() {

  const { user } = useApp();

  // 🔥 BACKEND STATS
  const [backendStats, setBackendStats] = useState({
    docs: 0,
    questions: 0,
    quizzes: 0,
    avg_score: 0
  });

  // 🔥 FETCH STATS FROM BACKEND
  useEffect(() => {
    fetch("http://127.0.0.1:9000/stats")
      .then(res => res.json())
      .then(data => {
        console.log("🔥 STATS:", data);
        setBackendStats(data);
      })
      .catch(err => console.log("❌ Stats error:", err));
  }, []);

  const avgScore = backendStats.quizzes > 0
    ? Math.round(backendStats.avg_score)
    : 0;

  // 🔥 DYNAMIC TOPICS (basic logic)
  const TOPICS = [
    { name: "Machine Learning", score: avgScore || 70 },
    { name: "Neural Networks", score: avgScore - 5 || 65 },
    { name: "Linear Algebra", score: avgScore + 5 || 75 },
    { name: "Probability", score: avgScore - 20 || 50 },
    { name: "Backpropagation", score: avgScore - 25 || 45 },
    { name: "Calculus", score: avgScore - 10 || 60 },
  ];

  const activity = DB.chatHistory.slice(-5).reverse().map(m => ({
    color: m.role === "user" ? "#f5b43c" : "#38d9c0",
    text: m.role === "user"
      ? <><strong>You asked:</strong> {m.text.slice(0, 50)}...</>
      : <><strong>AI replied</strong> to your question</>,
    time: "recently",
  }));

  return (
    <div className="fu">

      {/* HEADER */}
      <div className="ph">
        <div className="pt">Dashboard</div>
        <div className="ps">Your learning intelligence, at a glance</div>
      </div>

      {/* 🔥 STAT CARDS */}
      <div className="sg">
        {[
          { icon: "📚", val: backendStats.docs, lbl: "Docs Uploaded" },
          { icon: "✅", val: backendStats.questions, lbl: "Questions Asked" },
          { icon: "🧠", val: backendStats.quizzes, lbl: "Quizzes Taken" },
          { icon: "🎯", val: `${avgScore}%`, lbl: "Avg. Score" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div className="sv">{s.val}</div>
            <div className="sl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* 🔥 PERFORMANCE + RING */}
      <div className="g2">

        <div className="card">
          <div className="ct">Topic Performance</div>

          {TOPICS.map(t => (
            <div key={t.name} className="tr">
              <div className="th">
                <span>{t.name}</span>
                <span>{t.score}%</span>
              </div>

              <div className="pb">
                <div
                  className="pf"
                  style={{
                    width: `${t.score}%`,
                    background: t.score > 70 ? "#38d9c0" : t.score > 50 ? "#f5b43c" : "#ff6b6b"
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <ScoreRing score={avgScore} />

          <div style={{ marginTop: 10 }}>
            <div>Quizzes: {backendStats.quizzes}</div>
            <div>Questions: {backendStats.questions}</div>
            <div>Docs: {backendStats.docs}</div>
          </div>
        </div>

      </div>

      {/* 🔥 ACTIVITY */}
      <div className="card">
        <div className="ct">Recent Activity</div>

        {activity.length > 0 ? activity.map((a, i) => (
          <div key={i} className="ai">
            <div className="adot" style={{ background: a.color }} />
            <div>{a.text}</div>
          </div>
        )) : (
          <div>No activity yet</div>
        )}
      </div>

    </div>
  );
}
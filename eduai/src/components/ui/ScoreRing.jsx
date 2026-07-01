export default function ScoreRing({ score = 0 }) {
  const r = 50, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;

  return (
    <div className="srw">
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: 8 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="9"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          strokeDashoffset={circ * 0.25}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f5b43c" />
            <stop offset="100%" stopColor="#ffd060" />
          </linearGradient>
        </defs>
      </svg>
      <div className="srv">{score}%</div>
      <div className="srl">Overall Score</div>
    </div>
  );
}

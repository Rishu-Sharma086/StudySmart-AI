import { useState, useEffect } from "react";
import OTPInput from "./OTPInput";
import { useApp } from "../../context/AppContext";

export default function OTPScreen({ email, tab, formData, onBack }) {
  const { login } = useApp();
  const [digits,    setDigits]    = useState(["","","","","",""]);
  const [countdown, setCountdown] = useState(120);
  const [err,       setErr]       = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
  try {
    await fetch("http://127.0.0.1:9000/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    setCountdown(120);
    setDigits(["","","","","",""]);
    setErr("");

  } catch (err) {
    setErr("Failed to resend OTP");
  }
};

  const handleVerify = async () => {
  const code = digits.join("");

  if (code.length < 6) {
    setErr("Enter all 6 digits.");
    return;
  }

  setErr("");

  try {
    const res = await fetch("http://127.0.0.1:9000/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        otp: code
      })
    });

    const data = await res.json();

    if (!data.success) {
      setErr("Invalid OTP ❌");
      return;
    }

    // ✅ LOGIN SUCCESS
    login({
  name: formData.name || email.split("@")[0],
  email: email
});

  } catch (err) {
    console.error(err);
    setErr("Server error");
  }
};

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="alogo">
          <div className="alogo-ic">🎓</div>
          <div className="alogo-txt">Edu<span>AI</span></div>
        </div>

        <div className="atitle">Verify your email</div>
        <div className="asub">
          We sent a 6-digit code to&nbsp;
          <strong style={{ color: "var(--gsoft)" }}>{email}</strong>
        </div>

        

        <OTPInput digits={digits} onChange={setDigits} />

        {err && <div className="errmsg">⚠ {err}</div>}

        <button
          className="btn-p"
          onClick={handleVerify}
          disabled={digits.join("").length < 6}
        >
          Verify & Continue →
        </button>

        <div className="resend-row">
          {countdown > 0 ? (
            <>Resend in <span style={{ color: "var(--gold)", fontFamily: "var(--fm)" }}>{countdown}s</span></>
          ) : (
            <button className="resend-btn" onClick={handleResend}>Resend OTP</button>
          )}
        </div>

        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

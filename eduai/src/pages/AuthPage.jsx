import { useState } from "react";
import { useApp } from "../context/AppContext";
import OTPScreen from "../components/auth/OTPScreen";
import "../styles/auth.css";

export default function AuthPage() {
  const { login } = useApp();
  const [tab,      setTab]      = useState("login");   // "login" | "signup"
  const [step,     setStep]     = useState("form");    // "form"  | "otp"
  const [form,     setForm]     = useState({ name: "", email: "", password: "" });
  const [err,      setErr]      = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const switchTab = (t) => { setTab(t); setErr(""); setStep("form"); };

const handleSendOTP = async () => {
  setErr("");

  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
    return setErr("Please enter a valid email address.");
  }

  if (tab === "login") {
    login({
      name: form.email.split("@")[0],
      email: form.email
    });
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:9000/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: form.email })
    });

    const data = await res.json();

    if (data.message) {
      if (tab === "signup") {
    setStep("otp");   // OTP only for signup
  } else {
    // login direct
    // yaha verify password already ho chuka hai
    login({
  name: form.name || form.email.split("@")[0],
  email: form.email
});
  }   // OTP screen open
    } else {
      setErr("Failed to send OTP");
    }

  } catch (err) {
    console.error(err);
    setErr("Server error. Try again.");
  }
};

  if (step === "otp") return (
    <OTPScreen
     email={form.email}
     tab={tab}
     formData={form}
     onBack={() => { setStep("form"); setErr(""); }}
    />
  );

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo */}
        <div className="alogo">
          <div className="alogo-ic">🎓</div>
          <div className="alogo-txt">Edu<span>AI</span></div>
        </div>

        <div className="atitle">{tab === "login" ? "Welcome back" : "Create account"}</div>
        <div className="asub">
          {tab === "login"
            ? "Sign in to continue your learning journey"
            : "Join EduAI — powered by Claude AI"}
        </div>

        {/* Tabs */}
        <div className="atabs">
          <button className={`atab ${tab === "login"  ? "active" : ""}`} onClick={() => switchTab("login") }>Sign In</button>
          <button className={`atab ${tab === "signup" ? "active" : ""}`} onClick={() => switchTab("signup")}>Sign Up</button>
        </div>

        {/* Fields */}
        {tab === "signup" && (
          <div className="fg">
            <label className="fl">Full Name</label>
            <input
              className={`fi ${err && !form.name ? "err" : ""}`}
              placeholder="Arjun Sharma"
              value={form.name}
              onChange={e => set("name", e.target.value)}
            />
          </div>
        )}

        <div className="fg">
          <label className="fl">Email Address</label>
          <input
            className="fi"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendOTP()}
          />
        </div>

        <div className="fg">
          <label className="fl">Password</label>
          <input
            className="fi"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => set("password", e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendOTP()}
          />
        </div>

        {err && <div className="errmsg" style={{ marginBottom: 12 }}>⚠ {err}</div>}

        <button className="btn-p" onClick={handleSendOTP}>
          {tab === "login" ? "Send OTP & Sign In →" : "Send OTP & Sign Up →"}
        </button>
      </div>
    </div>
  );
}

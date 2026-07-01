import { useState } from "react";
import { useApp } from "../context/AppContext";
import { DB } from "../lib/db";
import "../styles/profile.css";

export default function ProfilePage() {
  const { user, updateUser } = useApp();

  const [form, setForm] = useState({
    name:        user?.name        || "",
    email:       user?.email       || "",
    bio:         user?.bio         || "",
    institution: user?.institution || "",
  });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPwd2 = (k, v) => setPwd(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setErr("");
    if (!form.name.trim()) return setErr("Name cannot be empty.");
    if (pwd.next) {
      if (pwd.current !== user?.password) return setErr("Current password is incorrect.");
      if (pwd.next.length < 6)            return setErr("New password must be 6+ characters.");
      if (pwd.next !== pwd.confirm)       return setErr("Passwords do not match.");
    }
    const updates = { ...form };
    if (pwd.next) updates.password = pwd.next;
    updates.initials = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    updateUser(updates);
    setPwd({ current: "", next: "", confirm: "" });
  };

  const stats = user?.stats || {};
  const statItems = [
    [stats.quizzes || 0,                          "Quizzes"  ],
    [stats.qa      || 0,                          "Q&A"      ],
    [DB.uploadedFiles.length || 0,                "Docs"     ],
    [(Math.round(stats.avgScore) || 0) + "%",     "Avg Score"],
  ];

  return (
    <div className="fu">
      <div className="ph">
        <div className="pt">Profile & Settings</div>
        <div className="ps">Manage your account information</div>
      </div>

      <div className="profile-banner" />

      <div className="profile-card-body">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user?.initials}</div>
        </div>
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email} · Joined {user?.joined}</div>
        <div className="profile-stats">
          {statItems.map(([v, l]) => (
            <div key={l}>
              <div className="profile-stat-val">{v}</div>
              <div className="profile-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        {/* Personal info */}
        <div className="settings-heading">Personal Information</div>
        <div className="settings-grid">
          <div className="fg">
            <label className="fl">Full Name</label>
            <input className="fi" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">Email</label>
            <input className="fi" type="email" value={form.email} disabled style={{ opacity: .6 }} />
          </div>
          <div className="fg">
            <label className="fl">Institution</label>
            <input className="fi" value={form.institution} onChange={e => set("institution", e.target.value)} placeholder="e.g. IIT Madras" />
          </div>
          <div className="fg">
            <label className="fl">Bio</label>
            <input className="fi" value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Tell us about yourself" />
          </div>
        </div>

        <hr className="settings-divider" />

        {/* Password change */}
        <div className="settings-heading">Change Password</div>
        <div className="settings-grid">
          <div className="fg">
            <label className="fl">Current Password</label>
            <input className="fi" type="password" placeholder="••••••••" value={pwd.current} onChange={e => setPwd2("current", e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">New Password</label>
            <input className="fi" type="password" placeholder="••••••••" value={pwd.next}    onChange={e => setPwd2("next", e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">Confirm New Password</label>
            <input className="fi" type="password" placeholder="••••••••" value={pwd.confirm} onChange={e => setPwd2("confirm", e.target.value)} />
          </div>
        </div>

        {err && <div className="errmsg" style={{ marginBottom: 14 }}>⚠ {err}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="bact" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

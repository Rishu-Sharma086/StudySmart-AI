import { useApp } from "../../context/AppContext";
import "../../styles/sidebar.css";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard"        },
  { id: "upload",    icon: "↑", label: "Upload Materials"  },
  { id: "qa",        icon: "💬", label: "Ask Questions"     },
  { id: "quiz",      icon: "🎯", label: "Quiz & MCQ"        },
  { id: "profile",   icon: "◉", label: "Profile"           },
];

export default function Sidebar() {
  const { user, page, setPage, logout } = useApp();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-ic">🎓</div>
        <div className="sb-logo-n">Smart<span>AI</span></div>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <div className="nav-lbl">Main</div>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-i ${page === n.id ? "on" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sb-foot">
        <div className="upill" onClick={() => setPage("profile")}>
          <div className="av">{user?.initials}</div>
          <div className="uinfo">
            <div className="uname">{user?.name}</div>
            <div className="urole">Student</div>
          </div>
          <span className="ugear">⚙</span>
        </div>
        <button className="btn-lo" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  );
}

export default function Toast({ msg, type = "ok" }) {
  return <div className={`toast ${type === "err" ? "err" : ""}`}>{msg}</div>;
}

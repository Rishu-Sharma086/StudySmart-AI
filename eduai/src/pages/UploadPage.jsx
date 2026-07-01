import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { DB } from "../lib/db";
import "../styles/upload.css";

const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 50 * 1024 * 1024;

function fmtSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function readText(file) {
  return new Promise(resolve => {
    if (file.type.startsWith("image/")) {
      resolve("[IMAGE — analyzed visually by AI]");
      return;
    }
    const r = new FileReader();
    r.onload = e => resolve((e.target.result || "").slice(0, 5000));
    r.onerror = () => resolve("");
    r.readAsText(file);
  });
}

export default function UploadPage() {
  const { user, forceUpdate, showToast } = useApp();
  const [files, setFiles] = useState([...DB.uploadedFiles]);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const refresh = () => setFiles([...DB.uploadedFiles]);

  const processFiles = async (raw) => {
    for (const file of Array.from(raw)) {

      if (!ALLOWED.includes(file.type)) {
        showToast(`❌ "${file.name}" — unsupported format`, "err");
        continue;
      }

      if (file.size > MAX_BYTES) {
        showToast(`❌ "${file.name}" exceeds 50 MB`, "err");
        continue;
      }

      if (DB.uploadedFiles.find(f => f.name === file.name && f.rawSize === file.size)) {
        continue;
      }

      const entry = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: fmtSize(file.size),
        rawSize: file.size,
        type: file.type.startsWith("image/") ? "img" : "pdf",
        mime: file.type,
        status: "processing",
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        content: "",
      };

      DB.uploadedFiles.push(entry);
      refresh();

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://127.0.0.1:9000/upload-pdf", {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("Upload failed");

        let data = {};
        try {
          data = await res.json();
        } catch {
          console.warn("⚠️ Non JSON response");
        }

        console.log("✅ Backend response:", data);

        // AFTER SUCCESS
        const text = await readText(file);
        entry.content = text;
        entry.status = "ready";

        showToast(`✅ "${file.name}" uploaded`);

      } catch (err) {
        console.error("❌ Upload failed:", err);

        entry.status = "error";
        showToast(`❌ "${file.name}" failed`, "err");
      }

      if (user?.stats) user.stats.docs = DB.uploadedFiles.length;

      refresh();
      forceUpdate();
    }
  };

  const removeFile = (id) => {
    const idx = DB.uploadedFiles.findIndex(f => f.id === id);
    if (idx !== -1) {
      if (DB.uploadedFiles[idx].url) URL.revokeObjectURL(DB.uploadedFiles[idx].url);
      DB.uploadedFiles.splice(idx, 1);
    }
    refresh();
    if (preview?.id === id) setPreview(null);
  };

  const clearAll = () => {
    DB.uploadedFiles.forEach(f => {
      if (f.url) URL.revokeObjectURL(f.url);
    });
    DB.uploadedFiles.length = 0;
    refresh();
    setPreview(null);
  };

  const readyCount = files.filter(f => f.status === "ready").length;

  return (
    <div className="fu">
      <div className="ph">
        <div className="pt">Upload Materials</div>
        <div className="ps">Add PDFs and images — AI will learn from them</div>
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={e => {
          processFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Drop zone */}
      <div
        className={`uzone ${dragging ? "drag" : ""}`}
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current.click()}
      >
        <div className="uzone-icon">{dragging ? "📂" : "☁️"}</div>
        <div className="uzone-title">
          {dragging ? "Release to upload" : "Drop files here or click to browse"}
        </div>
        <div className="uzone-sub">
          Supports <span>PDF, PNG, JPG, WEBP</span> — up to 50 MB per file
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {files.length} File{files.length > 1 ? "s" : ""} · {readyCount} Ready
            </div>
            <button onClick={clearAll}>Clear All</button>
          </div>

          <div className="file-list">
            {files.map(f => (
              <div key={f.id} className="file-item">
                {f.type === "img" && f.url
                  ? <img src={f.url} alt={f.name} className="file-thumb" />
                  : <span>📄</span>
                }

                <div>
                  <div>{f.name}</div>
                  <div>{f.size}</div>
                </div>

                <span>
                  {f.status === "ready"
                    ? "✓ Ready"
                    : f.status === "error"
                    ? "❌ Failed"
                    : "⟳ Processing"}
                </span>

                <button onClick={() => removeFile(f.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
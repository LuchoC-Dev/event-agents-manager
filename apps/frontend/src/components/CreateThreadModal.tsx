import { useState } from "react";
import type { Agent, Thread } from "@eam/shared";

const BASE = "http://localhost:3001/api";

interface Props {
  projectId: string;
  agents: Agent[];
  threads: Thread[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateThreadModal({ projectId, agents, threads, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    ownerAgentId: agents[0]?.id ?? "",
    parentThreadId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${BASE}/projects/${projectId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          description: form.description || undefined,
          parentThreadId: form.parentThreadId || undefined,
        }),
      });
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Nuevo Thread</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <Field label="Título *">
            <input style={input} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Implement Login System" />
          </Field>
          <Field label="Descripción">
            <textarea style={{ ...input, height: 70, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción del workflow..." />
          </Field>
          <Field label="Agente responsable *">
            <select style={input} required value={form.ownerAgentId} onChange={(e) => setForm({ ...form, ownerAgentId: e.target.value })}>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
            </select>
          </Field>
          <Field label="Thread padre (sub-thread)">
            <select style={input} value={form.parentThreadId} onChange={(e) => setForm({ ...form, parentThreadId: e.target.value })}>
              <option value="">— ninguno —</option>
              {threads.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancelar</button>
            <button type="submit" disabled={loading || !form.ownerAgentId} style={submitBtn}>{loading ? "Creando..." : "Crear Thread"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 };
const modal: React.CSSProperties = { background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 24, width: 460, maxHeight: "90vh", overflowY: "auto" };
const input: React.CSSProperties = { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "8px 10px", color: "#f1f5f9", fontSize: 13, boxSizing: "border-box" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 };
const cancelBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13 };
const submitBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };

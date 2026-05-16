import { useState } from "react";
import type { Agent } from "@eam/shared";

const BASE = "http://localhost:3001/api";

interface Props {
  projectId: string;
  agents: Agent[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAgentModal({ projectId, agents, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    category: "permanent" as "permanent" | "temporary",
    department: "",
    parentId: "",
    systemPrompt: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${BASE}/projects/${projectId}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parentId: form.parentId || undefined,
          department: form.department || undefined,
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
          <h2 style={{ margin: 0, fontSize: 16 }}>Nuevo Agente</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <Field label="Nombre *">
            <input style={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CEO Agent" />
          </Field>
          <Field label="Rol *">
            <input style={input} required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Chief Executive Officer" />
          </Field>
          <Field label="Categoría">
            <select style={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as "permanent" | "temporary" })}>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          </Field>
          <Field label="Departamento">
            <input style={input} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" />
          </Field>
          <Field label="Manager (superior)">
            <select style={input} value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">— ninguno —</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
            </select>
          </Field>
          <Field label="System Prompt">
            <textarea style={{ ...input, height: 80, resize: "vertical" }} value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} placeholder="Describí el rol y responsabilidades del agente..." />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancelar</button>
            <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Creando..." : "Crear Agente"}</button>
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
const modal: React.CSSProperties = { background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 24, width: 480, maxHeight: "90vh", overflowY: "auto" };
const input: React.CSSProperties = { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "8px 10px", color: "#f1f5f9", fontSize: 13, boxSizing: "border-box" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 };
const cancelBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13 };
const submitBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };

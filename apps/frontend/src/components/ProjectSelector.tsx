import { useState } from "react";
import type { Project } from "@eam/shared";

interface Props {
  projects: Project[];
  onSelect: (project: Project) => void;
  onCreate: (name: string, description?: string) => Promise<Project>;
}

export function ProjectSelector({ projects, onSelect, onCreate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const project = await onCreate(name.trim(), description.trim() || undefined);
      onSelect(project);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Event Agent Manager</h1>
          <p style={{ margin: "8px 0 0", color: "#475569", fontSize: 13 }}>
            Seleccioná un proyecto o creá uno nuevo
          </p>
        </div>

        {/* Lista de proyectos existentes */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Proyectos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  style={projectBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#1e3a5f22"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, textAlign: "left" }}>{p.name}</div>
                  {p.description && (
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, textAlign: "left" }}>{p.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Separador */}
        {projects.length > 0 && !showForm && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#334155" }} />
            <span style={{ fontSize: 11, color: "#475569" }}>o</span>
            <div style={{ flex: 1, height: 1, background: "#334155" }} />
          </div>
        )}

        {/* Botón o formulario de creación */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={createBtn}>
            + Nuevo Proyecto
          </button>
        ) : (
          <form onSubmit={handleCreate}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Nuevo Proyecto
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                autoFocus
                style={input}
                placeholder="Nombre del proyecto *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                style={input}
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setName(""); setDescription(""); }}
                style={cancelBtn}
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading || !name.trim()} style={submitBtn}>
                {loading ? "Creando..." : "Crear y Entrar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  height: "100vh", background: "#0f172a", color: "#f1f5f9",
  fontFamily: "Inter, system-ui, sans-serif",
};
const card: React.CSSProperties = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 14,
  padding: 32, width: 400,
};
const projectBtn: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 8,
  border: "1px solid #334155", background: "transparent", color: "#f1f5f9",
  cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
};
const createBtn: React.CSSProperties = {
  width: "100%", padding: "11px", borderRadius: 8,
  border: "1px dashed #334155", background: "transparent",
  color: "#94a3b8", cursor: "pointer", fontSize: 13,
};
const input: React.CSSProperties = {
  width: "100%", background: "#0f172a", border: "1px solid #334155",
  borderRadius: 6, padding: "9px 12px", color: "#f1f5f9", fontSize: 13,
  boxSizing: "border-box",
};
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: "9px", borderRadius: 6, border: "1px solid #334155",
  background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13,
};
const submitBtn: React.CSSProperties = {
  flex: 2, padding: "9px", borderRadius: 6, border: "none",
  background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
};

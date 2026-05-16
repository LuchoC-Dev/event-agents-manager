import { useEffect, useState, useMemo } from "react";
import type { Thread, AgentEvent, Agent, EventType } from "@eam/shared";

const API = "http://localhost:3001/api";


const EVENT_COLORS: Record<string, string> = {
  THREAD_CREATED: "#6366f1",
  TASK_ASSIGNED: "#3b82f6",
  TASK_STARTED: "#f59e0b",
  TASK_COMPLETED: "#22c55e",
  DELEGATED: "#8b5cf6",
  AGENT_SPAWNED: "#06b6d4",
  AGENT_ARCHIVED: "#6b7280",
  SUMMARY_CREATED: "#10b981",
  BLOCKED: "#ef4444",
  UNBLOCKED: "#22c55e",
  ERROR: "#dc2626",
  RUNTIME_ARCHIVED: "#6b7280",
};

interface Props {
  projectId: string;
  thread: Thread;
  agents: Agent[];
  onClose: () => void;
}

export function ThreadTimeline({ projectId, thread, agents, onClose }: Props) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [filterType, setFilterType] = useState<EventType | "ALL">("ALL");
  const [filterAgent, setFilterAgent] = useState<string>("ALL");

  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));

  useEffect(() => {
    fetch(`${API}/projects/${projectId}/threads/${thread.id}/events`)
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); });
  }, [projectId, thread.id]);

  const refresh = () => {
    fetch(`${API}/projects/${projectId}/threads/${thread.id}/events`)
      .then((r) => r.json())
      .then(setEvents);
  };

  const involvedAgentIds = useMemo(() => {
    const ids = new Set<string>();
    events.forEach((e) => { ids.add(e.agentId); if (e.targetAgentId) ids.add(e.targetAgentId); });
    return [...ids];
  }, [events]);

  const eventTypes = useMemo(() => {
    return [...new Set(events.map((e) => e.type))] as EventType[];
  }, [events]);

  const filtered = useMemo(() => events.filter((e) => {
    if (filterType !== "ALL" && e.type !== filterType) return false;
    if (filterAgent !== "ALL" && e.agentId !== filterAgent && e.targetAgentId !== filterAgent) return false;
    return true;
  }), [events, filterType, filterAgent]);

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>{thread.title}</h2>
            {thread.description && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{thread.description}</p>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowEventForm(true)} style={addBtn}>+ Evento</button>
            <button onClick={onClose} style={closeBtn}>✕</button>
          </div>
        </div>

        {showEventForm && (
          <AddEventForm
            projectId={projectId}
            thread={thread}
            agents={agents}
            onCreated={() => { refresh(); setShowEventForm(false); }}
            onCancel={() => setShowEventForm(false)}
          />
        )}

        <div style={{ fontSize: 12, color: "#475569", marginBottom: 14 }}>
          {filtered.length} de {events.length} evento{events.length !== 1 ? "s" : ""} · status: <strong style={{ color: "#94a3b8" }}>{thread.status}</strong>
        </div>

        {/* Filtros */}
        {events.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | "ALL")}
              style={filterSelect}
            >
              <option value="ALL">Todos los tipos</option>
              {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              style={filterSelect}
            >
              <option value="ALL">Todos los agentes</option>
              {involvedAgentIds.map((id) => (
                <option key={id} value={id}>{agentMap[id]?.name ?? id.slice(0, 8)}</option>
              ))}
            </select>
            {(filterType !== "ALL" || filterAgent !== "ALL") && (
              <button onClick={() => { setFilterType("ALL"); setFilterAgent("ALL"); }} style={clearFilterBtn}>
                ✕ Limpiar
              </button>
            )}
          </div>
        )}

        {loading && <div style={{ color: "#475569" }}>Cargando...</div>}

        <div style={{ position: "relative" }}>
          {filtered.map((ev, i) => {
            const agent = agentMap[ev.agentId];
            const targetAgent = ev.targetAgentId ? agentMap[ev.targetAgentId] : null;
            const color = EVENT_COLORS[ev.type] ?? "#6b7280";
            const date = new Date(ev.createdAt);
            const p = ev.payload as Record<string, string>;
            const mainText = p.task ?? p.result ?? p.reason ?? p.decision;
            const hasExtraPayload = Object.keys(ev.payload).length > 0 && !mainText;

            return (
              <div key={ev.id} style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4 }} />
                  {i < filtered.length - 1 && <div style={{ width: 2, flex: 1, background: "#1e293b", minHeight: 24 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 20 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{ev.type}</span>
                    <span style={{ fontSize: 11, color: "#475569" }}>
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    <strong style={{ color: "#cbd5e1" }}>{agent?.name ?? ev.agentId}</strong>
                    {targetAgent && <> → <strong style={{ color: "#cbd5e1" }}>{targetAgent.name}</strong></>}
                  </div>
                  {mainText && (
                    <div style={{ marginTop: 6, background: "#0f172a", borderRadius: 6, padding: "7px 10px", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                      {mainText}
                    </div>
                  )}
                  {hasExtraPayload && (
                    <div style={{ marginTop: 6, background: "#0f172a", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                      {JSON.stringify(ev.payload, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div style={{ color: "#475569", fontSize: 13 }}>
              {events.length === 0 ? "No hay eventos todavía." : "No hay eventos con estos filtros."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddEventForm({ projectId, thread, agents, onCreated, onCancel }: {
  projectId: string;
  thread: Thread;
  agents: Agent[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    type: "TASK_ASSIGNED",
    agentId: agents[0]?.id ?? "",
    targetAgentId: "",
    payload: "{}",
  });
  const [loading, setLoading] = useState(false);
  const [payloadError, setPayloadError] = useState("");

  const EVENT_TYPES = [
    "TASK_ASSIGNED","TASK_STARTED","TASK_COMPLETED","DELEGATED",
    "AGENT_SPAWNED","AGENT_ARCHIVED","SUMMARY_CREATED","BLOCKED","UNBLOCKED","ERROR",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(form.payload);
      setPayloadError("");
    } catch {
      setPayloadError("Payload no es JSON válido");
      return;
    }
    setLoading(true);
    try {
      await fetch(`http://localhost:3001/api/projects/${projectId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          threadId: thread.id,
          agentId: form.agentId,
          targetAgentId: form.targetAgentId || undefined,
          payload,
        }),
      });
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  const fld: React.CSSProperties = {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: 6, padding: "6px 10px", color: "#f1f5f9", fontSize: 12,
    boxSizing: "border-box",
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Tipo de evento</label>
          <select style={fld} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Agente origen</label>
          <select style={fld} value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })}>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Agente destino (opcional)</label>
          <select style={fld} value={form.targetAgentId} onChange={(e) => setForm({ ...form, targetAgentId: e.target.value })}>
            <option value="">— ninguno —</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3 }}>Payload (JSON)</label>
          <input style={{ ...fld, borderColor: payloadError ? "#ef4444" : "#334155" }} value={form.payload} onChange={(e) => setForm({ ...form, payload: e.target.value })} placeholder='{"key":"value"}' />
          {payloadError && <span style={{ fontSize: 10, color: "#ef4444" }}>{payloadError}</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          {loading ? "..." : "Agregar"}
        </button>
      </div>
    </form>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "#00000088",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
};
const panel: React.CSSProperties = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
  padding: 28, width: 580, maxHeight: "85vh", overflowY: "auto",
};
const closeBtn: React.CSSProperties = {
  background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16,
};
const addBtn: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 6, border: "1px solid #334155",
  background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 12,
};

const filterSelect: React.CSSProperties = {
  background: "#0f172a", border: "1px solid #334155", borderRadius: 6,
  padding: "5px 10px", color: "#94a3b8", fontSize: 12, cursor: "pointer",
};

const clearFilterBtn: React.CSSProperties = {
  background: "none", border: "1px solid #334155", borderRadius: 6,
  padding: "5px 10px", color: "#475569", cursor: "pointer", fontSize: 12,
};

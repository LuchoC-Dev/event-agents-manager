import type { Agent, AgentEvent } from "@eam/shared";

const EVENT_COLORS: Record<string, string> = {
  THREAD_CREATED: "#6366f1", TASK_ASSIGNED: "#3b82f6", TASK_STARTED: "#f59e0b",
  TASK_COMPLETED: "#22c55e", DELEGATED: "#8b5cf6", AGENT_SPAWNED: "#06b6d4",
  AGENT_ARCHIVED: "#6b7280", SUMMARY_CREATED: "#10b981", BLOCKED: "#ef4444",
  UNBLOCKED: "#22c55e", ERROR: "#dc2626", RUNTIME_ARCHIVED: "#6b7280",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "#6b7280", working: "#3b82f6", blocked: "#ef4444",
  completed: "#22c55e", archived: "#a1a1aa",
};

interface Props {
  agent: Agent;
  agents: Agent[];
  events: AgentEvent[];
  onClose: () => void;
}

export function AgentDetail({ agent, agents, events, onClose }: Props) {
  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

  const agentEvents = events
    .filter((e) => e.agentId === agent.id || e.targetAgentId === agent.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const assigned = events.filter((e) => e.type === "TASK_ASSIGNED" && e.targetAgentId === agent.id).length;
  const completed = events.filter((e) => e.type === "TASK_COMPLETED" && e.agentId === agent.id).length;
  const errors = events.filter((e) => e.type === "ERROR" && (e.agentId === agent.id || e.targetAgentId === agent.id)).length;

  const currentTask = agent.status === "working"
    ? events
        .filter((e) => e.type === "TASK_ASSIGNED" && e.targetAgentId === agent.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <div style={overlay}>
      <div style={panel}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: STATUS_COLORS[agent.status] + "22",
              border: `2px solid ${STATUS_COLORS[agent.status]}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              {agent.category === "permanent" ? "🤖" : "⚡"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{agent.name}</h2>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>{agent.role}</div>
              {agent.department && <div style={{ color: "#475569", fontSize: 12, marginTop: 1 }}>📂 {agent.department}</div>}
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={badge(STATUS_COLORS[agent.status])}>{agent.status}</span>
          <span style={badge(agent.category === "permanent" ? "#1d4ed8" : "#7c3aed")}>{agent.category}</span>
          {errors > 0 && <span style={badge("#dc2626")}>⚠ {errors} error{errors !== 1 ? "s" : ""}</span>}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          <Stat label="Asignadas" value={assigned} color="#3b82f6" />
          <Stat label="Completadas" value={completed} color="#22c55e" />
          <Stat label="Errores" value={errors} color={errors > 0 ? "#ef4444" : "#475569"} />
        </div>

        {/* Tarea actual */}
        {currentTask && (
          <div style={{ background: "#0f172a", border: "1px solid #3b82f6", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Tarea actual</div>
            <div style={{ fontSize: 12, color: "#cbd5e1" }}>
              {(currentTask.payload as Record<string, string>).task ?? JSON.stringify(currentTask.payload)}
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
              Asignada por {agentMap[currentTask.agentId] ?? currentTask.agentId} · {new Date(currentTask.createdAt).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* System prompt */}
        {agent.systemPrompt && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>System Prompt</div>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
              {agent.systemPrompt}
            </div>
          </div>
        )}

        {/* Historial */}
        <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Historial · {agentEvents.length} evento{agentEvents.length !== 1 ? "s" : ""}
        </div>

        <div style={{ position: "relative" }}>
          {agentEvents.length === 0 && (
            <div style={{ color: "#475569", fontSize: 13 }}>Sin actividad todavía.</div>
          )}
          {agentEvents.map((ev, i) => {
            const color = EVENT_COLORS[ev.type] ?? "#6b7280";
            const isOrigin = ev.agentId === agent.id;
            const other = isOrigin
              ? (ev.targetAgentId ? agentMap[ev.targetAgentId] ?? ev.targetAgentId : null)
              : (agentMap[ev.agentId] ?? ev.agentId);
            const mainPayloadKey = (ev.payload as Record<string, string>).task ?? (ev.payload as Record<string, string>).result ?? (ev.payload as Record<string, string>).reason;

            return (
              <div key={ev.id} style={{ display: "flex", gap: 14, marginBottom: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4 }} />
                  {i < agentEvents.length - 1 && <div style={{ width: 2, flex: 1, background: "#1e293b", minHeight: 20 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 16 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{ev.type}</span>
                    {!isOrigin && <span style={{ fontSize: 10, color: "#475569" }}>← recibido</span>}
                    <span style={{ fontSize: 10, color: "#475569" }}>{new Date(ev.createdAt).toLocaleString()}</span>
                  </div>
                  {other && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {isOrigin ? `→ ${other}` : `de ${other}`}
                    </div>
                  )}
                  {mainPayloadKey && (
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>
                      "{mainPayloadKey}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function badge(color: string): React.CSSProperties {
  return {
    fontSize: 11, padding: "2px 10px", borderRadius: 99,
    background: color + "22", color, border: `1px solid ${color}44`,
    fontWeight: 600,
  };
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "#00000099",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
};

const panel: React.CSSProperties = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 14,
  padding: 28, width: 560, maxHeight: "88vh", overflowY: "auto",
};

const closeBtn: React.CSSProperties = {
  background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, flexShrink: 0,
};

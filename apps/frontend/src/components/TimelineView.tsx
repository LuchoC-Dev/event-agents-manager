import type { AgentEvent, Agent } from "@eam/shared";

const EVENT_COLORS: Record<string, string> = {
  INSTRUCTION_CREATED:    "#6366f1",
  INSTRUCTION_ACCEPTED:   "#eab308",
  INSTRUCTION_REJECTED:   "#ef4444",
  INSTRUCTION_RESPONDED:  "#a855f7",
  INSTRUCTION_COMPLETED:  "#22c55e",
  INSTRUCTION_CANCELLED:  "#6b7280",
  REVIEW_REQUESTED:       "#f97316",
  REVIEW_APPROVED:        "#22c55e",
  REVIEW_REJECTED:        "#ef4444",
  RETRY_REQUESTED:        "#f59e0b",
  AGENT_REGISTERED:       "#3b82f6",
  THREAD_CREATED:         "#06b6d4",
};

function getColor(type: string) {
  return EVENT_COLORS[type] ?? "#475569";
}

interface Props {
  events: AgentEvent[];
  agents: Agent[];
}

export function TimelineView({ events, agents }: Props) {
  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));
  const sorted = [...events].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  if (!sorted.length) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
        <div style={{ fontSize: 14 }}>Sin eventos aún. Los eventos aparecen aquí en tiempo real.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <div style={{ position: "relative" }}>
        {/* línea vertical */}
        <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: "#1e293b" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {sorted.map((e, idx) => {
            const color = getColor(e.type);
            const isNew = idx === sorted.length - 1;
            return (
              <div key={e.id} style={{ display: "flex", gap: 20, alignItems: "flex-start", position: "relative", paddingBottom: 20 }}>
                {/* dot */}
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                  marginTop: 4,
                  zIndex: 1,
                  boxShadow: isNew ? `0 0 0 4px ${color}33` : "none",
                  transition: "box-shadow 0.3s",
                }} />

                {/* content */}
                <div style={{ flex: 1, background: "#1e293b", border: `1px solid ${color}22`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{e.type}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>#{e.sequenceNumber}</span>
                      <span style={{ fontSize: 11, color: "#475569" }}>
                        {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "#0f172a", padding: "2px 8px", borderRadius: 99 }}>
                      {agentMap[e.agentId] ?? e.agentId.slice(0, 8)}
                    </span>
                    {e.targetAgentId && (
                      <>
                        <span style={{ color: "#334155" }}>→</span>
                        <span style={{ background: "#0f172a", padding: "2px 8px", borderRadius: 99 }}>
                          {agentMap[e.targetAgentId] ?? e.targetAgentId.slice(0, 8)}
                        </span>
                      </>
                    )}
                    {e.instructionId && (
                      <span style={{ color: "#334155", fontFamily: "monospace", fontSize: 11 }}>
                        inst:{e.instructionId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

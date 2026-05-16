import { useEffect, useState } from "react";
import type { Agent, AgentEvent } from "@eam/shared";
import type { Instruction, InstructionRelation } from "@eam/shared";

const BASE = "http://localhost:3001/api";

const STATUS_CONFIG: Record<string, { color: string; emoji: string }> = {
  created:     { color: "#6b7280", emoji: "⬜" },
  received:    { color: "#3b82f6", emoji: "🔵" },
  accepted:    { color: "#eab308", emoji: "🟡" },
  in_progress: { color: "#f97316", emoji: "🟠" },
  responded:   { color: "#a855f7", emoji: "🟣" },
  completed:   { color: "#22c55e", emoji: "🟢" },
  rejected:    { color: "#ef4444", emoji: "🔴" },
  error:       { color: "#dc2626", emoji: "❌" },
  cancelled:   { color: "#374151", emoji: "⚫" },
};

interface DetailData extends Instruction {
  events: AgentEvent[];
  relations: InstructionRelation[];
}

interface Props {
  projectId: string;
  instructionId: string;
  agents: Agent[];
  onClose: () => void;
}

export function InstructionDetail({ projectId, instructionId, agents, onClose }: Props) {
  const [data, setData] = useState<DetailData | null>(null);
  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

  useEffect(() => {
    fetch(`${BASE}/projects/${projectId}/instructions/${instructionId}`)
      .then((r) => r.json())
      .then(setData);
  }, [projectId, instructionId]);

  const cfg = data ? (STATUS_CONFIG[data.status] ?? STATUS_CONFIG.created) : null;

  return (
    <div
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 220, background: "#00000088", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
      onClick={onClose}
    >
      <div
        style={{ width: 520, height: "100vh", background: "#0f172a", borderLeft: "1px solid #334155", overflow: "auto", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{instructionId.slice(0, 8)}…</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {!data ? (
          <div style={{ color: "#475569", fontSize: 13 }}>Cargando...</div>
        ) : (
          <>
            {/* Status badge */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{cfg?.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: cfg?.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {data.status.replace("_", " ")}
              </span>
              {data.substatus && (
                <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 4 }}>⏳ {data.substatus}</span>
              )}
            </div>

            {/* Agents */}
            <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "#94a3b8", background: "#1e293b", padding: "4px 10px", borderRadius: 6 }}>
                {agentMap[data.senderAgentId] ?? data.senderAgentId.slice(0, 8)}
              </span>
              <span style={{ color: "#475569" }}>→</span>
              <span style={{ color: "#94a3b8", background: "#1e293b", padding: "4px 10px", borderRadius: 6 }}>
                {agentMap[data.receiverAgentId] ?? data.receiverAgentId.slice(0, 8)}
              </span>
            </div>

            {data.threadId && (
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
                Thread: <span style={{ fontFamily: "monospace", color: "#64748b" }}>{data.threadId.slice(0, 8)}</span>
              </div>
            )}

            {/* Body */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Instrucción</div>
              <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: 14, fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>
                {data.body}
              </div>
            </div>

            {/* Events */}
            {data.events.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Historial de eventos ({data.events.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {data.events.map((e) => (
                    <div key={e.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: "#1e293b", borderRadius: 6, fontSize: 12 }}>
                      <span style={{ color: "#475569", fontFamily: "monospace", minWidth: 30 }}>#{e.sequenceNumber}</span>
                      <span style={{ color: "#6366f1", fontWeight: 600 }}>{e.type}</span>
                      <span style={{ color: "#475569", marginLeft: "auto" }}>
                        {agentMap[e.agentId] ?? e.agentId.slice(0, 8)}
                      </span>
                      <span style={{ color: "#334155" }}>
                        {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relations */}
            {data.relations.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Relaciones</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {data.relations.map((r) => (
                    <div key={r.id} style={{ padding: "8px 12px", background: "#1e293b", borderRadius: 6, fontSize: 12, color: "#94a3b8" }}>
                      <span style={{ color: "#7c3aed" }}>{r.relationType}</span>
                      {" → "}
                      <span style={{ fontFamily: "monospace" }}>
                        {(r.fromInstructionId === instructionId ? r.toInstructionId : r.fromInstructionId).slice(0, 8)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, fontSize: 11, color: "#334155" }}>
              Creada: {new Date(data.createdAt).toLocaleString()}
              <br />
              Actualizada: {new Date(data.updatedAt).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

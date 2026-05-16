import { useState } from "react";
import type { Instruction, Agent } from "@eam/shared";
import { InstructionDetail } from "./InstructionDetail.js";

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

const STATUS_ORDER: string[] = ["created", "received", "accepted", "in_progress", "responded", "completed", "rejected", "error", "cancelled"];

interface Props {
  projectId: string;
  instructions: Instruction[];
  agents: Agent[];
}

export function ExecutionView({ projectId, instructions, agents }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));

  const grouped = STATUS_ORDER.reduce<Record<string, Instruction[]>>((acc, s) => {
    acc[s] = instructions.filter((i) => i.status === s);
    return acc;
  }, {});

  const activeStatuses = STATUS_ORDER.filter((s) => grouped[s].length > 0);

  if (!instructions.length) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 14 }}>No hay instrucciones todavía.</div>
        <div style={{ fontSize: 12, marginTop: 6, color: "#334155" }}>Los agentes crean instrucciones vía la CLI con: eam instruction create</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: "max-content" }}>
        {activeStatuses.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const items = grouped[status];
          return (
            <div key={status} style={{ width: 280, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span>{cfg.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{status.replace("_", " ")}</span>
                <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto", background: "#1e293b", padding: "1px 7px", borderRadius: 99 }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((inst) => {
                  const sender = agentMap[inst.senderAgentId];
                  const receiver = agentMap[inst.receiverAgentId];
                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedId(inst.id)}
                      style={{
                        background: "#1e293b",
                        border: `1px solid ${cfg.color}33`,
                        borderLeft: `3px solid ${cfg.color}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = cfg.color)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${cfg.color}33`)}
                    >
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                        <span>{inst.id.slice(0, 8)}</span>
                        {inst.substatus && <span style={{ color: "#f59e0b", fontSize: 10 }}>⏳ {inst.substatus}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 8, lineHeight: 1.4 }}>
                        {inst.body.slice(0, 80)}{inst.body.length > 80 ? "..." : ""}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569" }}>
                        <span>{sender?.name ?? "?"} → {receiver?.name ?? "?"}</span>
                        <span>{new Date(inst.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedId && (
        <InstructionDetail
          projectId={projectId}
          instructionId={selectedId}
          agents={agents}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow,
  Handle, Position, EdgeLabelRenderer,
  type Node, type Edge, type NodeProps, type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { GraphProjection, AgentEvent } from "@eam/shared";
import { useElkLayout } from "../hooks/useElkLayout";

const STATUS_COLORS: Record<string, string> = {
  idle: "#6b7280", working: "#3b82f6", blocked: "#ef4444",
  completed: "#22c55e", archived: "#a1a1aa",
};

const EVENT_LABELS: Record<string, string> = {
  TASK_ASSIGNED: "Tarea asignada", TASK_STARTED: "Empezó tarea", TASK_COMPLETED: "Completó tarea",
  DELEGATED: "Delegó", AGENT_SPAWNED: "Spawneó agente", AGENT_ARCHIVED: "Archivado",
  SUMMARY_CREATED: "Creó resumen", BLOCKED: "Bloqueado", UNBLOCKED: "Desbloqueado",
  ERROR: "Error", THREAD_CREATED: "Thread creado", RUNTIME_ARCHIVED: "Archivado",
};

function AgentNode({ data }: NodeProps) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const d = data as {
    name: string; role: string; status: string; category: string; department?: string;
    systemPrompt?: string; assigned: number; completed: number; errors: number;
    lastAction?: { type: string; time: string; payload?: Record<string, unknown> };
    onViewDetail: () => void;
  };

  const statusColor = STATUS_COLORS[d.status] ?? "#6b7280";

  const handleMouseEnter = () => {
    if (!nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();
    const tooltipW = 240;
    const tooltipH = 180;
    const margin = 8;

    // horizontal: centrado, pero clampado a los bordes
    let x = rect.left + rect.width / 2;
    x = Math.max(tooltipW / 2 + margin, Math.min(x, window.innerWidth - tooltipW / 2 - margin));

    // vertical: preferir arriba, si no cabe ir abajo
    const fitsAbove = rect.top - tooltipH - margin > 0;
    const y = fitsAbove ? rect.top - margin : rect.bottom + margin;

    setTooltipPos({ x, y, above: fitsAbove });
  };

  const tooltip = tooltipPos && createPortal(
    <div style={{
      position: "fixed",
      left: tooltipPos.x,
      top: tooltipPos.y,
      transform: tooltipPos.above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
      zIndex: 99999,
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "12px 14px",
      width: 240,
      pointerEvents: "none",
      boxShadow: "0 8px 32px #000a",
      color: "#f1f5f9",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.name}</div>
      {d.department && <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>📂 {d.department}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <TooltipStat label="Asignadas" value={d.assigned} color="#3b82f6" />
        <TooltipStat label="Completadas" value={d.completed} color="#22c55e" />
        <TooltipStat label="Errores" value={d.errors} color={d.errors > 0 ? "#ef4444" : "#6b7280"} />
      </div>
      {d.lastAction?.payload && (() => {
        const p = d.lastAction!.payload as Record<string, string>;
        const text = p.task ?? p.result ?? p.reason;
        return text ? (
          <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", borderTop: "1px solid #1e293b", paddingTop: 8 }}>
            "{text}"
          </div>
        ) : null;
      })()}
      {d.systemPrompt && (
        <div style={{ fontSize: 10, color: "#334155", borderTop: "1px solid #1e293b", paddingTop: 8, marginTop: 4, lineHeight: 1.5 }}>
          {d.systemPrompt.slice(0, 100)}{d.systemPrompt.length > 100 ? "…" : ""}
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <div
      ref={nodeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setTooltipPos(null)}
      style={{ position: "relative", width: 210 }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#475569", border: "none" }} />

      <div style={{
        background: "#1e293b",
        border: `1.5px solid ${statusColor}`,
        borderRadius: 10,
        padding: "12px 14px",
        color: "#f1f5f9",
        cursor: "default",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 5 }}>
              {d.name}
              {d.category === "temporary" && <span style={{ fontSize: 11, color: "#a78bfa", flexShrink: 0 }}>⚡</span>}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.role}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); d.onViewDetail(); }}
            title="Ver detalle"
            style={{
              background: "none", border: "1px solid #334155", borderRadius: 6,
              color: "#94a3b8", cursor: "pointer", fontSize: 11, padding: "2px 6px",
              marginLeft: 6, flexShrink: 0, lineHeight: 1,
            }}
          >↗</button>
        </div>

        {/* Status badge */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            display: "inline-block", padding: "1px 8px", borderRadius: 99,
            fontSize: 10, background: statusColor + "33", color: statusColor,
            border: `1px solid ${statusColor}66`, fontWeight: 600,
          }}>
            {d.status}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 6, fontSize: 11 }}>
          <StatPill label="✓" value={d.completed} color="#22c55e" />
          <StatPill label="→" value={d.assigned} color="#3b82f6" />
          {d.errors > 0 && <StatPill label="⚠" value={d.errors} color="#ef4444" />}
        </div>

        {/* Última acción */}
        {d.lastAction && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#475569", borderTop: "1px solid #1e293b", paddingTop: 7 }}>
            <span style={{ color: "#334155" }}>↳ </span>
            {EVENT_LABELS[d.lastAction.type] ?? d.lastAction.type}
            <span style={{ color: "#334155", marginLeft: 4 }}>{d.lastAction.time}</span>
          </div>
        )}
      </div>

      {tooltip}

      <Handle type="source" position={Position.Bottom} style={{ background: "#475569", border: "none" }} />
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: color + "18", border: `1px solid ${color}33`,
      borderRadius: 6, padding: "2px 7px", color, fontSize: 11, fontWeight: 600,
    }}>
      {label} {value}
    </div>
  );
}

function TooltipStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center", background: "#1e293b", borderRadius: 6, padding: "6px 4px" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: "#475569" }}>{label}</div>
    </div>
  );
}

const EVENT_COLORS: Record<string, string> = {
  TASK_ASSIGNED: "#3b82f6", TASK_STARTED: "#f59e0b", TASK_COMPLETED: "#22c55e",
  DELEGATED: "#8b5cf6", AGENT_SPAWNED: "#06b6d4", AGENT_ARCHIVED: "#6b7280",
  SUMMARY_CREATED: "#10b981", BLOCKED: "#ef4444", UNBLOCKED: "#22c55e",
  ERROR: "#dc2626",
};

type CardData = { type: string; time: string; payload?: Record<string, string> };

function EventCard({ type, time, payload }: CardData) {
  const color = EVENT_COLORS[type] ?? "#475569";
  const text = payload?.task ?? payload?.result ?? payload?.reason ?? payload?.decision;
  return (
    <div style={{
      background: "#1e293b", border: `1px solid ${color}55`, borderRadius: 8,
      padding: "6px 10px", minWidth: 130, maxWidth: 190,
      boxShadow: "0 4px 12px #0006", userSelect: "none",
      fontFamily: "Inter, system-ui, sans-serif", fontSize: 11, color: "#f1f5f9",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: text ? 4 : 0 }}>
        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, color, fontSize: 10 }}>{EVENT_LABELS[type] ?? type}</span>
        <span style={{ color: "#475569", fontSize: 10, marginLeft: "auto" }}>{time}</span>
      </div>
      {text && (
        <div style={{
          fontSize: 10, color: "#64748b", fontStyle: "italic",
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          "{text}"
        </div>
      )}
    </div>
  );
}

function EventEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const { setEdges } = useReactFlow();
  const d = data as {
    request?: CardData; response?: CardData;
    offset1X?: number; offset1Y?: number;
    offset2X?: number; offset2Y?: number;
  };

  const o1X = d?.offset1X ?? 0, o1Y = d?.offset1Y ?? 0;
  const o2X = d?.offset2X ?? 0, o2Y = d?.offset2Y ?? 0;

  const c1X = sourceX + (targetX - sourceX) * 0.33 + o1X;
  const c1Y = sourceY + (targetY - sourceY) * 0.33 + o1Y;
  const c2X = sourceX + (targetX - sourceX) * 0.67 + o2X;
  const c2Y = sourceY + (targetY - sourceY) * 0.67 + o2Y;

  const makeDragger = useCallback((key: "1" | "2") => (e: React.MouseEvent) => {
    e.stopPropagation();
    const ox = key === "1" ? o1X : o2X;
    const oy = key === "1" ? o1Y : o2Y;
    const startX = e.clientX - ox;
    const startY = e.clientY - oy;
    const onMove = (mv: MouseEvent) => {
      setEdges((eds) => eds.map((ed) => ed.id !== id ? ed : {
        ...ed, data: { ...ed.data, [`offset${key}X`]: mv.clientX - startX, [`offset${key}Y`]: mv.clientY - startY },
      }));
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [id, o1X, o1Y, o2X, o2Y, setEdges]);

  const hasReq = !!d?.request;
  const hasRes = !!d?.response;
  const pathStyle = { stroke: "#475569", strokeDasharray: "5 4", fill: "none" };

  const points = [
    { x: sourceX, y: sourceY },
    ...(hasReq ? [{ x: c1X, y: c1Y }] : []),
    ...(hasRes ? [{ x: c2X, y: c2Y }] : []),
    { x: targetX, y: targetY },
  ];

  return (
    <>
      {points.slice(0, -1).map((from, i) => (
        <path key={i} d={`M ${from.x} ${from.y} L ${points[i + 1].x} ${points[i + 1].y}`} style={pathStyle} />
      ))}
      <EdgeLabelRenderer>
        {hasReq && (
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${c1X}px, ${c1Y}px)`, pointerEvents: "all", cursor: "grab" }}
            onMouseDown={makeDragger("1")}>
            <EventCard {...d!.request!} />
          </div>
        )}
        {hasRes && (
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${c2X}px, ${c2Y}px)`, pointerEvents: "all", cursor: "grab" }}
            onMouseDown={makeDragger("2")}>
            <EventCard {...d!.response!} />
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { agentNode: AgentNode };
const edgeTypes = { eventEdge: EventEdge };

function computeStats(agentId: string, events: AgentEvent[]) {
  const assigned = events.filter((e) => e.type === "TASK_ASSIGNED" && e.targetAgentId === agentId).length;
  const completed = events.filter((e) => e.type === "TASK_COMPLETED" && e.agentId === agentId).length;
  const errors = events.filter((e) => e.type === "ERROR" && (e.agentId === agentId || e.targetAgentId === agentId)).length;
  const agentEvents = events
    .filter((e) => e.agentId === agentId || e.targetAgentId === agentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const last = agentEvents[0];
  return {
    assigned, completed, errors,
    lastAction: last ? {
      type: last.type,
      time: new Date(last.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      payload: last.payload,
    } : undefined,
  };
}

function toFlowNodes(projection: GraphProjection, events: AgentEvent[], onViewDetail: (agentId: string) => void): Node[] {
  return projection.nodes.map((n) => {
    const d = n.data as Record<string, string>;
    const stats = computeStats(n.id, events);
    return {
      id: n.id,
      type: "agentNode",
      position: { x: 0, y: 0 },
      data: {
        name: n.label,
        role: d.role,
        status: d.status,
        category: d.category,
        department: d.department,
        systemPrompt: d.systemPrompt,
        ...stats,
        onViewDetail: () => onViewDetail(n.id),
      },
    };
  });
}

const REQUEST_TYPES = ["TASK_ASSIGNED", "DELEGATED", "AGENT_SPAWNED"];
const RESPONSE_TYPES = ["TASK_STARTED", "TASK_COMPLETED", "ERROR", "BLOCKED", "UNBLOCKED"];

function computeEdgeCards(source: string, target: string, events: AgentEvent[]): { request?: CardData; response?: CardData } {
  const toCard = (e: AgentEvent): CardData => ({
    type: e.type,
    time: new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    payload: e.payload as Record<string, string>,
  });

  const request = events
    .filter((e) => e.agentId === source && e.targetAgentId === target && REQUEST_TYPES.includes(e.type))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const response = request
    ? events
        .filter((e) =>
          e.agentId === target &&
          RESPONSE_TYPES.includes(e.type) &&
          new Date(e.createdAt) >= new Date(request.createdAt)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : undefined;

  return {
    request: request ? toCard(request) : undefined,
    response: response ? toCard(response) : undefined,
  };
}

function toFlowEdges(projection: GraphProjection, events: AgentEvent[]): Edge[] {
  return projection.edges.map((e) => ({
    id: e.id, source: e.source, target: e.target,
    type: "eventEdge",
    data: computeEdgeCards(e.source, e.target, events),
  }));
}

interface Props {
  projectId: string;
  projection: GraphProjection;
  events: AgentEvent[];
  onViewAgent: (agentId: string) => void;
}

function posKey(projectId: string) {
  return `eam:org-positions:${projectId}`;
}

function loadPositions(projectId: string): Map<string, { x: number; y: number }> {
  try {
    const raw = localStorage.getItem(posKey(projectId));
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return new Map();
  }
}

function savePositions(projectId: string, nodes: Node[]) {
  const obj = Object.fromEntries(nodes.map((n) => [n.id, n.position]));
  localStorage.setItem(posKey(projectId), JSON.stringify(obj));
}

export function OrgGraph({ projectId, projection, events, onViewAgent }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { applyLayout } = useElkLayout();

  const handleNodesChange = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    onNodesChange(changes);
    const hasDrag = changes.some((c) => c.type === "position" && !c.dragging);
    if (hasDrag) {
      setNodes((current) => { savePositions(projectId, current); return current; });
    }
  }, [onNodesChange, setNodes, projectId]);

  useEffect(() => {
    const rawNodes = toFlowNodes(projection, events, onViewAgent);
    const rawEdges = toFlowEdges(projection, events);

    setNodes((current) => {
      const posMap = current.length > 0
        ? new Map(current.map((n) => [n.id, n.position]))
        : loadPositions(projectId);

      const hasNew = rawNodes.some((n) => !posMap.has(n.id));

      if (!hasNew && current.length > 0) {
        return rawNodes.map((n) => ({ ...n, position: posMap.get(n.id) ?? n.position }));
      }

      const needLayout = rawNodes.filter((n) => !posMap.has(n.id));
      const hasSaved = rawNodes.filter((n) => posMap.has(n.id));

      if (needLayout.length === 0) {
        // Todos tienen posición guardada — aplicar directamente sin ELK
        const restored = rawNodes.map((n) => ({ ...n, position: posMap.get(n.id)! }));
        setNodes(restored);
        setEdges(rawEdges);
        return restored;
      }

      // Solo layoutear los que no tienen posición
      applyLayout(needLayout, rawEdges).then((laidOut) => {
        const posLaidOut = new Map(laidOut.map((n) => [n.id, n.position]));
        const merged = rawNodes.map((n) => ({
          ...n,
          position: posMap.get(n.id) ?? posLaidOut.get(n.id) ?? n.position,
        }));
        setNodes(merged);
        setEdges(rawEdges);
        savePositions(projectId, merged);
      });
      return current;
    });

    setEdges(rawEdges);
  }, [projection, onViewAgent, applyLayout, setNodes, setEdges, projectId]);

  useEffect(() => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: { ...node.data, ...computeStats(node.id, events) },
    })));
    setEdges((eds) => eds.map((ed) => ({
      ...ed,
      data: { ...computeEdgeCards(ed.source, ed.target, events), offset1X: (ed.data as Record<string, number>)?.offset1X, offset1Y: (ed.data as Record<string, number>)?.offset1Y, offset2X: (ed.data as Record<string, number>)?.offset2X, offset2Y: (ed.data as Record<string, number>)?.offset2Y },
    })));
  }, [events, setNodes, setEdges]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0f172a" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
      >
        <Background color="#1e293b" />
        <Controls />
        <MiniMap nodeColor="#1e293b" maskColor="#0f172a88" />
      </ReactFlow>
    </div>
  );
}

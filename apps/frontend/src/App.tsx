import { useEffect, useState } from "react";
import { useStore } from "./store/useStore";
import { OrgGraph } from "./components/OrgGraph";
import { CreateAgentModal } from "./components/CreateAgentModal";
import { CreateThreadModal } from "./components/CreateThreadModal";
import { ThreadTimeline } from "./components/ThreadTimeline";
import { ProjectSelector } from "./components/ProjectSelector";
import { AgentDetail } from "./components/AgentDetail";
import { ExecutionView } from "./components/ExecutionView";
import { TimelineView } from "./components/TimelineView";
import type { Thread, Agent } from "@eam/shared";

type View = "org" | "execution" | "timeline" | "agents" | "threads";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "org", label: "🏢 Org View" },
  { id: "execution", label: "⚡ Execution" },
  { id: "timeline", label: "📡 Timeline" },
  { id: "agents", label: "🤖 Agents" },
  { id: "threads", label: "🧵 Threads" },
];

const THREAD_STATUS_BADGE: Record<string, string> = {
  open: "#6366f1", in_progress: "#f59e0b", blocked: "#ef4444",
  completed: "#22c55e", archived: "#6b7280",
};

export default function App() {
  const {
    projects, activeProject,
    agents, threads, events, instructions, orgGraph, connected,
    fetchProjects, setActiveProject, createProject,
    fetchAgents, fetchThreads, fetchOrgGraph, connectWS,
  } = useStore();

  const [view, setView] = useState<View>("org");
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchProjects();
    connectWS();
  }, []);

  if (!activeProject) {
    return (
      <ProjectSelector
        projects={projects}
        onSelect={setActiveProject}
        onCreate={createProject}
      />
    );
  }

  const activeInstructions = instructions.filter(
    (i) => !["completed", "cancelled", "rejected"].includes(i.status)
  ).length;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "Inter, system-ui, sans-serif" }}>
      <aside style={{ width: 220, background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Proyecto</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{activeProject.name}</div>
          {activeProject.description && (
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{activeProject.description}</div>
          )}
          <button
            onClick={() => setActiveProject(null as never)}
            style={{ marginTop: 8, fontSize: 11, color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            ← Cambiar proyecto
          </button>
        </div>

        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => setView(id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer", marginBottom: 2,
              background: view === id ? "#334155" : "transparent",
              color: view === id ? "#f1f5f9" : "#94a3b8",
              fontSize: 13, fontWeight: view === id ? 600 : 400,
            }}>
              {label}
              {id === "execution" && activeInstructions > 0 && (
                <span style={{ float: "right", fontSize: 10, background: "#6366f133", color: "#6366f1", padding: "1px 6px", borderRadius: 99 }}>
                  {activeInstructions}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #334155", fontSize: 11 }}>
          <span style={{ color: connected ? "#22c55e" : "#ef4444" }}>● </span>
          <span style={{ color: "#475569" }}>{connected ? "Live" : "Disconnected"}</span>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "14px 24px", borderBottom: "1px solid #334155", background: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            {NAV_ITEMS.find((n) => n.id === view)?.label.split(" ").slice(1).join(" ")}
          </h1>
          <div>
            {view === "agents" && (
              <button onClick={() => setShowCreateAgent(true)} style={actionBtn}>+ Nuevo Agente</button>
            )}
            {view === "threads" && (
              <button onClick={() => setShowCreateThread(true)} disabled={agents.length === 0} style={actionBtn}>
                + Nuevo Thread
              </button>
            )}
          </div>
        </header>

        <div style={{ flex: 1, overflow: "auto" }}>
          {view === "org" && orgGraph && orgGraph.nodes.length > 0 && (
            <div style={{ height: "100%" }}>
              <OrgGraph
                projectId={activeProject.id}
                projection={orgGraph}
                events={events}
                onViewAgent={(agentId) => {
                  const agent = agents.find((a) => a.id === agentId);
                  if (agent) setSelectedAgent(agent);
                }}
              />
            </div>
          )}
          {view === "org" && (!orgGraph || orgGraph.nodes.length === 0) && (
            <EmptyState
              message="No hay agentes en este proyecto."
              action={{ label: "Crear agente", onClick: () => { setView("agents"); setShowCreateAgent(true); } }}
            />
          )}

          {view === "execution" && (
            <ExecutionView projectId={activeProject.id} instructions={instructions} agents={agents} />
          )}

          {view === "timeline" && (
            <TimelineView events={events} agents={agents} />
          )}

          {view === "agents" && (
            <div style={{ padding: 24 }}>
              {agents.length === 0 && <EmptyState message="No hay agentes todavía." />}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
                {agents.map((a) => {
                  const sent = instructions.filter((i) => i.senderAgentId === a.id).length;
                  const received = instructions.filter((i) => i.receiverAgentId === a.id).length;
                  const pending = instructions.filter((i) => i.receiverAgentId === a.id && !["completed", "cancelled", "rejected"].includes(i.status)).length;
                  const STATUS_COLORS: Record<string, string> = {
                    idle: "#6b7280", working: "#3b82f6", blocked: "#ef4444",
                    completed: "#22c55e", archived: "#a1a1aa",
                  };
                  const sc = STATUS_COLORS[a.status] ?? "#6b7280";
                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAgent(a)}
                      style={{ background: "#1e293b", border: `1px solid ${sc}55`, borderRadius: 10, padding: 16, cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = sc)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${sc}55`)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{a.role}</div>
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sc + "22", color: sc, border: `1px solid ${sc}44`, fontWeight: 600 }}>{a.status}</span>
                      </div>
                      {a.department && <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>📂 {a.department}</div>}
                      <div style={{ display: "flex", gap: 6, fontSize: 11, flexWrap: "wrap" }}>
                        <MiniStat label="enviadas" value={sent} color="#6366f1" />
                        <MiniStat label="recibidas" value={received} color="#3b82f6" />
                        {pending > 0 && <MiniStat label="pendientes" value={pending} color="#f59e0b" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "threads" && (
            <div style={{ padding: 24 }}>
              {threads.length === 0 && <EmptyState message="No hay threads todavía." />}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {threads.map((t) => {
                  const threadInst = instructions.filter((i) => i.threadId === t.id);
                  const owner = agents.find((a) => a.id === t.ownerAgentId);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedThread(t)}
                      style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "14px 18px", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#475569")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
                          {t.description && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>{t.description}</div>}
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: THREAD_STATUS_BADGE[t.status] ?? "#334155", color: "#fff", flexShrink: 0, marginLeft: 12 }}>
                          {t.status}
                        </span>
                      </div>
                      <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "#475569" }}>
                        {owner && <span>👤 {owner.name}</span>}
                        {threadInst.length > 0 && <span>⚡ {threadInst.length} instrucciones</span>}
                        <span style={{ marginLeft: "auto" }}>Ver timeline →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateAgent && (
        <CreateAgentModal
          projectId={activeProject.id}
          agents={agents}
          onClose={() => setShowCreateAgent(false)}
          onCreated={() => { fetchAgents(); fetchOrgGraph(); }}
        />
      )}
      {showCreateThread && (
        <CreateThreadModal
          projectId={activeProject.id}
          agents={agents}
          threads={threads}
          onClose={() => setShowCreateThread(false)}
          onCreated={fetchThreads}
        />
      )}
      {selectedThread && (
        <ThreadTimeline
          projectId={activeProject.id}
          thread={selectedThread}
          agents={agents}
          onClose={() => setSelectedThread(null)}
        />
      )}
      {selectedAgent && (
        <AgentDetail
          agent={selectedAgent}
          agents={agents}
          events={events}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>{message}</div>
      {action && (
        <button onClick={action.onClick} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: color + "18", border: `1px solid ${color}33`, borderRadius: 6, padding: "2px 8px", color, fontSize: 11, fontWeight: 600 }}>
      {value} {label}
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  padding: "7px 14px", borderRadius: 6, border: "none",
  background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
};

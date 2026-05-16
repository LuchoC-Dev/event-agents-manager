import { create } from "zustand";
import type { Agent, Thread, AgentEvent, GraphProjection, Project, Instruction } from "@eam/shared";

const BASE = "http://localhost:3001/api";
const WS_URL = "ws://localhost:3001/ws";

let wsInstance: WebSocket | null = null;
let retryTimer: number | null = null;

interface AppState {
  projects: Project[];
  agents: Agent[];
  threads: Thread[];
  events: AgentEvent[];
  instructions: Instruction[];
  orgGraph: GraphProjection | null;
  connected: boolean;

  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  loadProject: (projectId: string) => Promise<void>;

  fetchAgents: (projectId: string) => Promise<void>;
  fetchThreads: (projectId: string) => Promise<void>;
  fetchOrgGraph: (projectId: string) => Promise<void>;
  fetchEvents: (projectId: string) => Promise<void>;
  fetchInstructions: (projectId: string) => Promise<void>;
  connectWS: (projectId: string) => void;
  disconnectWS: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  agents: [],
  threads: [],
  events: [],
  instructions: [],
  orgGraph: null,
  connected: false,

  fetchProjects: async () => {
    const res = await fetch(`${BASE}/projects`);
    set({ projects: await res.json() });
  },

  createProject: async (name, description) => {
    const res = await fetch(`${BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const project = await res.json();
    set((s) => ({ projects: [...s.projects, project] }));
    return project;
  },

  loadProject: async (projectId) => {
    set({ agents: [], threads: [], events: [], instructions: [], orgGraph: null });
    const { fetchAgents, fetchThreads, fetchOrgGraph, fetchEvents, fetchInstructions } = get();
    await Promise.all([
      fetchAgents(projectId),
      fetchThreads(projectId),
      fetchOrgGraph(projectId),
      fetchEvents(projectId),
      fetchInstructions(projectId),
    ]);
  },

  fetchAgents: async (projectId) => {
    const res = await fetch(`${BASE}/projects/${projectId}/agents`);
    set({ agents: await res.json() });
  },

  fetchThreads: async (projectId) => {
    const res = await fetch(`${BASE}/projects/${projectId}/threads`);
    set({ threads: await res.json() });
  },

  fetchOrgGraph: async (projectId) => {
    const res = await fetch(`${BASE}/projects/${projectId}/graph/org`);
    set({ orgGraph: await res.json() });
  },

  fetchEvents: async (projectId) => {
    const res = await fetch(`${BASE}/projects/${projectId}/events`);
    const data = await res.json();
    set({ events: Array.isArray(data) ? data.sort((a: AgentEvent, b: AgentEvent) => a.sequenceNumber - b.sequenceNumber) : [] });
  },

  fetchInstructions: async (projectId) => {
    const res = await fetch(`${BASE}/projects/${projectId}/instructions`);
    set({ instructions: await res.json() });
  },

  connectWS: (projectId) => {
    if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) return;
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }

    let retryDelay = 1000;
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsInstance = ws;
      ws.onopen = () => { set({ connected: true }); retryDelay = 1000; };
      ws.onclose = () => {
        set({ connected: false });
        retryTimer = window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      };
      ws.onerror = () => { ws.close(); };
      ws.onmessage = (msg) => {
        try {
          const { event } = JSON.parse(msg.data) as { event: string };
          const store = get();
          if (event === "agent:created" || event === "agent:updated") {
            store.fetchAgents(projectId);
            store.fetchOrgGraph(projectId);
          }
          if (event === "thread:created" || event === "thread:updated") {
            store.fetchThreads(projectId);
          }
          if (event === "event:created") {
            store.fetchEvents(projectId);
          }
          if (event === "instruction:created" || event === "instruction:updated") {
            store.fetchInstructions(projectId);
          }
          if (event === "project:created" || event === "project:updated") {
            store.fetchProjects();
          }
        } catch {
          // ignore malformed messages
        }
      };
    };
    connect();
  },

  disconnectWS: () => {
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    if (wsInstance) { wsInstance.onclose = null; wsInstance.close(); wsInstance = null; }
    set({ connected: false });
  },
}));

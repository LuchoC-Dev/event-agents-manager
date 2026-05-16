import { create } from "zustand";
import type { Agent, Thread, AgentEvent, GraphProjection, Project, Instruction } from "@eam/shared";

const BASE = "http://localhost:3001/api";
const WS_URL = "ws://localhost:3001/ws";

let wsInstance: WebSocket | null = null;
let retryTimer: number | null = null;

interface AppState {
  projects: Project[];
  activeProject: Project | null;

  agents: Agent[];
  threads: Thread[];
  events: AgentEvent[];
  instructions: Instruction[];
  orgGraph: GraphProjection | null;

  connected: boolean;

  fetchProjects: () => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  createProject: (name: string, description?: string) => Promise<Project>;

  fetchAgents: () => Promise<void>;
  fetchThreads: () => Promise<void>;
  fetchOrgGraph: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchInstructions: () => Promise<void>;
  connectWS: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  activeProject: null,
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

  setActiveProject: (project: Project | null) => {
    set({ activeProject: project, agents: [], threads: [], events: [], instructions: [], orgGraph: null });
    if (project) {
      get().fetchAgents();
      get().fetchThreads();
      get().fetchOrgGraph();
      get().fetchEvents();
      get().fetchInstructions();
    }
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

  fetchAgents: async () => {
    const { activeProject } = get();
    if (!activeProject) return;
    const res = await fetch(`${BASE}/projects/${activeProject.id}/agents`);
    set({ agents: await res.json() });
  },

  fetchThreads: async () => {
    const { activeProject } = get();
    if (!activeProject) return;
    const res = await fetch(`${BASE}/projects/${activeProject.id}/threads`);
    set({ threads: await res.json() });
  },

  fetchOrgGraph: async () => {
    const { activeProject } = get();
    if (!activeProject) return;
    const res = await fetch(`${BASE}/projects/${activeProject.id}/graph/org`);
    set({ orgGraph: await res.json() });
  },

  fetchEvents: async () => {
    const { activeProject } = get();
    if (!activeProject) return;
    const res = await fetch(`${BASE}/projects/${activeProject.id}/events`);
    const data = await res.json();
    set({ events: Array.isArray(data) ? data.sort((a: AgentEvent, b: AgentEvent) => a.sequenceNumber - b.sequenceNumber) : [] });
  },

  fetchInstructions: async () => {
    const { activeProject } = get();
    if (!activeProject) return;
    const res = await fetch(`${BASE}/projects/${activeProject.id}/instructions`);
    set({ instructions: await res.json() });
  },

  connectWS: () => {
    if (wsInstance) {
      if (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING) return;
    }
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
          if (!store.activeProject) return;
          if (event === "agent:created" || event === "agent:updated") {
            store.fetchAgents();
            store.fetchOrgGraph();
          }
          if (event === "thread:created" || event === "thread:updated") {
            store.fetchThreads();
          }
          if (event === "event:created") {
            store.fetchEvents();
            store.fetchOrgGraph();
          }
          if (event === "instruction:created" || event === "instruction:updated") {
            store.fetchInstructions();
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
}));

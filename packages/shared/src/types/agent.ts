export type AgentCategory = "permanent" | "temporary";

export type AgentStatus = "idle" | "working" | "blocked" | "completed" | "archived";

export interface Agent {
  id: string;
  name: string;
  role: string;
  category: AgentCategory;
  status: AgentStatus;
  department?: string;
  parentId?: string;
  templateId?: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  department?: string;
  systemPrompt: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

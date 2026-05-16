export type ThreadStatus = "open" | "in_progress" | "blocked" | "completed" | "archived";

export interface Thread {
  id: string;
  title: string;
  description?: string;
  status: ThreadStatus;
  ownerAgentId: string;
  parentThreadId?: string;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  // Thread
  | "THREAD_CREATED"
  // Instruction lifecycle
  | "INSTRUCTION_CREATED"
  | "INSTRUCTION_RECEIVED"
  | "INSTRUCTION_ACCEPTED"
  | "INSTRUCTION_REJECTED"
  | "INSTRUCTION_RESPONDED"
  | "INSTRUCTION_COMPLETED"
  | "INSTRUCTION_CANCELLED"
  | "INSTRUCTION_INVALIDATED"
  // Reviews & retries
  | "REVIEW_REQUESTED"
  | "REVIEW_APPROVED"
  | "REVIEW_REJECTED"
  | "RETRY_REQUESTED"
  // Agents
  | "AGENT_REGISTERED"
  | "AGENT_STATUS_CHANGED"
  // Legacy (backwards compat)
  | "TASK_ASSIGNED"
  | "TASK_STARTED"
  | "TASK_COMPLETED"
  | "DELEGATED"
  | "AGENT_SPAWNED"
  | "AGENT_ARCHIVED"
  | "SUMMARY_CREATED"
  | "BLOCKED"
  | "UNBLOCKED"
  | "ERROR"
  | "RUNTIME_ARCHIVED";

export interface AgentEvent {
  id: string;
  projectId: string;
  sequenceNumber: number;
  type: EventType;
  threadId: string | null;
  instructionId: string | null;
  agentId: string;
  targetAgentId?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

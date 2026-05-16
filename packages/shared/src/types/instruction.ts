export type InstructionStatus =
  | "created"
  | "received"
  | "accepted"
  | "in_progress"
  | "responded"
  | "completed"
  | "rejected"
  | "error"
  | "cancelled";

export type InstructionSubstatus =
  | "waiting_review"
  | "waiting_external"
  | "retry_requested"
  | null;

export type InstructionRelationType =
  | "clarification_of"
  | "retry_of"
  | "review_of"
  | "child_of"
  | "related_to";

export interface Instruction {
  id: string;
  projectId: string;
  threadId: string | null;
  senderAgentId: string;
  receiverAgentId: string;
  parentInstructionId: string | null;
  body: string;
  status: InstructionStatus;
  substatus: InstructionSubstatus;
  createdAt: string;
  updatedAt: string;
}

export interface InstructionRelation {
  id: string;
  fromInstructionId: string;
  toInstructionId: string;
  relationType: InstructionRelationType;
  createdAt: string;
}

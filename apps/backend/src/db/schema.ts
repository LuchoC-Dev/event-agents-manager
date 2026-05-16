import { pgTable, text, timestamp, jsonb, pgEnum, serial } from "drizzle-orm/pg-core";

export const agentCategoryEnum = pgEnum("agent_category", ["permanent", "temporary"]);
export const agentStatusEnum = pgEnum("agent_status", ["idle", "working", "blocked", "completed", "archived"]);
export const threadStatusEnum = pgEnum("thread_status", ["open", "in_progress", "blocked", "completed", "archived"]);
export const instructionStatusEnum = pgEnum("instruction_status", [
  "created", "received", "accepted", "in_progress",
  "responded", "completed", "rejected", "error", "cancelled",
]);
export const instructionSubstatusEnum = pgEnum("instruction_substatus", [
  "waiting_review", "waiting_external", "retry_requested",
]);
export const instructionRelationTypeEnum = pgEnum("instruction_relation_type", [
  "clarification_of", "retry_of", "review_of", "child_of", "related_to",
]);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  role: text("role").notNull(),
  category: agentCategoryEnum("category").notNull().default("permanent"),
  status: agentStatusEnum("status").notNull().default("idle"),
  department: text("department"),
  parentId: text("parent_id"),
  templateId: text("template_id"),
  systemPrompt: text("system_prompt").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agentTemplates = pgTable("agent_templates", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department"),
  systemPrompt: text("system_prompt").notNull().default(""),
  skills: jsonb("skills").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const threads = pgTable("threads", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: threadStatusEnum("status").notNull().default("open"),
  ownerAgentId: text("owner_agent_id").notNull(),
  parentThreadId: text("parent_thread_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const instructions = pgTable("instructions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  threadId: text("thread_id").references(() => threads.id),
  senderAgentId: text("sender_agent_id").notNull().references(() => agents.id),
  receiverAgentId: text("receiver_agent_id").notNull().references(() => agents.id),
  parentInstructionId: text("parent_instruction_id"),
  body: text("body").notNull(),
  status: instructionStatusEnum("status").notNull().default("created"),
  substatus: instructionSubstatusEnum("substatus"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const instructionRelations = pgTable("instruction_relations", {
  id: text("id").primaryKey(),
  fromInstructionId: text("from_instruction_id").notNull().references(() => instructions.id),
  toInstructionId: text("to_instruction_id").notNull().references(() => instructions.id),
  relationType: instructionRelationTypeEnum("relation_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  sequenceNumber: serial("sequence_number"),
  projectId: text("project_id").notNull().references(() => projects.id),
  type: text("type").notNull(),
  threadId: text("thread_id"),
  instructionId: text("instruction_id"),
  agentId: text("agent_id").notNull(),
  targetAgentId: text("target_agent_id"),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

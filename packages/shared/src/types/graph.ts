export type EdgeType =
  | "manager_of"
  | "delegated_to"
  | "spawned"
  | "depends_on"
  | "reports_to"
  | "event_interaction"
  | "instruction_flow";

export interface GraphNode {
  id: string;
  type: "agent" | "thread";
  label: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
}

export interface GraphProjection {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

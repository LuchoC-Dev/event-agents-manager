import ELK from "elkjs/lib/elk.bundled.js";
import { useState, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";

const elk = new ELK();

const ELK_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode": "40",
};

export function useElkLayout() {
  const [loading, setLoading] = useState(false);

  const applyLayout = useCallback(async (nodes: Node[], edges: Edge[]): Promise<Node[]> => {
    if (nodes.length === 0) return nodes;
    setLoading(true);

    const graph = {
      id: "root",
      layoutOptions: ELK_OPTIONS,
      children: nodes.map((n) => ({
        id: n.id,
        width: 180,
        height: 90,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
      })),
    };

    try {
      const laid = await elk.layout(graph);
      return nodes.map((n) => {
        const elkNode = laid.children?.find((c) => c.id === n.id);
        if (!elkNode?.x || !elkNode?.y) return n;
        return { ...n, position: { x: elkNode.x, y: elkNode.y } };
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { applyLayout, loading };
}

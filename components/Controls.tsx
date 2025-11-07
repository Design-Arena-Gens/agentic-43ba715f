"use client";

import { useState } from "react";
import type { TraversalType } from "@/lib/avl";

interface Props {
  onInsert: (v: number) => void;
  onDelete: (v: number) => void;
  onSearch: (v: number) => void;
  traversalState: { running: boolean; speedMs: number; type: TraversalType | null };
  setTraversalState: (s: (prev: { running: boolean; speedMs: number; type: TraversalType | null }) => { running: boolean; speedMs: number; type: TraversalType | null }) => void;
  onRunTraversal: (type: TraversalType) => void;
}

export function Controls({ onInsert, onDelete, onSearch, traversalState, setTraversalState, onRunTraversal }: Props) {
  const [value, setValue] = useState<number>(0);
  const [travType, setTravType] = useState<TraversalType>("inorder");

  return (
    <div className="controls">
      <div className="controls-row">
        <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} placeholder="Value" />
        <button className="button brand" onClick={() => onInsert(value)}>Insert</button>
        <button className="button warn" onClick={() => onDelete(value)}>Delete</button>
        <button className="button" onClick={() => onSearch(value)}>Search</button>
      </div>

      <div className="controls-row">
        <select className="button" value={travType} onChange={(e) => setTravType(e.target.value as TraversalType)}>
          <option value="inorder">Inorder</option>
          <option value="preorder">Preorder</option>
          <option value="postorder">Postorder</option>
          <option value="levelorder">Level-order</option>
        </select>
        <button
          className="button accent"
          onClick={() => {
            setTraversalState((s) => ({ ...s, running: true }));
            onRunTraversal(travType);
          }}
          disabled={traversalState.running}
        >Play</button>
        <button
          className="button danger"
          onClick={() => setTraversalState((s) => ({ ...s, running: false }))}
          disabled={!traversalState.running}
        >Pause</button>
        <label style={{ color: "var(--muted)", marginLeft: 8 }}>Speed</label>
        <input className="slider" type="range" min={150} max={1200} step={50} value={traversalState.speedMs} onChange={(e) => setTraversalState((s) => ({ ...s, speedMs: Number(e.target.value) }))} />
        <span style={{ color: "var(--muted)" }}>{traversalState.speedMs} ms</span>
      </div>
    </div>
  );
}

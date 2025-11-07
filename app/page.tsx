"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { AVLTree, type OperationLogEntry, TraversalType } from "@/lib/avl";
import { TreeCanvas } from "@/components/TreeCanvas";
import { Controls } from "@/components/Controls";
import { LogsPanel } from "@/components/LogsPanel";

export default function HomePage() {
  const treeRef = useRef(new AVLTree<number>());
  const [logs, setLogs] = useState<OperationLogEntry[]>([]);
  const [version, setVersion] = useState(0);
  const [traversalState, setTraversalState] = useState<{ running: boolean; speedMs: number; type: TraversalType | null }>({ running: false, speedMs: 600, type: null });
  const [highlightPath, setHighlightPath] = useState<number[]>([]);

  const tree = treeRef.current;

  const rebuild = () => setVersion((v) => v + 1);

  const appendLogs = (entries: OperationLogEntry[]) => {
    setLogs((prev) => [...prev, ...entries.map((e) => ({ ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }))]);
  };

  const handleInsert = (value: number) => {
    const result = tree.insert(value);
    appendLogs(result.logs);
    setHighlightPath(result.path);
    rebuild();
  };

  const handleDelete = (value: number) => {
    const result = tree.remove(value);
    appendLogs(result.logs);
    setHighlightPath(result.path);
    rebuild();
  };

  const handleSearch = (value: number) => {
    const result = tree.search(value);
    appendLogs(result.logs);
    setHighlightPath(result.path);
    rebuild();
  };

  const handleTraversal = async (type: TraversalType) => {
    setTraversalState((s) => ({ ...s, type }));
    setHighlightPath([]);
    for await (const step of tree.traverse(type)) {
      setHighlightPath([step.value]);
      if (!traversalState.running) break;
      await new Promise((r) => setTimeout(r, traversalState.speedMs));
    }
    setTraversalState((s) => ({ ...s, running: false }));
  };

  useEffect(() => {
    // Seed initial values for a better first view
    if (version === 0 && tree.size() === 0) {
      [30, 20, 40, 10, 25, 35, 50, 5, 15, 27].forEach((v) => tree.insert(v));
      rebuild();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid-root">
      <section className="panel panel-visualizer">
        <Controls
          onInsert={handleInsert}
          onDelete={handleDelete}
          onSearch={handleSearch}
          traversalState={traversalState}
          setTraversalState={setTraversalState}
          onRunTraversal={handleTraversal}
        />
        <TreeCanvas key={version} tree={tree} highlights={highlightPath} />
      </section>

      <aside className="panel panel-logs">
        <LogsPanel logs={logs} onClear={() => setLogs([])} />
      </aside>
    </div>
  );
}

"use client";

import type { OperationLogEntry } from "@/lib/avl";

interface Props {
  logs: OperationLogEntry[];
  onClear: () => void;
}

export function LogsPanel({ logs, onClear }: Props) {
  return (
    <div>
      <div className="logs-header">
        <div style={{ fontWeight: 600 }}>Algorithm Logs</div>
        <div>
          <button className="button" onClick={onClear}>Clear</button>
        </div>
      </div>
      <div className="logs-list">
        {logs.length === 0 ? (
          <div className="log-item" style={{ color: "var(--muted)" }}>No logs yet. Perform insert, delete, search, or run traversal.</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="log-item">
              <span className="tag">{l.op.toUpperCase()}</span>
              <span>{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

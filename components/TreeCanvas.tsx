"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AVLTree } from "@/lib/avl";

interface Props {
  tree: AVLTree<number>;
  highlights: number[];
}

type Point = { x: number; y: number };

export function TreeCanvas({ tree, highlights }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [last, setLast] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  const layout = useMemo(() => tree.toLayout(), [tree]);
  const maxDepth = useMemo(() => layout.reduce((m, n) => Math.max(m, n.y), 0), [layout]);

  const nodeRadius = 16;
  const baseXGap = 80;
  const baseYGap = 90;

  const screenPoint = (xIndex: number, depth: number) => {
    const x = xIndex * baseXGap;
    const y = depth * baseYGap;
    return { x, y };
  };

  const worldToView = (p: Point): Point => ({ x: p.x * scale + offset.x, y: p.y * scale + offset.y });
  const viewToWorld = (p: Point): Point => ({ x: (p.x - offset.x) / scale, y: (p.y - offset.y) / scale });

  useEffect(() => {
    const container = rootRef.current!;
    // Center view on first render
    if (container && layout.length) {
      const minX = Math.min(...layout.map(n => screenPoint(n.x, n.y).x));
      const maxX = Math.max(...layout.map(n => screenPoint(n.x, n.y).x));
      const centerX = (minX + maxX) / 2;
      setOffset({ x: container.clientWidth / 2 - centerX * scale, y: 40 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const mouseView = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const mouseWorldBefore = viewToWorld(mouseView);
    const delta = -e.deltaY;
    const factor = Math.exp(delta * 0.0015);
    const newScale = clamp(scale * factor, 0.3, 3);
    setScale(newScale);
    const mouseWorldAfter = mouseWorldBefore; // same world target
    const newOffset = {
      x: mouseView.x - mouseWorldAfter.x * newScale,
      y: mouseView.y - mouseWorldAfter.y * newScale,
    };
    setOffset(newOffset);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsPanning(true);
    setLast({ x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning || !last) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    setLast({ x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    setLast(null);
  };

  const zoomIn = () => setScale((s) => Math.min(3, s * 1.2));
  const zoomOut = () => setScale((s) => Math.max(0.3, s / 1.2));
  const resetView = () => {
    setScale(1);
    const container = rootRef.current!;
    const minX = Math.min(...layout.map(n => screenPoint(n.x, n.y).x));
    const maxX = Math.max(...layout.map(n => screenPoint(n.x, n.y).x));
    const centerX = (minX + maxX) / 2;
    setOffset({ x: container.clientWidth / 2 - centerX, y: 40 });
  };

  const width = Math.max(800, layout.length * 50);
  const height = Math.max(400, (maxDepth + 2) * baseYGap);

  return (
    <div className="tree-container" ref={rootRef}>
      <div className={`controls-row`} style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
        <button className="button" onClick={zoomOut}>- Zoom</button>
        <button className="button" onClick={zoomIn}>+ Zoom</button>
        <button className="button" onClick={resetView}>Reset View</button>
        <span style={{ color: "var(--muted)", marginLeft: 8 }}>Scale: {scale.toFixed(2)}x</span>
      </div>
      <svg
        ref={svgRef}
        className={`tree-viewport ${isPanning ? "dragging" : ""}`}
        width="100%"
        height={Math.min(700, height + 120)}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
          {layout.map((n) => {
            const pos = screenPoint(n.x, n.y);
            const left = layout.find(x => x.id === n.left);
            const right = layout.find(x => x.id === n.right);
            return (
              <g key={n.id}>
                {left && (
                  <line x1={pos.x} y1={pos.y} x2={screenPoint(left.x, left.y).x} y2={screenPoint(left.x, left.y).y} stroke="#263748" strokeWidth={2} />
                )}
                {right && (
                  <line x1={pos.x} y1={pos.y} x2={screenPoint(right.x, right.y).x} y2={screenPoint(right.x, right.y).y} stroke="#263748" strokeWidth={2} />
                )}
              </g>
            );
          })}

          {layout.map((n) => {
            const pos = screenPoint(n.x, n.y);
            const highlighted = highlights.includes(n.value as number);
            return (
              <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r={nodeRadius} fill={highlighted ? "#123f24" : "#102033"} stroke={highlighted ? "#7ee787" : "#58a6ff"} strokeWidth={2} />
                <text y={4} textAnchor="middle" fontSize={12} fill="#e6edf3">{String(n.value)}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="legend">
        <div><span className="dot" style={{ background: "#7ee787" }} /> Highlight</div>
        <div><span className="dot" style={{ background: "#58a6ff" }} /> Node</div>
        <div><span className="dot" style={{ background: "#263748" }} /> Edge</div>
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

"use client";
import { useRef, useState } from "react";

type P = { title: string; author: string; coverUrl: string | null; blurb: string | null; pages: number; color: string; edge: string | null };
const EDGES: Record<string, string> = {
  gold: "linear-gradient(90deg,#c9a227,#f4e08a,#b8901c)", red: "linear-gradient(90deg,#8a1c1c,#d24545,#7a1414)",
  blue: "linear-gradient(90deg,#1c3d8a,#4a79d2,#14307a)", green: "linear-gradient(90deg,#1c6b3a,#4ab36f,#14502a)",
  purple: "linear-gradient(90deg,#4b1c8a,#9a5ad2,#3a147a)", pink: "linear-gradient(90deg,#c2417a,#f58cb8,#a8336a)",
};
export const EDGE_IDS = Object.keys(EDGES);

/** Drag to spin, tap to flip. Pure CSS 3D (no WebGL). */
export function Book3D({ title, author, coverUrl, blurb, pages, color, edge }: P) {
  const [rot, setRot] = useState({ x: -8, y: -28 });
  const drag = useRef<{ x: number; y: number; r: typeof rot } | null>(null);
  const depth = Math.min(64, Math.max(22, pages / 9));
  const W = 200, H = 300;
  const paper = "repeating-linear-gradient(90deg,#f3ead7 0 2px,#e4d8be 2px 3px)";
  const edgeBg = edge && EDGES[edge] ? EDGES[edge] : paper;
  const face = "absolute [backface-visibility:hidden]";
  return (
    <div className="flex flex-col items-center gap-2 py-12 select-none" style={{ perspective: 1100 }}>
      <div
        className="relative cursor-grab touch-none active:cursor-grabbing"
        style={{ width: W, height: H, transformStyle: "preserve-3d", transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, transition: drag.current ? "none" : "transform .5s cubic-bezier(.2,.8,.2,1)" }}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, r: rot }; }}
        onPointerMove={(e) => { const d = drag.current; if (d) setRot({ x: Math.max(-60, Math.min(60, d.r.x - (e.clientY - d.y) * 0.5)), y: d.r.y + (e.clientX - d.x) * 0.6 }); }}
        onPointerUp={() => { drag.current = null; setRot((r) => ({ ...r })); }}
      >
        {/* front */}
        <div className={face} style={{ width: W, height: H, transform: `translateZ(${depth / 2}px)`, background: color, borderRadius: "2px 6px 6px 2px", boxShadow: "inset 6px 0 8px rgba(0,0,0,.25)", overflow: "hidden" }}>
          {coverUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={coverUrl} alt={title} className="h-full w-full object-cover" draggable={false} />
            : <div className="flex h-full flex-col justify-between p-4 text-white"><div className="font-serif text-2xl leading-tight">{title}</div><div className="text-sm opacity-80">{author}</div></div>}
        </div>
        {/* back */}
        <div className={face} style={{ width: W, height: H, transform: `rotateY(180deg) translateZ(${depth / 2}px)`, background: color, borderRadius: "6px 2px 2px 6px", overflow: "hidden" }}>
          <div className="h-full overflow-hidden bg-black/55 p-3 text-[9px] leading-snug text-white">{blurb ?? "No blurb available."}<div className="absolute bottom-3 left-3 h-8 w-20 bg-white" /></div>
        </div>
        {/* spine (left) */}
        <div className={face} style={{ width: depth, height: H, left: 0, transform: `rotateY(-90deg) translateZ(${depth / 2}px)`, transformOrigin: "center", marginLeft: -depth / 2 + 0, background: color }}>
          <div className="flex h-full items-center justify-center overflow-hidden px-1 text-[11px] font-semibold text-white [writing-mode:vertical-rl]">{title} · {author}</div>
        </div>
        {/* page edge (right), top, bottom */}
        <div className={face} style={{ width: depth, height: H, right: 0, transform: `rotateY(90deg) translateZ(${depth / 2}px)`, marginRight: -depth / 2 + 0, background: edgeBg }} />
        <div className={face} style={{ width: W, height: depth, top: 0, transform: `rotateX(90deg) translateZ(${depth / 2}px)`, marginTop: -depth / 2, background: edgeBg }} />
        <div className={face} style={{ width: W, height: depth, bottom: 0, transform: `rotateX(-90deg) translateZ(${depth / 2}px)`, marginBottom: -depth / 2, background: edgeBg }} />
      </div>
      <div className="mt-4 flex gap-2 text-xs">
        {[["Front", { x: -8, y: -28 }], ["Back", { x: -8, y: 152 }], ["Spine", { x: 0, y: 90 }], ["Edge", { x: 0, y: -90 }]].map(([l, r]) => (
          <button key={String(l)} onClick={() => setRot(r as typeof rot)} className="rounded-full bg-white/70 px-3 py-1">{String(l)}</button>))}
      </div>
    </div>
  );
}

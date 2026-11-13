import React, { useEffect, useRef, useState } from "react";
import { formatCompactCurrency, formatCurrency } from "../utils/format";

const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };

/** Tracks the container width so the SVG is drawn at real pixel size (text never scales). */
const useWidth = (fallback = 640) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
};

const niceTicks = (min: number, max: number, count = 4) => {
  if (min === max) return [min];
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
};

interface Point {
  label: string;
  value: number;
}

/** Area chart of a running value (e.g. balance over time). Pure SVG, no chart dependency. */
export const AreaChart: React.FC<{ points: Point[]; color?: string }> = ({ points, color = "#8b7cf6" }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [ref, W] = useWidth();
  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - ((v - min) / (max - min || 1)) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${y(min).toFixed(1)} L${x(0).toFixed(1)},${y(min).toFixed(1)} Z`;
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(3, Math.floor(W / 110))));
  const active = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: "block" }}
        role="img"
        aria-label="Evolução do saldo"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {niceTicks(min, max).map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="chart-axis">
              {formatCompactCurrency(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) =>
          (i % labelEvery === 0 && points.length - 1 - i >= labelEvery / 2) || i === points.length - 1 ? (
            <text
              key={`l${i}`}
              x={x(i)}
              y={H - 8}
              textAnchor={i === points.length - 1 ? "end" : i === 0 ? "start" : "middle"}
              className="chart-axis"
            >
              {p.label}
            </text>
          ) : null,
        )}
        {active && hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
            <circle cx={x(hover)} cy={y(active.value)} r={5} fill={color} stroke="#12141c" strokeWidth={2} />
          </>
        )}
        {points.map((_, i) => (
          <rect
            key={`h${i}`}
            x={x(i) - innerW / points.length / 2}
            y={PAD.top}
            width={innerW / points.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "var(--surface-3)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 13,
            pointerEvents: "none",
          }}
        >
          <span className="text-muted">{active.label}: </span>
          <strong>{formatCurrency(active.value)}</strong>
        </div>
      )}
    </div>
  );
};

interface BarDatum {
  label: string;
  income: number;
  expense: number;
}

/** Grouped income/expense bars per bucket (day, week...). */
export const BarsChart: React.FC<{ data: BarDatum[] }> = ({ data }) => {
  const [ref, W] = useWidth();
  if (data.length === 0) return <div ref={ref} />;
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(3, Math.min(18, slot / 2 - 3));
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(3, Math.floor(W / 90))));

  return (
    <div ref={ref}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: "block" }}
        role="img"
        aria-label="Receitas e despesas por dia"
      >
        {niceTicks(0, max).map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="chart-axis">
              {formatCompactCurrency(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          return (
            <g key={d.label + i}>
              {d.income > 0 && (
                <rect
                  x={cx - barW - 1}
                  y={y(d.income)}
                  width={barW}
                  height={y(0) - y(d.income)}
                  rx={3}
                  fill="var(--income)"
                >
                  <title>{`${d.label}: receitas ${formatCurrency(d.income)}`}</title>
                </rect>
              )}
              {d.expense > 0 && (
                <rect
                  x={cx + 1}
                  y={y(d.expense)}
                  width={barW}
                  height={y(0) - y(d.expense)}
                  rx={3}
                  fill="var(--expense)"
                >
                  <title>{`${d.label}: despesas ${formatCurrency(d.expense)}`}</title>
                </rect>
              )}
              {(i % labelEvery === 0 || i === data.length - 1) &&
                !(i !== data.length - 1 && data.length - 1 - i < labelEvery / 2) && (
                  <text x={cx} y={H - 8} textAnchor="middle" className="chart-axis">
                    {d.label}
                  </text>
                )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import {
  MdPerson,
  MdShoppingBag,
  MdCurrencyRupee,
  MdTrendingUp,
  MdWarningAmber,
  MdErrorOutline,
  MdInventory2,
  MdCategory,
  MdCollectionsBookmark,
  MdLocalOffer,
  MdMail,
  MdQuestionAnswer,
  MdVideoLibrary,
  MdRefresh,
  MdArrowForward,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { getAnalyticsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { imgSrc } from "../Collections/CollectionForm";
import Load from "../Load/Load";

/* ================= TOKENS ================= */
// Categorical slots 1-5 in fixed order (validated light-mode palette), status colours, chart ink
const C = {
  s1: "#2a78d6",
  s2: "#eb6834",
  s3: "#1baf7a",
  s4: "#eda100",
  s5: "#e87ba4",
  ink: "#0b0b0b",
  ink2: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  surface: "#ffffff",
  good: "#006300",
  critical: "#d03b3b",
  warning: "#fab219",
};

const STATUS_COLORS = {
  PLACED: C.s1,
  CONFIRMED: C.s2,
  SHIPPED: C.s3,
  DELIVERED: C.s4,
  CANCELLED: C.s5,
};

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "12 months" },
  { value: "all", label: "All time" },
];

/* ================= FORMATTERS ================= */
const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const inrShort = (n) => (Math.abs(n) >= 10000 ? `₹${compact.format(n)}` : inr(n));
const count = (n) => (n || 0).toLocaleString("en-IN");
const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

const bucketLabel = (key, bucket, long) => {
  if (bucket === "day") {
    return new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      ...(long ? { weekday: "short" } : {}),
    });
  }
  return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: long ? "long" : "short",
    year: long ? "numeric" : "2-digit",
  });
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// Four clean steps (1 / 2 / 2.5 / 5 × 10^k) that cover max
const niceTicks = (max, { integer, floor }) => {
  const target = Math.max(max, floor);
  const raw = target / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  let step = [1, 2, 2.5, 5, 10].find((s) => s * mag >= raw) * mag;
  if (integer) step = Math.max(1, Math.ceil(step));
  return [0, 1, 2, 3, 4].map((i) => i * step);
};

/* ================= HOOKS ================= */
const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
};

/* ================= SMALL PIECES ================= */
const Card = ({ title, subtitle, action, children, className = "" }) => (
  <section
    className={`bg-white rounded-2xl p-5 ${className}`}
    style={{ border: "1px solid rgba(11,11,11,0.10)", boxShadow: "0 1px 2px rgba(11,11,11,0.04)" }}
  >
    {(title || action) && (
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          {title && <h3 className="text-base font-semibold" style={{ color: C.ink }}>{title}</h3>}
          {subtitle && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

const ViewAll = ({ to, label = "View all" }) => (
  <Link
    to={to}
    className="text-xs font-semibold flex items-center gap-1 whitespace-nowrap hover:underline"
    style={{ color: C.ink2 }}
  >
    {label} <MdArrowForward />
  </Link>
);

// Signed change vs the previous period of the same length; up is good for every KPI here
const Delta = ({ value, range }) => {
  if (range === "all") return <span style={{ color: C.muted }}>All-time total</span>;
  if (value === null || value === undefined) {
    return <span style={{ color: C.muted }}>No data for the previous period</span>;
  }
  const up = value > 0;
  const flat = value === 0;
  const color = flat ? C.ink2 : up ? C.good : C.critical;
  const Icon = up ? MdArrowUpward : MdArrowDownward;
  return (
    <span className="flex items-center gap-1">
      <span className="flex items-center font-semibold" style={{ color }}>
        {!flat && <Icon aria-hidden />}
        {flat ? "0%" : `${up ? "+" : ""}${value}%`}
      </span>
      <span style={{ color: C.muted }}>vs previous {range === 365 ? "12 months" : `${range} days`}</span>
    </span>
  );
};

const Sparkline = ({ values }) => {
  if (!values?.length || values.every((v) => !v)) return <div className="h-8" />;
  const max = Math.max(...values) || 1;
  const n = values.length;
  const pts = values.map((v, i) => [n === 1 ? 50 : (i / (n - 1)) * 100, 30 - (v / max) * 26]);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-8" aria-hidden>
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={C.axis}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={C.s1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const StatTile = ({ icon, label, value, delta, range, spark }) => (
  <Card className="flex flex-col">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium" style={{ color: C.ink2 }}>{label}</p>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-[#1d2532] text-white">
        {icon}
      </span>
    </div>
    <p className="text-3xl font-semibold mt-2" style={{ color: C.ink }}>{value}</p>
    <div className="text-xs mt-1">
      <Delta value={delta} range={range} />
    </div>
    <div className="mt-3">
      <Sparkline values={spark} />
    </div>
  </Card>
);

/* ================= TREND CHART ================= */
const TrendChart = ({ data, bucket, metric }) => {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const series =
    metric === "revenue"
      ? [{ key: "revenue", label: "Revenue", color: C.s1, money: true }]
      : [
          { key: "orders", label: "Paid orders", color: C.s1 },
          { key: "placed", label: "All checkouts", color: C.s2 },
        ];

  const H = 280;
  const m = { t: 16, r: 16, b: 30, l: metric === "revenue" ? 64 : 40 };
  const iw = Math.max(0, width - m.l - m.r);
  const ih = H - m.t - m.b;
  const n = data.length;

  const max = Math.max(0, ...data.flatMap((d) => series.map((s) => d[s.key])));
  const ticks = niceTicks(max, metric === "revenue" ? { floor: 1000 } : { integer: true, floor: 4 });
  const top = ticks[ticks.length - 1];
  const tickLabel = (v) => (metric === "revenue" ? (top >= 10000 ? `₹${compact.format(v)}` : inr(v)) : count(v));

  const x = (i) => m.l + (n <= 1 ? iw / 2 : (i * iw) / (n - 1));
  const y = (v) => m.t + ih - (v / top) * ih;
  const line = (key) => data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[key])}`).join("");

  const labelCount = Math.min(n, Math.max(2, Math.floor(iw / 90)));
  const labelIdx = [
    ...new Set(Array.from({ length: labelCount }, (_, k) => Math.round((k * (n - 1)) / Math.max(1, labelCount - 1)))),
  ];
  const empty = data.every((d) => series.every((s) => !d[s.key]));

  const onMove = (e) => {
    if (!n || !iw) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left - m.l) / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const tipLeft = hover !== null ? Math.min(Math.max(x(hover) + 12, 8), width - 188) : 0;

  return (
    <div>
      {series.length > 1 && (
        <div className="flex gap-4 mb-2 text-xs" style={{ color: C.ink2 }}>
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 rounded" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div ref={ref} className="relative w-full" style={{ height: H }}>
        {width > 0 && (
          <svg
            width={width}
            height={H}
            role="img"
            aria-label={`${series.map((s) => s.label).join(" and ")} over time`}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            style={{ touchAction: "pan-y" }}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? C.axis : C.grid} strokeWidth="1" />
                <text
                  x={m.l - 8}
                  y={y(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="11"
                  fill={C.muted}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {tickLabel(t)}
                </text>
              </g>
            ))}
            {labelIdx.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={H - 8}
                // Edge labels hug the plot so they never get clipped
                textAnchor={n > 1 && i === 0 ? "start" : n > 1 && i === n - 1 ? "end" : "middle"}
                fontSize="11"
                fill={C.muted}
              >
                {bucketLabel(data[i].key, bucket)}
              </text>
            ))}

            {metric === "revenue" && n > 0 && (
              <path d={`${line("revenue")}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={C.s1} opacity="0.1" />
            )}
            {series.map((s) => (
              <path
                key={s.key}
                d={line(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {hover !== null && (
              <>
                <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke={C.axis} strokeWidth="1" />
                {series.map((s) => (
                  <circle
                    key={s.key}
                    cx={x(hover)}
                    cy={y(data[hover][s.key])}
                    r="4.5"
                    fill={s.color}
                    stroke={C.surface}
                    strokeWidth="2"
                  />
                ))}
              </>
            )}
            <rect x={m.l} y={m.t} width={iw} height={ih} fill="transparent" />
          </svg>
        )}

        {empty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm bg-white px-3 py-1 rounded" style={{ color: C.muted }}>
              {metric === "revenue" ? "No paid orders in this period" : "No checkouts in this period"}
            </p>
          </div>
        )}

        {hover !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-white rounded-lg px-3 py-2 text-xs w-44"
            style={{ left: tipLeft, border: "1px solid rgba(11,11,11,0.10)", boxShadow: "0 4px 12px rgba(11,11,11,0.08)" }}
          >
            <p className="mb-1" style={{ color: C.muted }}>{bucketLabel(data[hover].key, bucket, true)}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-2">
                <span className="inline-block w-3 h-0.5 rounded" style={{ background: s.color }} />
                <span className="font-semibold" style={{ color: C.ink }}>
                  {s.money ? inr(data[hover][s.key]) : count(data[hover][s.key])}
                </span>
                <span style={{ color: C.ink2 }}>{s.label}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= PART-OF-WHOLE BAR ================= */
// One whole split into parts, 2px surface gap between segments; legend rows carry every value
const SegmentBar = ({ parts, format = count }) => {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const [hover, setHover] = useState(null);
  return (
    <div>
      <div className="flex w-full h-4 gap-[2px]">
        {total ? (
          parts
            .filter((p) => p.value > 0)
            .map((p, i, arr) => (
              <div
                key={p.label}
                title={`${p.label}: ${format(p.value)}`}
                onPointerEnter={() => setHover(p.label)}
                onPointerLeave={() => setHover(null)}
                className="h-full transition-opacity"
                style={{
                  width: `${(p.value / total) * 100}%`,
                  minWidth: 6,
                  background: p.color,
                  opacity: hover && hover !== p.label ? 0.45 : 1,
                  borderRadius: `${i === 0 ? 4 : 0}px ${i === arr.length - 1 ? 4 : 0}px ${i === arr.length - 1 ? 4 : 0}px ${i === 0 ? 4 : 0}px`,
                }}
              />
            ))
        ) : (
          <div className="w-full h-full rounded" style={{ background: "#f0efec" }} />
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {parts.map((p) => (
          <li
            key={p.label}
            className="flex items-center gap-2 text-sm rounded px-1 -mx-1"
            style={{ background: hover === p.label ? "#f5f5f3" : "transparent" }}
            onPointerEnter={() => setHover(p.label)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
            <span className="flex-1" style={{ color: C.ink2 }}>{p.label}</span>
            <span className="font-semibold" style={{ color: C.ink, fontVariantNumeric: "tabular-nums" }}>
              {format(p.value)}
            </span>
            <span className="w-10 text-right text-xs" style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>
              {total ? `${Math.round((p.value / total) * 100)}%` : "–"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ================= RANKED BARS ================= */
const RankedBars = ({ rows, emptyText, withImage }) => {
  const max = Math.max(1, ...rows.map((r) => r.revenue));
  if (!rows.length) {
    return <p className="text-sm py-8 text-center" style={{ color: C.muted }}>{emptyText}</p>;
  }
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r._id || r.name} className="flex items-center gap-3" title={`${r.name}: ${inr(r.revenue)}, ${r.quantity} sold`}>
          {withImage &&
            (r.image ? (
              <img
                src={imgSrc(r.image, 80)}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
            ))}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate" style={{ color: C.ink }}>{r.name}</span>
              <span className="font-semibold whitespace-nowrap" style={{ color: C.ink, fontVariantNumeric: "tabular-nums" }}>
                {inr(r.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-2 rounded" style={{ background: "#f0efec" }}>
                <div
                  className="h-2"
                  style={{ width: `${(r.revenue / max) * 100}%`, background: C.s1, borderRadius: "0 4px 4px 0" }}
                />
              </div>
              <span className="text-xs w-14 text-right" style={{ color: C.muted }}>{count(r.quantity)} sold</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

const StatusPill = ({ status }) => (
  <span
    className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
    style={{ background: "#f5f5f3", color: C.ink2 }}
  >
    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] || C.muted }} />
    {titleCase(status)}
  </span>
);

/* ================= PAGE ================= */
const Home = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState("revenue");
  const navigate = useNavigate();

  const fetchAllData = async (r = range) => {
    try {
      setRefreshing(true);
      const response = await getAnalyticsApi(r);
      if (response?.success) setAnalytics(response.data);
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData(range);
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handlePopState = () => navigate("/home");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const d = analytics;
  const k = d?.kpis || {};
  const trend = useMemo(() => d?.trend || [], [d]);
  const spark = (key) => trend.map((t) => t[key]);
  const rangeLabel = RANGES.find((r) => r.value === range)?.label.toLowerCase();

  if (loading && !d) return <Load />;
  if (!d) {
    return (
      <div className="p-4 mt-16">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-2" style={{ color: C.ink2 }}>Couldn't load the dashboard. Please refresh.</p>
      </div>
    );
  }

  const quickLinks = [
    { to: "/users", label: "Customers", value: d.userCount, icon: <MdPerson /> },
    { to: "/products", label: "Products", value: d.inventory.productCount, icon: <MdInventory2 /> },
    { to: "/domains", label: "Categories", value: d.categoryCount, icon: <MdCategory /> },
    { to: "/collections", label: "Collections", value: d.totals.collectionCount, icon: <MdCollectionsBookmark /> },
    { to: "/coupons", label: "Active coupons", value: d.totals.activeCouponCount, icon: <MdLocalOffer /> },
    { to: "/news-letter", label: "Subscribers", value: d.totals.subscriberCount, icon: <MdMail /> },
    { to: "/get-in-touch", label: "Enquiries", value: d.totals.queryCount, icon: <MdQuestionAnswer /> },
    { to: "/reels", label: "Reels", value: d.reelCount, icon: <MdVideoLibrary /> },
  ];

  const alerts = [
    k.unpaidCheckouts > 0 && {
      to: "/orders",
      icon: <MdWarningAmber className="text-xl" style={{ color: "#b07a00" }} />,
      title: `${count(k.unpaidCheckouts)} unpaid checkout${k.unpaidCheckouts === 1 ? "" : "s"}`,
      text: `${inr(k.unpaidValue)} in orders where online payment never completed`,
    },
    d.inventory.outOfStock > 0 && {
      to: "/products",
      icon: <MdErrorOutline className="text-xl" style={{ color: C.critical }} />,
      title: `${count(d.inventory.outOfStock)} product${d.inventory.outOfStock === 1 ? "" : "s"} out of stock`,
      text: `${count(d.inventory.lowStock)} more running low (${d.inventory.lowStockThreshold} or fewer left)`,
    },
    d.totals.pendingCustomOrders > 0 && {
      to: "/custom-orders",
      icon: <MdWarningAmber className="text-xl" style={{ color: "#b07a00" }} />,
      title: `${count(d.totals.pendingCustomOrders)} custom order${d.totals.pendingCustomOrders === 1 ? "" : "s"} pending`,
      text: "Waiting for confirmation",
    },
  ].filter(Boolean);

  return (
    <div className="p-4 mt-16 pb-10 min-h-screen" style={{ background: "#f9f9f7" }}>
      {/* Header + the one filter row that scopes everything below */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gray-300">{greeting()}</p>
            <h2 className="text-3xl font-bold mt-1">Dashboard</h2>
            <p className="text-sm text-gray-300 mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap bg-white/10 rounded-xl p-1" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRange(r.value)}
                  aria-pressed={range === r.value}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    range === r.value ? "bg-white text-[#1d2532] font-semibold" : "text-gray-200 hover:bg-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fetchAllData(range)}
              title="Refresh"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl"
            >
              <MdRefresh className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Refetch keeps the frame: previous numbers stay, dimmed */}
      <div className="transition-opacity" style={{ opacity: refreshing ? 0.55 : 1 }}>
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatTile icon={<MdCurrencyRupee />} label="Revenue" value={inrShort(k.revenue)} delta={k.revenueChange} range={d.range} spark={spark("revenue")} />
          <StatTile icon={<MdShoppingBag />} label="Paid orders" value={count(k.orders)} delta={k.ordersChange} range={d.range} spark={spark("orders")} />
          <StatTile icon={<MdTrendingUp />} label="Average order value" value={inrShort(k.avgOrderValue)} delta={k.avgOrderValueChange} range={d.range} />
          <StatTile icon={<MdPerson />} label="New customers" value={count(k.newUsers)} delta={k.newUsersChange} range={d.range} />
        </div>

        {/* Needs attention */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {alerts.map((a) => (
              <Link
                key={a.title}
                to={a.to}
                className="flex items-start gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition-shadow"
                style={{ border: "1px solid rgba(11,11,11,0.10)" }}
              >
                {a.icon}
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: C.ink }}>{a.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.ink2 }}>{a.text}</p>
                </div>
                <MdArrowForward style={{ color: C.muted }} />
              </Link>
            ))}
          </div>
        )}

        {/* Trend + order mix */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <Card
            className="xl:col-span-2"
            title={metric === "revenue" ? "Revenue" : "Orders"}
            subtitle={
              metric === "revenue"
                ? `Paid orders, ${d.bucket === "day" ? "per day" : "per month"} · ${rangeLabel}`
                : `Paid orders vs all checkouts, ${d.bucket === "day" ? "per day" : "per month"} · ${rangeLabel}`
            }
            action={
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs" role="group" aria-label="Chart metric">
                {[
                  { v: "revenue", l: "Revenue" },
                  { v: "orders", l: "Orders" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setMetric(o.v)}
                    aria-pressed={metric === o.v}
                    className={`px-3 py-1 rounded-md ${metric === o.v ? "bg-white shadow-sm font-semibold" : ""}`}
                    style={{ color: metric === o.v ? C.ink : C.ink2 }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            }
          >
            <TrendChart data={trend} bucket={d.bucket} metric={metric} />
          </Card>

          <div className="flex flex-col gap-4">
            <Card title="Order status" subtitle={`Paid orders · ${rangeLabel}`} action={<ViewAll to="/orders" />}>
              <SegmentBar
                parts={d.ordersByStatus.map((s) => ({
                  label: titleCase(s.status),
                  value: s.count,
                  color: STATUS_COLORS[s.status],
                }))}
              />
            </Card>
            <Card title="Payment method" subtitle={`Revenue by method · ${rangeLabel}`}>
              <SegmentBar
                format={inr}
                parts={d.paymentMethods.map((p, i) => ({
                  label: p.method === "COD" ? "Cash on delivery" : "Online",
                  value: p.amount,
                  color: i === 0 ? C.s1 : C.s2,
                }))}
              />
            </Card>
          </div>
        </div>

        {/* Best sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card title="Top products" subtitle={`By revenue · ${rangeLabel}`} action={<ViewAll to="/products" />}>
            <RankedBars rows={d.topProducts} withImage emptyText="No products sold in this period" />
          </Card>
          <Card title="Top categories" subtitle={`By revenue · ${rangeLabel}`} action={<ViewAll to="/domains" />}>
            <RankedBars rows={d.topCategories} emptyText="No categories sold in this period" />
          </Card>
        </div>

        {/* Recent orders + stock */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6 items-start">
          <Card className="xl:col-span-2" title="Recent paid orders" subtitle="Latest 6, any date" action={<ViewAll to="/orders" />}>
            {d.recentOrders.length ? (
              <div className="overflow-x-auto -mx-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs" style={{ color: C.muted }}>
                      <th className="font-medium py-2 px-3">Order</th>
                      <th className="font-medium py-2 px-3">Customer</th>
                      <th className="font-medium py-2 px-3">Date</th>
                      <th className="font-medium py-2 px-3 text-right">Items</th>
                      <th className="font-medium py-2 px-3 text-right">Amount</th>
                      <th className="font-medium py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentOrders.map((o) => (
                      <tr key={o._id} style={{ borderTop: `1px solid ${C.grid}` }}>
                        <td className="py-2.5 px-3 font-mono text-xs" style={{ color: C.ink2 }}>
                          #{String(o._id).slice(-6).toUpperCase()}
                        </td>
                        <td className="py-2.5 px-3" style={{ color: C.ink }}>{o.customer}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: C.ink2 }}>
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2.5 px-3 text-right" style={{ color: C.ink2, fontVariantNumeric: "tabular-nums" }}>{o.items}</td>
                        <td className="py-2.5 px-3 text-right font-semibold" style={{ color: C.ink, fontVariantNumeric: "tabular-nums" }}>
                          {inr(o.amount)}
                        </td>
                        <td className="py-2.5 px-3"><StatusPill status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: C.muted }}>No paid orders yet</p>
            )}
          </Card>

          <Card
            title="Stock alerts"
            subtitle={`${count(d.inventory.outOfStock)} out of stock · ${count(d.inventory.lowStock)} low`}
            action={<ViewAll to="/products" />}
          >
            {d.inventory.items.length ? (
              <ul className="space-y-3">
                {d.inventory.items.map((p) => {
                  const out = p.quantity <= 0;
                  return (
                    <li key={p._id} className="flex items-center gap-3">
                      {p.imageUrl?.[0] ? (
                        <img
                          src={imgSrc(p.imageUrl[0], 80)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <span className="flex-1 text-sm truncate" style={{ color: C.ink }} title={p.name}>{p.name}</span>
                      <span
                        className="flex items-center gap-1 text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-full"
                        style={{ background: out ? "#fbeaea" : "#fff5dc", color: out ? C.critical : "#7a5600" }}
                      >
                        {out ? <MdErrorOutline aria-hidden /> : <MdWarningAmber aria-hidden />}
                        {out ? "Out of stock" : `${p.quantity} left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: C.muted }}>All products are well stocked</p>
            )}
          </Card>
        </div>

        {/* Store at a glance */}
        <h3 className="text-base font-semibold mb-3" style={{ color: C.ink }}>Store at a glance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          {quickLinks.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow group"
              style={{ border: "1px solid rgba(11,11,11,0.10)" }}
            >
              <span className="text-2xl text-[#1d2532] group-hover:scale-110 inline-block transition-transform">{q.icon}</span>
              <p className="text-2xl font-semibold mt-2" style={{ color: C.ink }}>{count(q.value)}</p>
              <p className="text-xs mt-0.5" style={{ color: C.ink2 }}>{q.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

import { useState } from "react";
import {
  Package,
  Tag,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface RentedItem {
  id: number;
  name: string;
  category: string;
  price: string;
  rentedDate: string;
  dueDate: string;
  status: "active" | "returned" | "overdue";
}

const mockRentedItems: RentedItem[] = [
  { id: 1, name: "Professional Camera", category: "Electronics", price: "$50/day", rentedDate: "Feb 20, 2026", dueDate: "Feb 27, 2026", status: "overdue" },
  { id: 2, name: "Power Drill Set", category: "Tools", price: "$25/day", rentedDate: "Feb 22, 2026", dueDate: "Mar 1, 2026", status: "active" },
  { id: 3, name: "Camping Tent (4-person)", category: "Outdoor", price: "$35/day", rentedDate: "Feb 10, 2026", dueDate: "Feb 15, 2026", status: "returned" },
  { id: 4, name: "Projector & Screen", category: "Electronics", price: "$45/day", rentedDate: "Feb 24, 2026", dueDate: "Mar 3, 2026", status: "active" },
  { id: 5, name: "Party Sound System", category: "Electronics", price: "$75/day", rentedDate: "Feb 5, 2026", dueDate: "Feb 10, 2026", status: "returned" },
];

const STATUS_FILTERS = ["All", "Active", "Returned", "Overdue"] as const;
type FilterType = (typeof STATUS_FILTERS)[number];

const statusConfig = {
  active:   { label: "Active",   Icon: Clock,         accentColor: "#3b82f6", badgeBg: "#eff6ff", badgeColor: "#2563eb", badgeBorder: "#bfdbfe" },
  returned: { label: "Returned", Icon: CheckCircle,   accentColor: "#22c55e", badgeBg: "#f0fdf4", badgeColor: "#16a34a", badgeBorder: "#bbf7d0" },
  overdue:  { label: "Overdue",  Icon: AlertCircle,   accentColor: "#ef4444", badgeBg: "#fef2f2", badgeColor: "#dc2626", badgeBorder: "#fecaca" },
};

export function RentedItems() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [items, setItems] = useState<RentedItem[]>(mockRentedItems);
  const [returningId, setReturningId] = useState<number | null>(null);

  const filtered = items.filter((item) =>
    filter === "All" ? true : item.status === filter.toLowerCase()
  );

  const counts = {
    All:      items.length,
    Active:   items.filter((i) => i.status === "active").length,
    Returned: items.filter((i) => i.status === "returned").length,
    Overdue:  items.filter((i) => i.status === "overdue").length,
  };

  const handleReturn = async (id: number) => {
    setReturningId(id);
    await new Promise((r) => setTimeout(r, 700));
    // TODO: await fetch(`http://localhost:3000/api/rentals/${id}/return`, { method: 'PATCH' });
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "returned" as const } : item));
    setReturningId(null);
  };

  return (
    <div style={{ width: "100%", fontFamily: "inherit" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>My Rented Items</h2>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Track the status of your current and past rentals</p>
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", paddingTop: 4 }}>
          <span>{counts.Active} active</span>
          {counts.Overdue > 0 && <span style={{ color: "#ef4444", fontWeight: 600 }}> · {counts.Overdue} overdue</span>}
          <span> · {counts.Returned} returned</span>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Active Rentals", count: counts.Active,   Icon: Clock,       color: "#2563eb", bg: "#eff6ff" },
          { label: "Overdue",        count: counts.Overdue,  Icon: AlertCircle, color: "#dc2626", bg: "#fef2f2" },
          { label: "Returned",       count: counts.Returned, Icon: CheckCircle, color: "#16a34a", bg: "#f0fdf4" },
        ].map(({ label, count, Icon, color, bg }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, background: bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon style={{ width: 22, height: 22, color }} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: active ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  background: active ? "#2563eb" : "#fff",
                  color: active ? "#fff" : "#374151",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                {f}
                <span style={{
                  padding: "1px 7px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: active ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                  color: active ? "#fff" : "#6b7280",
                }}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Items list ── */}
      {filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "64px 24px", textAlign: "center" }}>
          <Package style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No items found</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No rentals match the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((item) => {
            const cfg = statusConfig[item.status];
            const isReturning = returningId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${cfg.accentColor}`,
                  borderRadius: 12,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}
              >
                {/* Icon */}
                <div style={{
                  width: 52, height: 52,
                  background: cfg.badgeBg,
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Package style={{ width: 24, height: 24, color: cfg.accentColor }} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top row: name + badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </h3>
                    <span style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 20,
                      fontSize: 11, fontWeight: 600, flexShrink: 0,
                      background: cfg.badgeBg, color: cfg.badgeColor,
                      border: `1px solid ${cfg.badgeBorder}`,
                    }}>
                      <cfg.Icon style={{ width: 11, height: 11 }} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Category + price */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
                    <Tag style={{ width: 13, height: 13 }} />
                    <span>{item.category}</span>
                    <span style={{ color: "#d1d5db" }}>·</span>
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>{item.price}</span>
                  </div>

                  {/* Dates */}
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
                      <Calendar style={{ width: 12, height: 12 }} />
                      Rented: <span style={{ color: "#4b5563", fontWeight: 500, marginLeft: 3 }}>{item.rentedDate}</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
                      <Calendar style={{ width: 12, height: 12 }} />
                      Due: <span style={{ color: item.status === "overdue" ? "#ef4444" : "#4b5563", fontWeight: 500, marginLeft: 3 }}>{item.dueDate}</span>
                    </span>
                  </div>
                </div>

                {/* Action */}
                {item.status !== "returned" ? (
                  <button
                    onClick={() => handleReturn(item.id)}
                    disabled={isReturning}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "9px 18px",
                      background: isReturning ? "#93c5fd" : item.status === "overdue" ? "#ef4444" : "#2563eb",
                      color: "#fff", border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: isReturning ? "not-allowed" : "pointer",
                      flexShrink: 0, transition: "background 0.15s",
                      minWidth: 90,
                    }}
                  >
                    {isReturning ? (
                      <>
                        <svg style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Returning...
                      </>
                    ) : (
                      <>
                        <RotateCcw style={{ width: 13, height: 13 }} />
                        Return
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a", fontWeight: 600, flexShrink: 0, minWidth: 90, justifyContent: "center" }}>
                    <CheckCircle style={{ width: 15, height: 15 }} />
                    Returned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
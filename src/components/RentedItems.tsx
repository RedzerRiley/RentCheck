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
  {
    id: 1,
    name: "Professional Camera",
    category: "Electronics",
    price: "$50/day",
    rentedDate: "Feb 20, 2026",
    dueDate: "Feb 27, 2026",
    status: "overdue",
  },
  {
    id: 2,
    name: "Power Drill Set",
    category: "Tools",
    price: "$25/day",
    rentedDate: "Feb 22, 2026",
    dueDate: "Mar 1, 2026",
    status: "active",
  },
  {
    id: 3,
    name: "Camping Tent (4-person)",
    category: "Outdoor",
    price: "$35/day",
    rentedDate: "Feb 10, 2026",
    dueDate: "Feb 15, 2026",
    status: "returned",
  },
  {
    id: 4,
    name: "Projector & Screen",
    category: "Electronics",
    price: "$45/day",
    rentedDate: "Feb 24, 2026",
    dueDate: "Mar 3, 2026",
    status: "active",
  },
  {
    id: 5,
    name: "Party Sound System",
    category: "Electronics",
    price: "$75/day",
    rentedDate: "Feb 5, 2026",
    dueDate: "Feb 10, 2026",
    status: "returned",
  },
];

const STATUS_FILTERS = ["All", "Active", "Returned", "Overdue"] as const;
type FilterType = (typeof STATUS_FILTERS)[number];

const statusConfig = {
  active: {
    label: "Active",
    icon: Clock,
    badgeClass: "bg-blue-50 text-blue-600 border border-blue-200",
    accent: "border-l-blue-500",
  },
  returned: {
    label: "Returned",
    icon: CheckCircle,
    badgeClass: "bg-green-50 text-green-600 border border-green-200",
    accent: "border-l-green-500",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    badgeClass: "bg-red-50 text-red-600 border border-red-200",
    accent: "border-l-red-500",
  },
};

export function RentedItems() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [items, setItems] = useState<RentedItem[]>(mockRentedItems);
  const [returningId, setReturningId] = useState<number | null>(null);

  const filtered = items.filter((item) =>
    filter === "All" ? true : item.status === filter.toLowerCase()
  );

  const counts = {
    All: items.length,
    Active: items.filter((i) => i.status === "active").length,
    Returned: items.filter((i) => i.status === "returned").length,
    Overdue: items.filter((i) => i.status === "overdue").length,
  };

  const handleReturn = async (id: number) => {
    setReturningId(id);
    await new Promise((r) => setTimeout(r, 700));

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "returned" } : item
      )
    );

    setReturningId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            My Rented Items
          </h2>
          <p className="text-gray-600 text-sm">
            Track the status of your current and past rentals
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {counts.Active} active ·{" "}
          {counts.Overdue > 0 && (
            <span className="text-red-500 font-medium">
              {counts.Overdue} overdue ·{" "}
            </span>
          )}
          {counts.Returned} returned
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Active Rentals",
            count: counts.Active,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Overdue",
            count: counts.Overdue,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Returned",
            count: counts.Returned,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>

            <div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.count}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {f}
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                  filter === f
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-700 font-medium">No items found</h3>
          <p className="text-gray-400 text-sm">
            No rentals match the selected filter.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => {
            const cfg = statusConfig[item.status];
            const StatusIcon = cfg.icon;
            const isReturning = returningId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white border border-gray-200 border-l-4 ${cfg.accent}
                rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center
                hover:shadow-sm transition`}
              >
                {/* Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-7 h-7 text-gray-300" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                        <Tag className="w-3.5 h-3.5" />
                        {item.category}
                        <span className="text-gray-300">·</span>
                        <span className="text-blue-600 font-medium">
                          {item.price}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badgeClass}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Rented:
                      <span className="text-gray-600 ml-1">
                        {item.rentedDate}
                      </span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due:
                      <span
                        className={`ml-1 font-medium ${
                          item.status === "overdue"
                            ? "text-red-500"
                            : "text-gray-600"
                        }`}
                      >
                        {item.dueDate}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action */}
                {item.status !== "returned" ? (
                  <button
                    onClick={() => handleReturn(item.id)}
                    disabled={isReturning}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition
                      ${
                        item.status === "overdue"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                      disabled:opacity-60`}
                  >
                    {isReturning ? "Returning..." : "Return"}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Returned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// pages/admin/transactions/index.tsx
import AdminLayout from "@/components/admin/layout/AdminLayout";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TxStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
type TxType = "purchase" | "refund" | "payout" | "adjustment";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Course = {
  _id: string;
  title?: string;
  thumbnailUrl?: string;
};

type Transaction = {
  _id: string;

  userId?: User;
  courseId?: Course;

  type?: TxType;
  status?: TxStatus;

  amount?: number;
  currency?: string;
  fee?: number;
  netAmount?: number;

  provider?: string;
  paymentMethod?: string;
  reference?: string;

  createdAt?: string;
  updatedAt?: string;
};

type ApiResp = {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
};

/* ===========================
   DEMO DATA (API-FRIENDLY)
=========================== */

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    _id: "tx_001",
    userId: {
      _id: "u1",
      firstName: "Belayet",
      lastName: "Riad",
      email: "student@gmail.com",
    },
    courseId: {
      _id: "c1",
      title: "Web Development Course 01",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&q=80",
    },
    type: "purchase",
    status: "paid",
    amount: 200,
    currency: "USD",
    fee: 6,
    netAmount: 194,
    provider: "stripe",
    paymentMethod: "card",
    reference: "pi_3QDemoPaid_01",
    createdAt: "2025-12-14T07:21:17.713Z",
    updatedAt: "2025-12-14T07:21:17.713Z",
  },
  {
    _id: "tx_002",
    userId: {
      _id: "u2",
      firstName: "John",
      lastName: "Doe",
      email: "john@gmail.com",
    },
    courseId: {
      _id: "c2",
      title: "Modern JavaScript Mastery",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&q=80",
    },
    type: "purchase",
    status: "pending",
    amount: 149,
    currency: "USD",
    fee: 0,
    netAmount: 149,
    provider: "stripe",
    paymentMethod: "card",
    reference: "pi_3QDemoPending_02",
    createdAt: "2025-12-13T19:03:00.000Z",
    updatedAt: "2025-12-13T19:03:00.000Z",
  },
  {
    _id: "tx_003",
    userId: {
      _id: "u3",
      firstName: "Emma",
      lastName: "Collins",
      email: "emma@gmail.com",
    },
    courseId: {
      _id: "c1",
      title: "Web Development Course 01",
    },
    type: "refund",
    status: "refunded",
    amount: 200,
    currency: "USD",
    fee: 0,
    netAmount: 0,
    provider: "stripe",
    paymentMethod: "card",
    reference: "re_3QDemoRefund_03",
    createdAt: "2025-12-12T12:12:00.000Z",
    updatedAt: "2025-12-12T12:15:00.000Z",
  },
  {
    _id: "tx_004",
    userId: {
      _id: "u4",
      firstName: "Alex",
      lastName: "Smith",
      email: "alex@gmail.com",
    },
    type: "payout",
    status: "paid",
    amount: 500,
    currency: "USD",
    fee: 5,
    netAmount: 495,
    provider: "manual",
    paymentMethod: "bank",
    reference: "payout_batch_2025_12",
    createdAt: "2025-12-11T08:00:00.000Z",
    updatedAt: "2025-12-11T08:00:00.000Z",
  },
  {
    _id: "tx_005",
    userId: {
      _id: "u5",
      firstName: "Mia",
      lastName: "Lee",
      email: "mia@gmail.com",
    },
    courseId: {
      _id: "c3",
      title: "React & TypeScript Fundamentals",
    },
    type: "purchase",
    status: "failed",
    amount: 99,
    currency: "USD",
    provider: "stripe",
    paymentMethod: "card",
    reference: "pi_3QDemoFail_05",
    createdAt: "2025-12-10T18:30:00.000Z",
    updatedAt: "2025-12-10T18:30:00.000Z",
  },
];

/* ===========================
   HELPERS
=========================== */

function fmt(dt?: string | null) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "-";
  }
}

function money(amount?: number, currency?: string) {
  if (typeof amount !== "number") return "-";
  const cur = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(amount);
  } catch {
    return `${cur} ${amount.toFixed(2)}`;
  }
}

function initials(u?: User) {
  const a = (u?.firstName || "").trim();
  const b = (u?.lastName || "").trim();
  const s = `${a} ${b}`.trim();
  if (!s) return "U";
  return s
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

export default function AdminTransactionsIndex() {
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [type, setType] = useState<TxType | "all">("all");

  const [rows, setRows] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const totalPages = useMemo(() => {
    const pages = Math.ceil((total || 0) / (limit || 20));
    return pages > 0 ? pages : 1;
  }, [total, limit]);

  // API-friendly params shape (kept for later swap-in)
  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (q.trim()) params.q = q.trim();
    if (status !== "all") params.status = status;
    if (type !== "all") params.type = type;
    return params;
  }, [q, status, type, page, limit]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, type]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Simulate fetch (replace with API call later)
    const t = setTimeout(() => {
      if (!mounted) return;

      const qq = (q || "").trim().toLowerCase();

      let filtered = [...DEMO_TRANSACTIONS];

      if (qq) {
        filtered = filtered.filter((tx) => {
          const name = `${tx.userId?.firstName || ""} ${
            tx.userId?.lastName || ""
          }`
            .trim()
            .toLowerCase();
          const email = (tx.userId?.email || "").toLowerCase();
          const course = (tx.courseId?.title || "").toLowerCase();
          const ref = (tx.reference || "").toLowerCase();

          return (
            name.includes(qq) ||
            email.includes(qq) ||
            course.includes(qq) ||
            ref.includes(qq)
          );
        });
      }

      if (status !== "all")
        filtered = filtered.filter((x) => x.status === status);
      if (type !== "all") filtered = filtered.filter((x) => x.type === type);

      // pagination
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      // mimic API response
      const resp: ApiResp = {
        items: paged,
        total: filtered.length,
        page,
        limit,
      };

      setRows(resp.items);
      setTotal(resp.total);
      setLoading(false);
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [queryParams, q, status, type, page, limit]);

  const badgeClass = (s?: TxStatus) => {
    if (s === "paid")
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (s === "pending")
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    if (s === "failed")
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (s === "refunded")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (s === "cancelled")
      return "bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-neutral-300";
    return "bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-neutral-300";
  };

  const typeIcon = (t?: TxType) => {
    if (t === "purchase")
      return <ArrowUpRight className="h-4 w-4 text-gray-500" />;
    if (t === "refund")
      return <ArrowDownLeft className="h-4 w-4 text-gray-500" />;
    if (t === "payout") return <Wallet className="h-4 w-4 text-gray-500" />;
    return <CreditCard className="h-4 w-4 text-gray-500" />;
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-gray-500">
            Monitor payments, refunds, and payouts across the platform.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="px-2 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            Total:{" "}
            <span className="font-medium text-gray-900 dark:text-neutral-100">
              {total}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student email, name, course, or reference…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All types</option>
            <option value="purchase">Purchase</option>
            <option value="refund">Refund</option>
            <option value="payout">Payout</option>
            <option value="adjustment">Adjustment</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin inline-block" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((tx) => (
                <tr
                  key={tx._id}
                  className="border-t border-gray-100 dark:border-neutral-800"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-neutral-200">
                        {initials(tx.userId)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                          {tx.userId?.firstName || tx.userId?.lastName
                            ? `${tx.userId?.firstName || ""} ${
                                tx.userId?.lastName || ""
                              }`.trim()
                            : "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {tx.userId?.email || "-"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {tx.courseId?.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tx.courseId.thumbnailUrl}
                          alt={tx.courseId?.title || "Course"}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                          {tx.courseId?.title || "-"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          Ref: {tx.reference || "-"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="inline-flex items-center gap-2">
                      {typeIcon(tx.type)}
                      <span className="text-gray-900 dark:text-neutral-100">
                        {tx.type || "—"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tx.provider ? `${tx.provider}` : ""}
                      {tx.provider && tx.paymentMethod ? " · " : ""}
                      {tx.paymentMethod ? tx.paymentMethod : ""}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-neutral-100">
                      {money(tx.amount, tx.currency)}
                    </div>
                    {(typeof tx.fee === "number" ||
                      typeof tx.netAmount === "number") && (
                      <div className="text-xs text-gray-500">
                        {typeof tx.fee === "number"
                          ? `Fee: ${money(tx.fee, tx.currency)}`
                          : ""}
                        {typeof tx.fee === "number" &&
                        typeof tx.netAmount === "number"
                          ? " · "
                          : ""}
                        {typeof tx.netAmount === "number"
                          ? `Net: ${money(tx.netAmount, tx.currency)}`
                          : ""}
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${badgeClass(
                        tx.status
                      )}`}
                    >
                      {tx.status || "unknown"}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600 dark:text-neutral-300">
                    {fmt(tx.createdAt)}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/transactions/${tx._id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 dark:border-neutral-800 text-sm">
          <div className="text-gray-500">
            Page{" "}
            <span className="text-gray-900 dark:text-neutral-100 font-medium">
              {page}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 dark:text-neutral-100 font-medium">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* API Swap Note */}
      <div className="mt-4 text-xs text-gray-500">
        API-ready: replace the demo fetch in{" "}
        <span className="font-mono">useEffect</span> with{" "}
        <span className="font-mono">
          apiRequest.get("/transactions", &#123; params: queryParams &#125;)
        </span>
        .
      </div>
    </AdminLayout>
  );
}

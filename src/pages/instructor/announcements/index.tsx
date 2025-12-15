import InstructorLayout from "@/components/instructor/layout/InstructorLayout";
import {
  Eye,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* =========================
   Types (API-friendly)
========================= */

type AnnouncementStatus = "draft" | "published";

type Announcement = {
  _id: string;
  title: string;
  message: string;

  // optional scope
  courseId?: {
    _id: string;
    title: string;
  } | null;

  // optional "visibility"
  visibility: "all" | "enrolled"; // all students vs enrolled students only
  status: AnnouncementStatus;

  createdAt: string;
  updatedAt: string;
};

type CourseLite = {
  _id: string;
  title: string;
};

/* =========================
   Demo data (replace later)
========================= */

const DEMO_COURSES: CourseLite[] = [
  { _id: "c1", title: "Web Development Course 01" },
  { _id: "c2", title: "Modern JavaScript Mastery" },
  { _id: "c3", title: "React & TypeScript Fundamentals" },
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    _id: "a1",
    title: "Welcome to the course 🎉",
    message:
      "Hi everyone—welcome! Start with Module 1, and don’t skip the resources section. If you get stuck, post your question in Q&A.",
    courseId: { _id: "c1", title: "Web Development Course 01" },
    visibility: "enrolled",
    status: "published",
    createdAt: "2025-12-12T10:30:00.000Z",
    updatedAt: "2025-12-12T10:30:00.000Z",
  },
  {
    _id: "a2",
    title: "Assignment deadline update",
    message:
      "Deadline extended by 48 hours due to weekend schedule. Submit by Tuesday 11:59 PM.",
    courseId: { _id: "c2", title: "Modern JavaScript Mastery" },
    visibility: "enrolled",
    status: "published",
    createdAt: "2025-12-13T18:10:00.000Z",
    updatedAt: "2025-12-13T18:10:00.000Z",
  },
  {
    _id: "a3",
    title: "New lesson coming (Draft)",
    message:
      "I’m recording a bonus lesson on advanced hooks patterns and performance optimizations.",
    courseId: null, // global announcement
    visibility: "all",
    status: "draft",
    createdAt: "2025-12-14T07:00:00.000Z",
    updatedAt: "2025-12-14T07:00:00.000Z",
  },
];

/* =========================
   Helpers
========================= */

function fmt(dt?: string) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "-";
  }
}

function badgeClass(status: AnnouncementStatus) {
  return status === "published"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
}

function visClass(v: "all" | "enrolled") {
  return v === "all"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-neutral-300";
}

/* =========================
   Page
========================= */

export default function InstructorAnnouncementsPage() {
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState<string | "all">("all");
  const [status, setStatus] = useState<AnnouncementStatus | "all">("all");

  // data (demo now, API later)
  const [courses] = useState<CourseLite[]>(DEMO_COURSES);
  const [rows, setRows] = useState<Announcement[]>([]);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  // form state
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formCourse, setFormCourse] = useState<string | "global">("global");
  const [formVisibility, setFormVisibility] = useState<"all" | "enrolled">(
    "enrolled"
  );
  const [formStatus, setFormStatus] = useState<AnnouncementStatus>("draft");

  // load demo (simulate fetch)
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const t = setTimeout(() => {
      if (!mounted) return;
      setRows(DEMO_ANNOUNCEMENTS);
      setLoading(false);
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  // filtered view
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let data = [...rows];

    if (qq) {
      data = data.filter((a) => {
        const title = a.title.toLowerCase();
        const msg = a.message.toLowerCase();
        const course = (a.courseId?.title || "").toLowerCase();
        return title.includes(qq) || msg.includes(qq) || course.includes(qq);
      });
    }

    if (courseId !== "all") {
      data = data.filter((a) => a.courseId?._id === courseId);
    }

    if (status !== "all") {
      data = data.filter((a) => a.status === status);
    }

    // newest first
    data.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    return data;
  }, [rows, q, courseId, status]);

  const openCreate = () => {
    setEditing(null);
    setFormTitle("");
    setFormMessage("");
    setFormCourse("global");
    setFormVisibility("enrolled");
    setFormStatus("draft");
    setOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setFormTitle(a.title);
    setFormMessage(a.message);
    setFormCourse(a.courseId?._id ? a.courseId._id : "global");
    setFormVisibility(a.visibility);
    setFormStatus(a.status);
    setOpen(true);
  };

  const saveAnnouncement = () => {
    const title = formTitle.trim();
    const message = formMessage.trim();
    if (!title || !message) return;

    const now = new Date().toISOString();

    const selectedCourse =
      formCourse === "global"
        ? null
        : {
            _id: formCourse,
            title: courses.find((c) => c._id === formCourse)?.title || "Course",
          };

    if (editing) {
      setRows((prev) =>
        prev.map((x) =>
          x._id === editing._id
            ? {
                ...x,
                title,
                message,
                courseId: selectedCourse,
                visibility: formVisibility,
                status: formStatus,
                updatedAt: now,
              }
            : x
        )
      );
    } else {
      setRows((prev) => [
        {
          _id: `a_${Math.random().toString(16).slice(2)}`,
          title,
          message,
          courseId: selectedCourse,
          visibility: formVisibility,
          status: formStatus,
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
    }

    setOpen(false);
    setEditing(null);
  };

  const deleteAnnouncement = (id: string) => {
    setRows((prev) => prev.filter((x) => x._id !== id));
  };

  return (
    <InstructorLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Announcements</h1>
          <p className="text-sm text-gray-500">
            Publish updates to learners across your courses.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search announcements…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-neutral-900 text-gray-500">
            <tr>
              <th className="text-left p-3">Announcement</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Visibility</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin inline-block" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No announcements found.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-gray-100 dark:border-neutral-800"
                >
                  <td className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mt-0.5">
                        <Megaphone className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                          {a.title}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {a.message}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    {a.courseId?.title ? a.courseId.title : "All courses"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${visClass(
                        a.visibility
                      )}`}
                    >
                      {a.visibility === "all"
                        ? "All learners"
                        : "Enrolled only"}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${badgeClass(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600 dark:text-neutral-300">
                    {fmt(a.createdAt)}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="Preview"
                        onClick={() => alert(a.message)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="Edit"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-red-600"
                        title="Delete"
                        onClick={() => deleteAnnouncement(a._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="font-semibold">
                {editing ? "Edit Announcement" : "Create Announcement"}
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-neutral-300">
                  Title
                </label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., New lesson available"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-neutral-300">
                  Message
                </label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Write your announcement…"
                  rows={6}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-neutral-300">
                    Course
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="global">All courses</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-neutral-300">
                    Visibility
                  </label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="enrolled">Enrolled only</option>
                    <option value="all">All learners</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-neutral-300">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                onClick={saveAnnouncement}
                disabled={!formTitle.trim() || !formMessage.trim()}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50"
              >
                {editing ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* API hint */}
      <div className="mt-4 text-xs text-gray-500">
        API-ready: swap demo state with{" "}
        <span className="font-mono">GET /instructor/announcements</span>, and
        for create/edit/delete use{" "}
        <span className="font-mono">POST/PUT/DELETE</span>.
      </div>
    </InstructorLayout>
  );
}

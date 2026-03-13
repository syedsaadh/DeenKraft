"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import * as api from "@/lib/api-client";

const PAGE_SIZE = 20;

// -- Status config (reused subset) --

interface StatusConfig {
  label: string;
  dot: string;
  badge: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: "Draft",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  generating: {
    label: "Generating",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  ready: {
    label: "Ready",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  exporting: {
    label: "Exporting",
    dot: "bg-purple-500",
    badge:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  },
  exported: {
    label: "Exported",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
};

function getStatus(status: string): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
}

// -- Relative time --

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// -- Pagination --

function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Showing {from}&ndash;{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-zinc-400 dark:text-zinc-500">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[2rem] rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// -- Empty state --

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <svg className="h-8 w-8 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-white">
        Trash is empty
      </h3>
      <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Deleted carousels will appear here. You can restore them or permanently delete them.
      </p>
    </div>
  );
}

// -- Loading skeleton --

function ListSkeletons() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {Array.from({ length: 6 }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}

// -- Main page --

export default function TrashPage() {
  const [projects, setProjects] = useState<api.CarouselProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Confirm dialogs
  const [deleteTarget, setDeleteTarget] = useState<api.CarouselProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptying, setEmptying] = useState(false);

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    setError("");
    api
      .listTrashed(p, PAGE_SIZE)
      .then((res) => {
        setProjects(res.items);
        setTotalPages(res.totalPages);
        setPage(res.page);
        setTotal(res.total);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load trash"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const handleRestore = async (project: api.CarouselProject) => {
    setRestoringId(project.id);
    try {
      await api.restoreCarousel(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore project");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.permanentDeleteCarousel(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleEmptyTrash = async () => {
    setEmptying(true);
    try {
      await api.emptyTrash();
      setProjects([]);
      setTotal(0);
      setTotalPages(1);
      setPage(1);
      setShowEmptyConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to empty trash");
      setShowEmptyConfirm(false);
    } finally {
      setEmptying(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Trash
          </h1>
          {!loading && total > 0 && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {total} {total === 1 ? "project" : "projects"} in trash
            </p>
          )}
        </div>

        {!loading && total > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowEmptyConfirm(true)}
          >
            <svg
              className="-ml-0.5 mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Empty Trash
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <ListSkeletons />
      ) : projects.length === 0 && page === 1 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {/* Column headers */}
            <div className="flex items-center gap-4 border-b border-zinc-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <span className="w-52 shrink-0 sm:w-64">Title</span>
              <span className="w-24 shrink-0">Status</span>
              <span className="w-16 shrink-0 text-center">Slides</span>
              <span className="hidden min-w-0 flex-1 lg:block">Trashed</span>
              <span className="w-40 shrink-0 text-right">Actions</span>
            </div>

            {/* Rows */}
            {projects.map((project, i) => {
              const status = getStatus(project.status);
              const slideCount = project.slides?.length ?? 0;
              const isLast = i === projects.length - 1;

              return (
                <div
                  key={project.id}
                  className={`flex items-center gap-4 px-5 py-3.5 ${
                    !isLast ? "border-b border-zinc-100 dark:border-zinc-800/50" : ""
                  }`}
                >
                  {/* Title */}
                  <h3 className="w-52 shrink-0 truncate text-sm font-medium text-zinc-900 sm:w-64 dark:text-white">
                    {project.title}
                  </h3>

                  {/* Status */}
                  <div className="flex w-24 shrink-0 items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`} />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {status.label}
                    </span>
                  </div>

                  {/* Slides */}
                  <span className="w-16 shrink-0 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {slideCount}
                  </span>

                  {/* Trashed date */}
                  <span className="hidden min-w-0 flex-1 text-xs text-zinc-400 lg:block dark:text-zinc-500">
                    {project.deletedAt ? timeAgo(project.deletedAt) : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex w-40 shrink-0 items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRestore(project)}
                      disabled={restoringId === project.id}
                    >
                      {restoringId === project.id ? "Restoring..." : "Restore"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(project)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={fetchPage}
          />
        </>
      )}

      {/* Permanent delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Permanently delete"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete Forever"
          onConfirm={handlePermanentDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Empty trash confirmation */}
      {showEmptyConfirm && (
        <ConfirmDialog
          title="Empty trash"
          message={`Are you sure you want to permanently delete all ${total} ${total === 1 ? "project" : "projects"} in trash? This action cannot be undone.`}
          confirmLabel="Empty Trash"
          onConfirm={handleEmptyTrash}
          onCancel={() => setShowEmptyConfirm(false)}
          loading={emptying}
        />
      )}
    </div>
  );
}

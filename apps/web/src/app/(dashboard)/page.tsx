"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardSkeleton, ListRowSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import * as api from "@/lib/api-client";

const PAGE_SIZE = 12;

type ViewMode = "list" | "grid";

type SortOption = "createdAt:DESC" | "createdAt:ASC" | "updatedAt:DESC" | "updatedAt:ASC";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "createdAt:DESC", label: "Newest first" },
  { value: "createdAt:ASC", label: "Oldest first" },
  { value: "updatedAt:DESC", label: "Recently updated" },
  { value: "updatedAt:ASC", label: "Least recently updated" },
];

// -- Status config --

interface StatusConfig {
  label: string;
  dot: string;
  badge: string;
  accent: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: "Draft",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    accent: "bg-zinc-300 dark:bg-zinc-700",
  },
  generating: {
    label: "Generating",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    accent: "bg-amber-400 dark:bg-amber-500",
  },
  ready: {
    label: "Ready",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    accent: "bg-blue-500 dark:bg-blue-400",
  },
  exporting: {
    label: "Exporting",
    dot: "bg-purple-500",
    badge:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    accent: "bg-purple-500 dark:bg-purple-400",
  },
  exported: {
    label: "Exported",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    accent: "bg-emerald-500 dark:bg-emerald-400",
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

// -- Icons --

function GridIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function ListIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
      />
    </svg>
  );
}

function SlidesIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.007.661-1.858 1.572-2.143"
      />
    </svg>
  );
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
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-sm text-zinc-400 dark:text-zinc-500"
            >
              ...
            </span>
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
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// -- Grid card --

function ProjectGridCard({
  project,
  onDelete,
}: {
  project: api.CarouselProject;
  onDelete: () => void;
}) {
  const status = getStatus(project.status);
  const slideCount = project.slides?.length ?? 0;

  return (
    <div className="group relative">
      <Link href={`/carousels/${project.id}`}>
        <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
          {/* Title */}
          <h3 className="mb-1 line-clamp-1 text-sm font-medium text-zinc-900 dark:text-white">
            {project.title}
          </h3>

          {/* Topic */}
          <p className="mb-3 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {project.topic}
          </p>

          {/* Meta row */}
          <div className="mt-auto flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span>&middot;</span>
            <span>{slideCount} {slideCount === 1 ? "slide" : "slides"}</span>
            <span>&middot;</span>
            <span>{timeAgo(project.updatedAt)}</span>
          </div>
        </div>
      </Link>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 hidden rounded-md p-1 text-zinc-300 transition-colors hover:text-red-500 group-hover:block dark:text-zinc-600 dark:hover:text-red-400"
        title="Move to trash"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

// -- List view --

function ProjectListView({
  projects,
  onDelete,
}: {
  projects: api.CarouselProject[];
  onDelete: (p: api.CarouselProject) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Column headers */}
      <div className="flex items-center gap-4 border-b border-zinc-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        <span className="w-52 shrink-0 sm:w-64">Title</span>
        <span className="w-24 shrink-0">Status</span>
        <span className="hidden min-w-0 flex-1 lg:block">Topic</span>
        <span className="w-16 shrink-0 text-center">Slides</span>
        <span className="w-20 shrink-0 text-right">Updated</span>
        <span className="w-8 shrink-0" />
      </div>

      {/* Rows */}
      {projects.map((project, i) => {
        const status = getStatus(project.status);
        const slideCount = project.slides?.length ?? 0;
        const isLast = i === projects.length - 1;

        return (
          <div key={project.id} className="group relative">
            <Link href={`/carousels/${project.id}`}>
              <div
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  !isLast
                    ? "border-b border-zinc-100 dark:border-zinc-800/50"
                    : ""
                }`}
              >
                {/* Title */}
                <h3 className="w-52 shrink-0 truncate text-sm font-medium text-zinc-900 sm:w-64 dark:text-white">
                  {project.title}
                </h3>

                {/* Status */}
                <div className="flex w-24 shrink-0 items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`}
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {status.label}
                  </span>
                </div>

                {/* Topic */}
                <p className="hidden min-w-0 flex-1 truncate text-sm text-zinc-500 lg:block dark:text-zinc-400">
                  {project.topic}
                </p>

                {/* Slides */}
                <span className="w-16 shrink-0 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {slideCount}
                </span>

                {/* Updated */}
                <span className="w-20 shrink-0 text-right text-xs text-zinc-400 dark:text-zinc-500">
                  {timeAgo(project.updatedAt)}
                </span>

                {/* Spacer for delete button */}
                <span className="w-8 shrink-0" />
              </div>
            </Link>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(project);
              }}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:block dark:hover:bg-red-950 dark:hover:text-red-400"
              title="Delete project"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// -- Empty state --

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <SlidesIcon className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-white">
        No carousels yet
      </h3>
      <p className="mb-5 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Create your first carousel to start generating beautiful Instagram
        content with AI.
      </p>
      <Link href="/carousels/new">
        <Button>
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create Carousel
        </Button>
      </Link>
    </div>
  );
}

// -- Loading skeletons --

function GridSkeletons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mb-1 h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mb-3 h-3 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

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

export default function DashboardPage() {
  const [projects, setProjects] = useState<api.CarouselProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<api.CarouselProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [sort, setSort] = useState<SortOption>("createdAt:DESC");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    (p: number, s: SortOption = sort) => {
      const [orderBy, order] = s.split(":") as ["createdAt" | "updatedAt", "ASC" | "DESC"];
      setLoading(true);
      setError("");
      api
        .listCarousels(p, PAGE_SIZE, orderBy, order)
        .then((res) => {
          setProjects(res.items);
          setTotalPages(res.totalPages);
          setPage(res.page);
          setTotal(res.total);
        })
        .catch((err) =>
          setError(
            err instanceof Error ? err.message : "Failed to load projects",
          ),
        )
        .finally(() => setLoading(false));
    },
    [sort],
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const handleSortChange = (value: SortOption) => {
    setSort(value);
    fetchPage(1, value);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteCarousel(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Projects
          </h1>
          {!loading && total > 0 && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {total} {total === 1 ? "carousel" : "carousels"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="h-7 appearance-none rounded-md border border-zinc-200 bg-white py-0 pl-2 pr-7 text-xs text-zinc-600 outline-none transition-colors hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 transition-colors ${
                view === "list"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
              title="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                view === "grid"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
              title="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </button>
          </div>

          <Link href="/carousels/new">
            <Button size="sm">
              <svg
                className="-ml-0.5 mr-1.5 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Carousel
            </Button>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        view === "grid" ? (
          <GridSkeletons />
        ) : (
          <ListSkeletons />
        )
      ) : projects.length === 0 && page === 1 ? (
        <EmptyState />
      ) : view === "grid" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectGridCard
                key={project.id}
                project={project}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={fetchPage}
          />
        </>
      ) : (
        <>
          <ProjectListView
            projects={projects}
            onDelete={setDeleteTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={fetchPage}
          />
        </>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Move to trash"
          message={`This will move "${deleteTarget.title}" to trash. You can restore it later.`}
          confirmLabel="Move to Trash"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

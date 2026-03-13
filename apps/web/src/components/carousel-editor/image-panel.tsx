"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UploadAsset } from "@/lib/api-client";
import * as api from "@/lib/api-client";

interface ImagePanelProps {
  projectId: string;
  onSelectImage: (url: string) => void;
  currentBackgroundImage?: string;
  onClearBackground: () => void;
}

export function ImagePanel({
  projectId,
  onSelectImage,
  currentBackgroundImage,
  onClearBackground,
}: ImagePanelProps) {
  const [uploads, setUploads] = useState<UploadAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUploads = useCallback(async () => {
    try {
      const result = await api.listUploads(projectId, 1, 50);
      setUploads(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const asset = await api.uploadFile(projectId, file);
      setUploads((prev) => [asset, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (uploadId: string) => {
    try {
      await api.deleteUpload(projectId, uploadId);
      const deleted = uploads.find((u) => u.id === uploadId);
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      // Clear background if it was using the deleted image
      if (deleted && currentBackgroundImage === deleted.url) {
        onClearBackground();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Background Image
        </p>
      </div>

      {/* Current background indicator */}
      {currentBackgroundImage && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/50 p-2 dark:border-emerald-800 dark:bg-emerald-950/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentBackgroundImage}
            alt="Current background"
            className="h-8 w-8 shrink-0 rounded object-cover"
          />
          <span className="flex-1 truncate text-xs text-emerald-700 dark:text-emerald-400">
            Background set
          </span>
          <button
            onClick={onClearBackground}
            className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
      >
        {uploading ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            Uploading...
          </>
        ) : (
          <>
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upload image
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : uploads.length === 0 ? (
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          No images uploaded yet
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {uploads.map((upload) => {
            const isActive = currentBackgroundImage === upload.url;
            return (
              <div key={upload.id} className="group relative">
                <button
                  onClick={() => onSelectImage(upload.url)}
                  className={`aspect-square w-full overflow-hidden rounded border transition-all ${
                    isActive
                      ? "border-emerald-500 ring-1 ring-emerald-500"
                      : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={upload.url}
                    alt={upload.originalName}
                    className="h-full w-full object-cover"
                  />
                </button>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(upload.id);
                  }}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white hover:bg-red-600 group-hover:flex"
                  title="Delete"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

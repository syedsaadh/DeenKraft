const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Auth ---

export interface AuthResponse {
  access_token: string;
}

export function register(email: string, password: string, name: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// --- User Profile ---

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export function getMe() {
  return request<UserProfile>("/auth/me");
}

// --- User Preferences ---

export interface UserPreferences {
  preferredTemplateId?: string;
  preferredTone?: string;
  preferredSlideCount?: number;
  ctaStyle?: string;
  textDensity?: "minimal" | "moderate" | "detailed";
  instagramHandle?: string;
}

export function getPreferences() {
  return request<UserPreferences>("/auth/preferences");
}

export function updatePreferences(data: Partial<UserPreferences>) {
  return request<UserPreferences>("/auth/preferences", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// --- Carousel Templates ---

export interface SlideElementSchema {
  type: "text" | "image" | "shape";
  key: string;
  label: string;
  style: Record<string, string | number>;
  defaultValue?: string;
}

export interface SlideSchema {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  padding?: number;
  elements: SlideElementSchema[];
}

export interface TextConstraint {
  maxWords?: number;
  maxChars?: number;
  minWords?: number;
}

export type TextConstraints = Record<string, TextConstraint>;

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  family: string | null;
  slideCount: number;
  coverSlideSchema: SlideSchema;
  contentSlideSchema: SlideSchema;
  endSlideSchema: SlideSchema;
  textConstraints: TextConstraints | null;
  thumbnailUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function listTemplates(
  opts: { category?: string; family?: string; page?: number; limit?: number } = {},
) {
  const { category, family, page = 1, limit = 20 } = opts;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set("category", category);
  if (family) params.set("family", family);
  return request<PaginatedResponse<CarouselTemplate>>(
    `/carousel-templates?${params}`,
  );
}

export function getTemplate(id: string) {
  return request<CarouselTemplate>(`/carousel-templates/${id}`);
}

// --- Carousel Projects ---

export interface GeneratedSlide {
  slideIndex: number;
  slideType: "cover" | "content" | "end";
  content: Record<string, string>;
}

export interface BrandProfile {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  tone: string;
  ctaStyle: string;
  preferredSlideCount: number;
  textDensity: "minimal" | "moderate" | "detailed";
}

export interface CarouselProject {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  topic: string;
  slides: GeneratedSlide[] | null;
  status: "draft" | "generating" | "ready" | "exporting" | "exported";
  brandProfile: BrandProfile | null;
  exportedUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export function createCarousel(data: {
  title: string;
  topic: string;
  templateId: string;
}) {
  return request<CarouselProject>("/carousels", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listCarousels(
  page = 1,
  limit = 20,
  orderBy: "createdAt" | "updatedAt" = "createdAt",
  order: "ASC" | "DESC" = "DESC",
) {
  return request<PaginatedResponse<CarouselProject>>(
    `/carousels?page=${page}&limit=${limit}&orderBy=${orderBy}&order=${order}`,
  );
}

export function getCarousel(id: string) {
  return request<CarouselProject>(`/carousels/${id}`);
}

export function updateCarousel(
  id: string,
  data: { title?: string; topic?: string; slides?: GeneratedSlide[] },
) {
  return request<CarouselProject>(`/carousels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCarousel(id: string) {
  return request<void>(`/carousels/${id}`, { method: "DELETE" });
}

// --- Trash ---

export function listTrashed(page = 1, limit = 20) {
  return request<PaginatedResponse<CarouselProject>>(
    `/carousels/trash?page=${page}&limit=${limit}`,
  );
}

export function restoreCarousel(id: string) {
  return request<CarouselProject>(`/carousels/${id}/restore`, {
    method: "POST",
  });
}

export function permanentDeleteCarousel(id: string) {
  return request<void>(`/carousels/${id}/permanent`, { method: "DELETE" });
}

export function emptyTrash() {
  return request<void>(`/carousels/trash`, { method: "DELETE" });
}

// --- Brand Profile ---

export function upsertBrandProfile(projectId: string, data: BrandProfile) {
  return request<BrandProfile>(`/carousels/${projectId}/brand`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getBrandProfile(projectId: string) {
  return request<BrandProfile>(`/carousels/${projectId}/brand`);
}

// --- AI Generation ---

export interface GenerateContentParams {
  topic: string;
  slideCount?: number;
  audience?: string;
  tone?: string;
  ctaGoal?: string;
  textDensity?: "minimal" | "moderate" | "detailed";
}

export function generateContent(id: string, data: GenerateContentParams) {
  return request<CarouselProject>(`/carousels/${id}/generate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSlide(
  id: string,
  slideIndex: number,
  content: Record<string, string>,
) {
  return request<CarouselProject>(`/carousels/${id}/slides/${slideIndex}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export function regenerateSlide(
  id: string,
  slideIndex: number,
  instructions?: string,
) {
  return request<CarouselProject>(
    `/carousels/${id}/slides/${slideIndex}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify(instructions ? { instructions } : {}),
    },
  );
}

export function exportCarousel(id: string) {
  return request<{ urls: string[] }>(`/carousels/${id}/export`, {
    method: "POST",
  });
}

export function getExportUrls(id: string) {
  return request<{ urls: string[] }>(`/carousels/${id}/export`);
}

// --- Uploads ---

export interface UploadAsset {
  id: string;
  projectId: string;
  userId: string;
  storageKey: string;
  mimeType: string;
  originalName: string;
  size: number;
  url: string;
  createdAt: string;
}

export async function uploadFile(
  projectId: string,
  file: File,
): Promise<UploadAsset> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/carousels/${projectId}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json() as Promise<UploadAsset>;
}

export function listUploads(projectId: string, page = 1, limit = 20) {
  return request<PaginatedResponse<UploadAsset>>(
    `/carousels/${projectId}/uploads?page=${page}&limit=${limit}`,
  );
}

export function getUpload(projectId: string, uploadId: string) {
  return request<UploadAsset>(
    `/carousels/${projectId}/uploads/${uploadId}`,
  );
}

export function deleteUpload(projectId: string, uploadId: string) {
  return request<void>(`/carousels/${projectId}/uploads/${uploadId}`, {
    method: "DELETE",
  });
}

export { ApiError };

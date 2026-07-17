// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  studentId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  roles: string[];
  isEmailVerified?: boolean;
}

// ─── Book ────────────────────────────────────────────────────────────────────
export interface BookCategory {
  id: number;
  name: string;
}
export interface BookAuthor {
  id: number;
  name: string;
}
export interface BookPublisher {
  id: number;
  name: string;
}
export interface BookMaterialType {
  id: number;
  name: string;
}
export interface BookDepartment {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  titleKh?: string;
  isbn?: string;
  publicationYear?: number;
  description?: string;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pages?: number;
  language?: string | null;
  views: number;
  downloads: number;
  shares: number;
  isActive?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  Category?: BookCategory;
  Authors?: BookAuthor[];
  Publisher?: BookPublisher;
  MaterialType?: BookMaterialType;
  Department?: BookDepartment;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Backend returns books + pagination fields flat (not nested)
export interface PaginatedData<T> {
  books: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Auth inputs ─────────────────────────────────────────────────────────────
export interface LoginInput {
  identifier: string; // username | email | studentId
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  studentId?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Books query params ───────────────────────────────────────────────────────
export interface BooksQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string | number;
  publisherId?: string | number;
  departmentId?: string | number;
  typeId?: string | number;
  publicationYear?: number;
  yearFrom?: number;
  yearTo?: number;
  language?: string;
  authorId?: string | number;
  isActive?: boolean;
  hasVideo?: boolean | string;
  hasAudio?: boolean | string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ─── Auth state ───────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the initial /api/auth/me rehydration request is in-flight */
  isAuthLoading: boolean;
}

// ─── UI state ────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface UiState {
  toasts: Toast[];
}

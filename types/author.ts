export interface AuthorBook {
  id: number;
  title: string;
  titleKh?: string | null;
  coverUrl?: string | null;
  publicationYear?: number | null;
  views: number;
  downloads: number;
  isPrimaryAuthor: boolean;
}

export interface AuthorSummary {
  id: number;
  name: string;
  nameKh?: string | null;
  biography?: string | null;
  website?: string | null;
  totalBooks: number;
}

export interface AuthorDetails extends AuthorSummary {
  books: AuthorBook[];
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthorList {
  authors: AuthorSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

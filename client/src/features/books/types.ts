export type BookId = string;

export type BookStatus = "Want to Read" | "Reading" | "Finished";

export type Book = {
  id: BookId;
  title: string;
  author?: string;
  status: BookStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type BooksFilters = {
  status: BookStatus | "All";
};

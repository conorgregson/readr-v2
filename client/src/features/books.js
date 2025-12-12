// src/features/books.js
import {
  apiFetchBooks,
  apiCreateBook,
  apiUpdateBook,
  apiDeleteBook,
} from "../utils/api.js";

let books = [];

export async function initBooks() {
  try {
    books = await apiFetchBooks();
    renderBooks();
  } catch (err) {
    console.error("Failed to load books", err);
    // TODO: show a toast / inline error in your UI
  }
}

// Example render function (you already have this in some form)
function renderBooks() {
  // Use your existing DOM logic; just assume `books` now comes from backend
  // ...
}

// Hook this up to your form submit or "Add Book" button
export async function handleAddBook(formValues) {
  // formValues: { title, author, genre, pageCount, currentPage, status }
  try {
    const created = await apiCreateBook(formValues);
    books.unshift(created); // newest first
    renderBooks();
  } catch (err) {
    console.error("Failed to create book", err);
    // show error to user
  }
}

export async function handleUpdateBook(id, patch) {
  try {
    const updated = await apiUpdateBook(id, patch);
    const idx = books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      books[idx] = updated;
      renderBooks();
    }
  } catch (err) {
    console.error("Failed to update book", err);
  }
}

export async function handleDeleteBook(id) {
  try {
    await apiDeleteBook(id);
    books = books.filter((b) => b.id !== id);
    renderBooks();
  } catch (err) {
    console.error("Failed to delete book", err);
  }
}

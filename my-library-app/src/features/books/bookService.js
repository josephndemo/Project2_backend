const BACKEND_URL = 'http://localhost:5555/api';

/**
 * 🌎 LOCAL ARCHIVE SEARCH
 */
export async function fetchBooks(query, page = 1) {
  const response = await fetch(
    `${BACKEND_URL}/books?q=${encodeURIComponent(query)}&page=${page}`
  );
  if (!response.ok) throw new Error('Failed to query local backend database records.');
  const data = await response.json();
  return {
    totalResults: data.totalResults,
    books: data.books.map((book) => ({
      id: book.openlibrary_key, 
      openlibrary_key: book.openlibrary_key,
      title: book.title,
      author: book.author,
      year: book.year,
      coverUrl: book.cover_url,
      subjects: ["Local Archive", "General Literature"]
    }))
  };
}

/**
 * 🐍 FLASK INTERACTIVE BACKEND CRUD CONTROLLERS
 */
export async function fetchServerBookshelf() {
  const res = await fetch(`${BACKEND_URL}/books`);
  if (!res.ok) throw new Error("Failed to load server bookshelf matrix rows.");
  return res.json();
}

export async function apiAddBook(bookPayload) {
  const res = await fetch(`${BACKEND_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookPayload)
  });
  if (!res.ok) throw new Error("Failed to save book rows.");
  return res.json();
}

export async function apiUpdateBook(bookId, patchData) {
  const res = await fetch(`${BACKEND_URL}/books/${bookId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patchData)
  });
  if (!res.ok) throw new Error("Failed to update resource row attributes.");
  return res.json();
}

export async function apiDeleteBook(bookId) {
  const res = await fetch(`${BACKEND_URL}/books/${bookId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to delete book entry node.");
  return res.json();
}

// POST: Appends a review comment to a specific book
export async function apiAddComment(bookId, commentPayload) {
  const res = await fetch(`${BACKEND_URL}/books/${bookId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentPayload)
  });
  if (!res.ok) throw new Error("Failed to append commentary string data row.");
  return res.json();
}
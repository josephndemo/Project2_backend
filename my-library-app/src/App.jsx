import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Bookshelf from "./features/books/Bookshelf.jsx";
import { Library, Heart, Search, Star } from "lucide-react";

export default function App() {
  // Navigation & Data States
  const [currentView, setCurrentView] = useState("home"); // "home", "shelf", "favorites", "reviews"
  const [searchQuery, setSearchQuery] = useState("");
  const [allBooks, setAllBooks] = useState([]); // Master backend array storage
  const [displayedCatalog, setDisplayedCatalog] = useState([]); // Filtered array rendered on Home
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch saved bookshelf data from backend database on initialization
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5555/api/books")
      .then((res) => res.json())
      .then((data) => {
        const books = data.books || data;
        if (Array.isArray(books)) {
          setAllBooks(books);
          // 🟢 Core Change: Feed the home catalog view immediately with all books
          setDisplayedCatalog(books);
          setFavorites(books.filter((b) => b.is_favorite));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        console.error("Could not fetch tracked books database matrix.");
      });
  }, []);

  // 2. Handle Instant Client-Side Search Filtering across the collections
  const handleCatalogSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // If query field is cleared out, revert to showing all items
      setDisplayedCatalog(allBooks);
      return;
    }

    // Filter books locally by title or author strings
    const filtered = allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setDisplayedCatalog(filtered);
  };

  // Synchronize structural filters if data modifies dynamically
  const refreshCatalogSnapshot = (updatedList) => {
    setAllBooks(updatedList);
    if (!searchQuery.trim()) {
      setDisplayedCatalog(updatedList);
    } else {
      const filtered = updatedList.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setDisplayedCatalog(filtered);
    }
  };

  // 3. Handle Adding/Removing from Bookshelf with Modals
  const handleToggleBookshelf = async (book) => {
    const targetKey = book.openlibrary_key || book.id;
    const isAlreadyOnShelf = allBooks.some((b) => b.openlibrary_key === targetKey);

    if (isAlreadyOnShelf) {
      const bookToDelete = allBooks.find((b) => b.openlibrary_key === targetKey);
      
      Swal.fire({
        title: "Remove from Shelf?",
        text: `Are you sure you want to remove "${book.title}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, remove it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await fetch(`http://localhost:5555/api/books/${bookToDelete.id}`, { method: 'DELETE' });
            const finalSelection = allBooks.filter((b) => b.id !== bookToDelete.id);
            refreshCatalogSnapshot(finalSelection);
            setFavorites((prev) => prev.filter((f) => f.openlibrary_key !== targetKey));
            
            Swal.fire({ title: "Removed!", icon: "success", timer: 1200, showConfirmButton: false });
          } catch (error) {
            Swal.fire("Error", "Could not remove the book.", "error");
          }
        }
      });
    } else {
      try {
        const response = await fetch('http://localhost:5555/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book)
        });
        if (!response.ok) throw new Error();
        const savedBook = await response.json();
        const finalSelection = [...allBooks, savedBook];
        refreshCatalogSnapshot(finalSelection);
        
        Swal.fire({ title: "Added to Shelf!", icon: "success", timer: 1200, showConfirmButton: false });
      } catch (error) {
        Swal.fire("Error", "Failed to add the book to your tracking shelf.", "error");
      }
    }
  };

  // 4. Handle Toggling Favorites
  const handleToggleFavorite = async (book) => {
    const targetKey = book.openlibrary_key || book.id;
    const localBook = allBooks.find((b) => b.openlibrary_key === targetKey);

    if (!localBook) {
      Swal.fire("Notice", "Save this book to your shelf before favoriting!", "info");
      return;
    }

    const nextFavState = !localBook.is_favorite;

    try {
      const response = await fetch(`http://localhost:5555/api/books/${localBook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: nextFavState })
      });
      const updatedBook = await response.json();

      const finalSelection = allBooks.map((b) => b.id === localBook.id ? updatedBook : b);
      refreshCatalogSnapshot(finalSelection);

      if (nextFavState) {
        setFavorites((prev) => [...prev, updatedBook]);
      } else {
        setFavorites((prev) => prev.filter((f) => f.id !== localBook.id));
      }

      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: nextFavState ? "Saved to Favorites" : "Removed from Favorites", showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire("Error", "Failed to update favorites status.", "error");
    }
  };

  // 5. Handle Status Selection Changes
  const onStatusChange = async (bookId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5555/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updatedBook = await response.json();
      
      const finalSelection = allBooks.map((b) => b.id === bookId ? updatedBook : b);
      refreshCatalogSnapshot(finalSelection);
      setFavorites(finalSelection.filter(b => b.is_favorite));
      
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Status: ${newStatus}`, showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire("Error", "Failed to save reading status.", "error");
    }
  };

  // 6. Handle Star Score Submissions
  const onRateBook = async (bookId, newRating) => {
    try {
      const response = await fetch(`http://localhost:5555/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating })
      });
      const updatedBook = await response.json();
      
      const finalSelection = allBooks.map((b) => b.id === bookId ? updatedBook : b);
      refreshCatalogSnapshot(finalSelection);
      setFavorites(finalSelection.filter(b => b.is_favorite));
      
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Rated ${newRating} Stars!`, showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire("Error", "Failed to register score.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-600">
      
      {/* 🧭 NAVIGATION HEADER BAR */}
      <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 
          className="text-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
          onClick={() => { setCurrentView("home"); setDisplayedCatalog(allBooks); setSearchQuery(""); }}
        >
          📚 Personal Book Tracker
        </h1>
        
        {/* Navigation Tab Layout */}
        <div className="flex bg-slate-100 p-1 rounded-xl items-center gap-1">
          <button 
            onClick={() => setCurrentView("home")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === "home" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Home Catalog
          </button>
          
          <button 
            onClick={() => setCurrentView("shelf")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              currentView === "shelf" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Library className="w-3.5 h-3.5" /> My Shelf
            {allBooks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {allBooks.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setCurrentView("favorites")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              currentView === "favorites" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Favorites
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {favorites.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setCurrentView("reviews")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === "reviews" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Star className="w-3.5 h-3.5" /> Scores
          </button>
        </div>
      </nav>

      {/* 💻 DISPLAY RENDER HUB */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME SEARCH CATALOG (Now Pre-populated!) */}
        {currentView === "home" && (
          <div className="space-y-8">
            <div className="max-w-xl mx-auto text-center py-4">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Library Catalog</h2>
              <p className="text-sm text-slate-400 mt-1">Browse and search through your local application collection layout instantly.</p>
              
              <form onSubmit={handleCatalogSearch} className="mt-5 flex gap-2 max-w-md mx-auto">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, author name..." 
                  className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 rounded-xl transition-colors shadow-sm">
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm font-semibold">Loading available assets...</div>
            ) : displayedCatalog.length > 0 ? (
              <Bookshelf 
                shelfBooks={displayedCatalog}
                onSelectBook={() => {}}
                onToggleBookshelf={handleToggleBookshelf}
                onToggleFavorite={handleToggleFavorite}
                favorites={favorites}
                onRateBook={onRateBook}
                onStatusChange={onStatusChange}
              />
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">No match found for your selection criteria.</div>
            )}
          </div>
        )}

        {/* VIEW 2: ALL TRACKED ITEMS */}
        {currentView === "shelf" && (
          <Bookshelf 
            shelfBooks={allBooks}
            onSelectBook={() => {}}
            onToggleBookshelf={handleToggleBookshelf}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onRateBook={onRateBook}
            onStatusChange={onStatusChange}
          />
        )}

        {/* VIEW 3: FAVORITES GRID FILTER */}
        {currentView === "favorites" && (
          <Bookshelf 
            shelfBooks={favorites}
            onSelectBook={() => {}}
            onToggleBookshelf={handleToggleBookshelf}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onRateBook={onRateBook}
            onStatusChange={onStatusChange}
          />
        )}

        {/* VIEW 4: RATED REVIEWS ONLY */}
        {currentView === "reviews" && (
          <Bookshelf 
            shelfBooks={allBooks.filter(b => (b.rating || 0) > 0)}
            onSelectBook={() => {}}
            onToggleBookshelf={handleToggleBookshelf}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onRateBook={onRateBook}
            onStatusChange={onStatusChange}
          />
        )}

      </main>
    </div>
  );
}
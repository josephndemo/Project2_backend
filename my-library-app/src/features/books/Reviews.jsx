import React from 'react';
import BookCard from './BookCard.jsx';

export default function Reviews({ shelfBooks, onSelectBook, onToggleBookshelf, onToggleFavorite, favorites, onRateBook, onAddComment }) {
  const ratedBooks = shelfBooks.filter(book => (book.rating || 0) > 0 || (book.comments && book.comments.length > 0));
  const sortedRatedBooks = [...ratedBooks].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (sortedRatedBooks.length === 0) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-2">No Rated Books Found</h2>
        <p className="text-sm text-slate-400 leading-relaxed">Assign a star rating or add a comment note inside your Bookshelf to unlock this analytics board.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Critiques & Reviews Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Your rated items are ranked automatically from highest score down to lowest.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedRatedBooks.map((book) => (
          <BookCard 
            key={book.id || book.openlibrary_key}
            book={book}
            onSelect={onSelectBook}
            onToggleBookshelf={onToggleBookshelf}
            onToggleFavorite={onToggleFavorite}
            isBookshelf={true}
            isFavorite={favorites.some(f => f.openlibrary_key === (book.openlibrary_key || book.id))}
            showRating={true}
            onRateBook={onRateBook}
            showComment={true}
            onAddComment={onAddComment}
          />
        ))}
      </div>
    </div>
  );
}
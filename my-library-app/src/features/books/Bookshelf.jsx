import React from 'react';
import BookCard from './BookCard.jsx';
import { Library, Star } from 'lucide-react';

export default function Bookshelf({ 
  shelfBooks, 
  onSelectBook, 
  onToggleBookshelf, 
  onToggleFavorite, 
  favorites,
  onRateBook,
  onStatusChange 
}) {
  if (shelfBooks.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto px-6">
        <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4">
          <Library className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Your custom tracking shelf is empty</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Explore the catalog indices on the home dashboard to track statuses and commit notes to records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Tracked Bookshelf Index</h2>
        <p className="text-xs text-slate-400">Manage status tracks, rating scores, and records.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {shelfBooks.map((book) => {
          const currentKey = book.openlibrary_key || book.id;
          const isFav = favorites.some((f) => f.openlibrary_key === currentKey) || book.is_favorite;

          return (
            <div key={book.id || currentKey} className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2">
              <BookCard 
                book={book}
                onSelect={onSelectBook}
                onToggleBookshelf={onToggleBookshelf}
                onToggleFavorite={onToggleFavorite}
                isBookshelf={true}
                isFavorite={isFav}
              />

              {/* ACTION MANAGEMENT STRIP */}
              <div className="p-3 bg-slate-50/50 rounded-xl mt-2 border border-slate-100 flex flex-col gap-2">
                {/* READING STATUS SELECTION */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
                  <select 
                    value={book.status || 'in progress'}
                    onChange={(e) => onStatusChange(book.id, e.target.value)}
                    className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-medium text-slate-700 shadow-sm cursor-pointer"
                  >
                    <option value="in progress">In Progress</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                {/* INTERACTIVE SCORE RATING STARS */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-100/60 pt-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Score:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onRateBook(book.id, star)}
                        className={`transition-transform hover:scale-110 ${
                          star <= (book.rating || 0) ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
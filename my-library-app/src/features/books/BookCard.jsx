import React from 'react';
import { Heart, BookmarkCheck, Star } from 'lucide-react';

export default function BookCard({ 
  book, 
  onSelect, 
  onToggleBookshelf, 
  onToggleFavorite, 
  isBookshelf, 
  isFavorite 
}) {
  // Safe resolution mapping pattern prioritizing alternative backend naming variants
  const displayCover = book.cover_url || book.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col group">
      <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(book)}>
        <img 
          src={displayCover} 
          alt={book.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
          }}
        />
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book); }}
            className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-colors ${
              isFavorite 
                ? 'bg-rose-50 text-rose-500 border border-rose-100' 
                : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200/50'
            }`}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
            {book.year ? `Published ${book.year}` : 'Release Unknown'}
          </span>
          <h3 className="font-bold text-slate-800 text-sm mt-1 line-clamp-2" onClick={() => onSelect(book)}>
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">by {book.author || 'Unknown Author'}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          {book.rating > 0 && (
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              <span className="text-xs font-bold text-slate-600">{book.rating}</span>
            </div>
          )}
          <button
            onClick={() => onToggleBookshelf(book)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isBookshelf
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white border border-transparent'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            {isBookshelf ? 'On Shelf' : 'Add to Shelf'}
          </button>
        </div>
      </div>
    </div>
  );
}
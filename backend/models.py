from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Book(db.Model):
    __tablename__ = 'books'
    
    id = db.Column(db.Integer, primary_key=True)
    openlibrary_key = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    cover_url = db.Column(db.Text, nullable=True)
    year = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), default='in progress')  # Tracks: 'in progress' or 'read'
    rating = db.Column(db.Integer, default=0)                
    is_favorite = db.Column(db.Boolean, default=False, nullable=False) # 🟢 Synchronized with frontend tracking hooks
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 🔗 Relationship: Cascades deletions down to individual comment/review nodes automatically
    comments = db.relationship('Comment', backref='book', cascade="all, delete-orphan", lazy=True)


class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)                 # Holds the review written text
    timestamp = db.Column(db.String(100), nullable=False)        # Formatted date string from frontend
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
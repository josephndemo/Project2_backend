from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Book, Comment
from schemas import ma, book_schema, books_schema, comment_schema

app = Flask(__name__)

# Connection parameters targeting your local PostgreSQL service instance
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/openlibrary_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)  # Overrides browser cross-origin script restriction blocks
db.init_app(app)
ma.init_app(app)
migrate = Migrate(app, db)

# --- 📚 RESOURCE 1: BOOKS & SHELF ROUTING ENDPOINTS ---

@app.route('/api/books', methods=['GET'])
def get_books():
    """Queries books using text filtration and pagination variables."""
    search_query = request.args.get('q', '').strip().lower()
    page = request.args.get('page', 1, type=int)
    per_page = 30
    
    query = Book.query
    
    if search_query:
        query = query.filter(
            (Book.title.ilike(f'%{search_query}%')) | 
            (Book.author.ilike(f'%{search_query}%'))
        )
        
    paginated_results = query.order_by(Book.id.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        "totalResults": paginated_results.total,
        "books": books_schema.dump(paginated_results.items)
    }), 200


@app.route('/api/books', methods=['POST'])
def add_to_bookshelf():
    """Saves a book to the tracking table database."""
    data = request.get_json()
    
    existing_book = Book.query.filter_by(openlibrary_key=data.get('openlibrary_key')).first()
    if existing_book:
        return jsonify({"message": "Book record already registered on local shelf"}), 400
        
    new_book = Book(
        openlibrary_key=data['openlibrary_key'],
        title=data['title'],
        author=data['author'],
        cover_url=data.get('cover_url'),
        year=data.get('year'),
        status=data.get('status', 'in progress'),
        rating=data.get('rating', 0)
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify(book_schema.dump(new_book)), 201


@app.route('/api/books/<int:book_id>', methods=['PATCH'])
def update_book_metrics(book_id):
    """Updates metrics like shelf status, reading flags, or favorite ratings."""
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    if 'status' in data:
        book.status = data['status']
    if 'rating' in data:
        book.rating = data['rating']
        
    db.session.commit()
    return jsonify(book_schema.dump(book)), 200


@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def remove_from_shelf(book_id):
    """Purges the book row and automatically cascades to delete all linked reviews."""
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Successfully unlinked from repository record"}), 200


# --- 📝 RESOURCE 2: CONNECTED CHILD REVIEWS & COMMENTS ---

@app.route('/api/books/<int:book_id>/comments', methods=['POST'])
def append_book_comment(book_id):
    """Appends a timestamped review text element to a specific parent book row."""
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    new_comment = Comment(
        text=data['text'],
        timestamp=data['timestamp'],
        book_id=book.id
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(comment_schema.dump(new_comment)), 201


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Safeguard: Builds tables inside Postgres if missing
    app.run(port=5555, debug=True)
from flask_marshmallow import Marshmallow
from models import Book, Comment

ma = Marshmallow()

class CommentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Comment
        load_instance = True
        include_fk = True

class BookSchema(ma.SQLAlchemyAutoSchema):
    # Nesting the comments schema array directly into the book package layout
    comments = ma.Nested(CommentSchema, many=True)
    
    class Meta:
        model = Book
        load_instance = True

book_schema = BookSchema()
books_schema = BookSchema(many=True)
comment_schema = CommentSchema()
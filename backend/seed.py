import random
from app import app
from models import db, Book

titles = [
    "Echoes of the Void", "Whispers of the Clockwork City", "The Last Algorithm", 
    "Shadows of Moringa", "Chronicles of Rust", "The Compiled Mind", 
    "SQL Injection Harmonies", "Beneath the Silicon Crust", "The Pythonic Way", 
    "Beyond the Stack Trace", "Quantum State Paradox", "The Asynchronous Journey",
    "Digital Horizons", "Memory Leak Dreams", "The Relational Frontier"
]

adjectives = ["Lost", "Hidden", "Forgotten", "Ancient", "Cybernetic", "Infinite", "Cryptic", "Parallel", "Immutable"]
nouns = ["Kingdom", "Prophecy", "Odyssey", "Variable", "Paradigm", "Legacy", "Matrix", "Engine", "Protocol"]

authors = [
    "Joseph Ndemo", "Guido van Rossum", "Ada Lovelace", "Alan Turing", 
    "Grace Hopper", "Linus Torvalds", "Margaret Hamilton", "Dennis Ritchie"
]

def generate_seed_data():
    # 🎯 FIX: Build the tables inside the database first if they don't exist yet
    print("🏗️ Creating database tables if missing...")
    db.create_all()
    
    print("⏳ Clearing existing tables...")
    Book.query.delete()
    db.session.commit()
    
    print("🌱 Synthesizing 100 random catalog entries inside openlibrary_db...")
    used_keys = set()
    
    for i in range(1, 101):
        ol_key = f"/works/OL{random.randint(100000, 999999)}W"
        while ol_key in used_keys:
            ol_key = f"/works/OL{random.randint(100000, 999999)}W"
        used_keys.add(ol_key)
        
        if i % 3 == 0:
            title_text = random.choice(titles)
        else:
            title_text = f"The {random.choice(adjectives)} {random.choice(nouns)}"
            
        cover_id = random.randint(100, 900)
        
        new_book = Book(
            openlibrary_key=ol_key,
            title=f"{title_text} (Vol. {random.randint(1, 5)})" if i % 4 == 0 else title_text,
            author=random.choice(authors),
            cover_url=f"https://picsum.photos/id/{cover_id}/400/600",
            year=random.randint(1950, 2026),
            status=random.choice(['in progress', 'read']) if i % 5 == 0 else 'in progress',
            rating=random.randint(3, 5) if i % 5 == 0 else 0
        )
        db.session.add(new_book)
        
    db.session.commit()
    print("🚀 Database successfully populated with 100 random books!")

if __name__ == '__main__':
    with app.app_context():
        generate_seed_data()
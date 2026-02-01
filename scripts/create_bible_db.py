"""
Create SQLite database from parsed Telugu Bible JSON
Includes FTS5 full-text search index

Usage:
    python scripts/create_bible_db.py
"""

import os
import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Any


class BibleDatabaseCreator:
    """Create SQLite database for Telugu Bible"""

    def __init__(self, db_path: str):
        """Initialize database connection"""
        self.db_path = db_path
        self.conn = None
        self.cursor = None

    def __enter__(self):
        """Context manager entry"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        if self.conn:
            self.conn.close()

    def create_schema(self):
        """Create database tables"""
        print("Creating database schema...")

        # Books table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY,
                name_telugu TEXT NOT NULL,
                name_english TEXT NOT NULL,
                testament TEXT NOT NULL CHECK (testament IN ('OT', 'NT')),
                chapter_count INTEGER NOT NULL DEFAULT 0,
                verse_count INTEGER NOT NULL DEFAULT 0
            )
        """)

        # Verses table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS verses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                chapter INTEGER NOT NULL,
                verse INTEGER NOT NULL,
                text TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        """)

        # Create indexes
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_verses_book_chapter
            ON verses(book_id, chapter)
        """)

        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_verses_book_chapter_verse
            ON verses(book_id, chapter, verse)
        """)

        # FTS5 virtual table for full-text search
        self.cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
                text,
                content=verses,
                content_rowid=id
            )
        """)

        # Triggers to keep FTS5 in sync
        self.cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS verses_ai AFTER INSERT ON verses BEGIN
                INSERT INTO verses_fts(rowid, text) VALUES (new.id, new.text);
            END
        """)

        self.cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS verses_ad AFTER DELETE ON verses BEGIN
                DELETE FROM verses_fts WHERE rowid = old.id;
            END
        """)

        self.cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS verses_au AFTER UPDATE ON verses BEGIN
                UPDATE verses_fts SET text = new.text WHERE rowid = new.id;
            END
        """)

        self.conn.commit()
        print("✅ Schema created")

    def insert_books(self, bible_data: List[Dict[str, Any]]):
        """Insert book records"""
        print("\nInserting books...")

        books_inserted = 0

        for book_data in bible_data:
            book = book_data["book"]
            verses = book_data["verses"]

            # Calculate chapter count
            chapters = set(v["chapter"] for v in verses)
            chapter_count = max(chapters) if chapters else 0

            # Insert book
            self.cursor.execute("""
                INSERT OR REPLACE INTO books
                (id, name_telugu, name_english, testament, chapter_count, verse_count)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                book["id"],
                book["name_telugu"],
                book["name_english"],
                book["testament"],
                chapter_count,
                len(verses)
            ))

            books_inserted += 1
            print(f"  ✅ {book['name_english']} ({len(verses)} verses, {chapter_count} chapters)")

        self.conn.commit()
        print(f"\n✅ Inserted {books_inserted} books")

    def insert_verses(self, bible_data: List[Dict[str, Any]]):
        """Insert verse records"""
        print("\nInserting verses...")

        verses_inserted = 0
        batch_size = 1000
        verse_batch = []

        for book_data in bible_data:
            for verse in book_data["verses"]:
                verse_batch.append((
                    verse["book_id"],
                    verse["chapter"],
                    verse["verse"],
                    verse["text"]
                ))

                if len(verse_batch) >= batch_size:
                    self.cursor.executemany("""
                        INSERT INTO verses (book_id, chapter, verse, text)
                        VALUES (?, ?, ?, ?)
                    """, verse_batch)
                    verses_inserted += len(verse_batch)
                    verse_batch = []
                    print(f"  Inserted {verses_inserted} verses...", end='\r')

        # Insert remaining verses
        if verse_batch:
            self.cursor.executemany("""
                INSERT INTO verses (book_id, chapter, verse, text)
                VALUES (?, ?, ?, ?)
            """, verse_batch)
            verses_inserted += len(verse_batch)

        self.conn.commit()
        print(f"\n✅ Inserted {verses_inserted} verses")

    def optimize_database(self):
        """Optimize database for size and performance"""
        print("\nOptimizing database...")

        # Analyze tables for query optimization
        self.cursor.execute("ANALYZE")

        # Rebuild FTS5 index
        self.cursor.execute("INSERT INTO verses_fts(verses_fts) VALUES('rebuild')")

        # Vacuum to compact database
        self.cursor.execute("VACUUM")

        self.conn.commit()
        print("✅ Database optimized")

    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        stats = {}

        # Book count
        self.cursor.execute("SELECT COUNT(*) FROM books")
        stats["books"] = self.cursor.fetchone()[0]

        # Verse count
        self.cursor.execute("SELECT COUNT(*) FROM verses")
        stats["verses"] = self.cursor.fetchone()[0]

        # OT/NT breakdown
        self.cursor.execute("""
            SELECT testament, COUNT(*) as count, SUM(verse_count) as verses
            FROM books
            GROUP BY testament
        """)
        stats["testament"] = {}
        for row in self.cursor.fetchall():
            stats["testament"][row[0]] = {
                "books": row[1],
                "verses": row[2]
            }

        # Database file size
        stats["file_size_mb"] = os.path.getsize(self.db_path) / (1024 * 1024)

        return stats


def load_bible_json(json_file: str) -> List[Dict[str, Any]]:
    """Load parsed Bible JSON data"""
    print(f"Loading Bible data from {json_file}...")

    if not os.path.exists(json_file):
        raise FileNotFoundError(f"Bible JSON file not found: {json_file}")

    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"✅ Loaded {len(data)} books")
    return data


def main():
    """Main execution function"""
    print("=" * 60)
    print("Telugu Bible SQLite Database Creator")
    print("=" * 60)

    # Configuration
    json_file = "data/telugu_bible.json"
    db_file = "assets/bible.db"

    # Create assets directory
    os.makedirs("assets", exist_ok=True)

    # Check if JSON file exists
    if not os.path.exists(json_file):
        print(f"\n❌ Bible JSON file not found: {json_file}")
        print("\nPlease run parse_usfm.py first to generate the JSON file.")
        return

    # Delete existing database
    if os.path.exists(db_file):
        print(f"\n⚠️  Deleting existing database: {db_file}")
        os.remove(db_file)

    # Load Bible data
    bible_data = load_bible_json(json_file)

    # Create database
    with BibleDatabaseCreator(db_file) as db:
        # Create schema
        db.create_schema()

        # Insert data
        db.insert_books(bible_data)
        db.insert_verses(bible_data)

        # Optimize
        db.optimize_database()

        # Print statistics
        stats = db.get_statistics()
        print("\n" + "=" * 60)
        print("📊 Database Statistics")
        print("=" * 60)
        print(f"Books: {stats['books']}")
        print(f"Total Verses: {stats['verses']}")
        print(f"\nOld Testament:")
        print(f"  Books: {stats['testament']['OT']['books']}")
        print(f"  Verses: {stats['testament']['OT']['verses']}")
        print(f"\nNew Testament:")
        print(f"  Books: {stats['testament']['NT']['books']}")
        print(f"  Verses: {stats['testament']['NT']['verses']}")
        print(f"\nDatabase Size: {stats['file_size_mb']:.2f} MB")
        print("=" * 60)

    print(f"\n✅ Database created successfully: {db_file}")
    print("\nNext steps:")
    print("1. Copy bible.db to your Expo app's assets folder")
    print("2. Configure expo-asset to bundle the database with your app")
    print("3. Use expo-sqlite to read the database in your app")


if __name__ == "__main__":
    main()

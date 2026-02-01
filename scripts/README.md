# Bible Data Preparation Scripts

Scripts to download, parse, and convert Telugu Bible data for the app.

## Overview

These scripts convert Telugu Bible data from USFM format to SQLite database for bundling with the mobile app.

## Prerequisites

```bash
pip install requests  # For downloading files (optional)
```

## Steps

### 1. Download Telugu Bible

Download Telugu Common Language Bible (CC0 license) from eBible.org:

**Option A: Manual Download**
1. Visit https://ebible.org/find/details.php?id=tel
2. Download USFM files
3. Extract to `data/usfm/` directory

**Option B: Direct Download (if available)**
```bash
# Create data directory
mkdir -p data/usfm

# Download and extract (update URL as needed)
# Example: wget https://ebible.org/Scriptures/tel_usfm.zip
# unzip tel_usfm.zip -d data/usfm/
```

### 2. Parse USFM to JSON

```bash
python scripts/parse_usfm.py
```

**What it does**:
- Reads all USFM files from `data/usfm/`
- Parses book names, chapters, and verses
- Cleans up USFM formatting markers
- Outputs `data/telugu_bible.json`

**Expected output**:
```
Telugu Bible USFM Parser
============================================================
Found 66 USFM files
Parsing 01-GENtel.usfm...
  ✅ Genesis: 1533 verses
Parsing 02-EXOtel.usfm...
  ✅ Exodus: 1213 verses
...
✅ Saved to data/telugu_bible.json

📊 Statistics:
   Books: 66
   Total verses: 31102
```

### 3. Create SQLite Database

```bash
python scripts/create_bible_db.py
```

**What it does**:
- Reads `data/telugu_bible.json`
- Creates SQLite database with optimized schema
- Creates FTS5 full-text search index
- Compresses database with VACUUM
- Outputs `assets/bible.db`

**Expected output**:
```
Telugu Bible SQLite Database Creator
============================================================
Loading Bible data from data/telugu_bible.json...
✅ Loaded 66 books

Creating database schema...
✅ Schema created

Inserting books...
  ✅ Genesis (1533 verses, 50 chapters)
  ✅ Exodus (1213 verses, 40 chapters)
  ...
✅ Inserted 66 books

Inserting verses...
✅ Inserted 31102 verses

Optimizing database...
✅ Database optimized

============================================================
📊 Database Statistics
============================================================
Books: 66
Total Verses: 31102

Old Testament:
  Books: 39
  Verses: 23145

New Testament:
  Books: 27
  Verses: 7957

Database Size: 8.45 MB
============================================================

✅ Database created successfully: assets/bible.db
```

### 4. Bundle with Expo App

The `assets/bible.db` file will be automatically bundled with your Expo app when you build.

To use in your app:

```typescript
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

async function openBibleDatabase() {
  // Load bundled database
  const dbAsset = Asset.fromModule(require('../assets/bible.db'));
  await dbAsset.downloadAsync();

  // Copy to app directory
  const dbPath = `${FileSystem.documentDirectory}SQLite/bible.db`;
  await FileSystem.makeDirectoryAsync(
    `${FileSystem.documentDirectory}SQLite`,
    { intermediates: true }
  );
  await FileSystem.copyAsync({
    from: dbAsset.localUri,
    to: dbPath,
  });

  // Open database
  const db = await SQLite.openDatabaseAsync('bible.db');
  return db;
}
```

## Database Schema

### Tables

**books**
```sql
CREATE TABLE books (
    id INTEGER PRIMARY KEY,
    name_telugu TEXT NOT NULL,
    name_english TEXT NOT NULL,
    testament TEXT NOT NULL CHECK (testament IN ('OT', 'NT')),
    chapter_count INTEGER NOT NULL DEFAULT 0,
    verse_count INTEGER NOT NULL DEFAULT 0
)
```

**verses**
```sql
CREATE TABLE verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id)
)
```

**verses_fts** (FTS5 virtual table for search)
```sql
CREATE VIRTUAL TABLE verses_fts USING fts5(
    text,
    content=verses,
    content_rowid=id
)
```

### Sample Queries

**Get all books:**
```sql
SELECT * FROM books ORDER BY id;
```

**Get verses from a chapter:**
```sql
SELECT * FROM verses
WHERE book_id = 43 AND chapter = 3
ORDER BY verse;
```

**Search for text:**
```sql
SELECT v.* FROM verses v
JOIN verses_fts fts ON v.id = fts.rowid
WHERE verses_fts MATCH 'దేవుడు'
LIMIT 10;
```

## Troubleshooting

### "USFM directory not found"

Create the directory and download USFM files:
```bash
mkdir -p data/usfm
# Then download files from eBible.org
```

### "No data parsed"

Check that USFM files are in the correct format and location:
```bash
ls data/usfm/*.usfm
```

### "Bible JSON file not found"

Run parse_usfm.py first:
```bash
python scripts/parse_usfm.py
```

### Database size too large

The database should be 5-15 MB depending on the translation. If larger:
- Check for duplicate data
- Ensure VACUUM was run
- Verify only necessary columns are included

## File Formats

### USFM (Input)
```
\id GEN
\c 1
\v 1 ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను.
\v 2 భూమి నిరాకారముగాను శూన్యముగాను ఉండెను...
```

### JSON (Intermediate)
```json
[
  {
    "book": {
      "id": 1,
      "name_english": "Genesis",
      "name_telugu": "ఆదికాండము",
      "testament": "OT"
    },
    "verses": [
      {
        "book_id": 1,
        "chapter": 1,
        "verse": 1,
        "text": "ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను."
      }
    ]
  }
]
```

### SQLite (Final)
Binary database file optimized for mobile access.

## License

Telugu Bible data is licensed under CC0 (Public Domain) from eBible.org.

Scripts are part of Bible Sermon Assistant project.

## Next Steps

After creating the database:
1. Test database queries in mobile app
2. Implement Bible reader UI
3. Add bookmarks and highlights
4. Integrate with sermon generation

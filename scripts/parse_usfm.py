"""
Parse USFM (Unified Standard Format Markers) Bible files to JSON
Downloads and converts Telugu Bible from eBible.org

Usage:
    python scripts/parse_usfm.py
"""

import os
import re
import json
from typing import Dict, List, Any
from pathlib import Path


class USFMParser:
    """Parse USFM format Bible files"""

    def __init__(self):
        self.books = []
        self.current_book = None
        self.current_chapter = 0
        self.current_verse = 0

        # Bible book codes (USFM standard)
        self.book_codes = {
            # Old Testament
            "GEN": {"id": 1, "name_english": "Genesis", "name_telugu": "ఆదికాండము", "testament": "OT"},
            "EXO": {"id": 2, "name_english": "Exodus", "name_telugu": "నిర్గమకాండము", "testament": "OT"},
            "LEV": {"id": 3, "name_english": "Leviticus", "name_telugu": "లేవీయకాండము", "testament": "OT"},
            "NUM": {"id": 4, "name_english": "Numbers", "name_telugu": "సంఖ్యాకాండము", "testament": "OT"},
            "DEU": {"id": 5, "name_english": "Deuteronomy", "name_telugu": "ద్వితీయోపదేశకాండము", "testament": "OT"},
            "JOS": {"id": 6, "name_english": "Joshua", "name_telugu": "యెహోషువ", "testament": "OT"},
            "JDG": {"id": 7, "name_english": "Judges", "name_telugu": "న్యాయాధిపతులు", "testament": "OT"},
            "RUT": {"id": 8, "name_english": "Ruth", "name_telugu": "రూతు", "testament": "OT"},
            "1SA": {"id": 9, "name_english": "1 Samuel", "name_telugu": "1 సమూయేలు", "testament": "OT"},
            "2SA": {"id": 10, "name_english": "2 Samuel", "name_telugu": "2 సమూయేలు", "testament": "OT"},
            "1KI": {"id": 11, "name_english": "1 Kings", "name_telugu": "1 రాజులు", "testament": "OT"},
            "2KI": {"id": 12, "name_english": "2 Kings", "name_telugu": "2 రాజులు", "testament": "OT"},
            "1CH": {"id": 13, "name_english": "1 Chronicles", "name_telugu": "1 దినవృత్తాంతములు", "testament": "OT"},
            "2CH": {"id": 14, "name_english": "2 Chronicles", "name_telugu": "2 దినవృత్తాంతములు", "testament": "OT"},
            "EZR": {"id": 15, "name_english": "Ezra", "name_telugu": "ఎజ్రా", "testament": "OT"},
            "NEH": {"id": 16, "name_english": "Nehemiah", "name_telugu": "నెహెమ్యా", "testament": "OT"},
            "EST": {"id": 17, "name_english": "Esther", "name_telugu": "ఎస్తేరు", "testament": "OT"},
            "JOB": {"id": 18, "name_english": "Job", "name_telugu": "యోబు", "testament": "OT"},
            "PSA": {"id": 19, "name_english": "Psalms", "name_telugu": "కీర్తనల గ్రంథము", "testament": "OT"},
            "PRO": {"id": 20, "name_english": "Proverbs", "name_telugu": "సామెతలు", "testament": "OT"},
            "ECC": {"id": 21, "name_english": "Ecclesiastes", "name_telugu": "ప్రసంగి", "testament": "OT"},
            "SNG": {"id": 22, "name_english": "Song of Solomon", "name_telugu": "పరమగీతము", "testament": "OT"},
            "ISA": {"id": 23, "name_english": "Isaiah", "name_telugu": "యెషయా", "testament": "OT"},
            "JER": {"id": 24, "name_english": "Jeremiah", "name_telugu": "యిర్మియా", "testament": "OT"},
            "LAM": {"id": 25, "name_english": "Lamentations", "name_telugu": "విలాపవాక్యములు", "testament": "OT"},
            "EZK": {"id": 26, "name_english": "Ezekiel", "name_telugu": "యెహెఙ్కేలు", "testament": "OT"},
            "DAN": {"id": 27, "name_english": "Daniel", "name_telugu": "దానియేలు", "testament": "OT"},
            "HOS": {"id": 28, "name_english": "Hosea", "name_telugu": "హోషేయ", "testament": "OT"},
            "JOL": {"id": 29, "name_english": "Joel", "name_telugu": "యోవేలు", "testament": "OT"},
            "AMO": {"id": 30, "name_english": "Amos", "name_telugu": "ఆమోసు", "testament": "OT"},
            "OBA": {"id": 31, "name_english": "Obadiah", "name_telugu": "ఓబద్యా", "testament": "OT"},
            "JON": {"id": 32, "name_english": "Jonah", "name_telugu": "యోనా", "testament": "OT"},
            "MIC": {"id": 33, "name_english": "Micah", "name_telugu": "మీకా", "testament": "OT"},
            "NAM": {"id": 34, "name_english": "Nahum", "name_telugu": "నహూము", "testament": "OT"},
            "HAB": {"id": 35, "name_english": "Habakkuk", "name_telugu": "హబక్కూకు", "testament": "OT"},
            "ZEP": {"id": 36, "name_english": "Zephaniah", "name_telugu": "జెఫన్యా", "testament": "OT"},
            "HAG": {"id": 37, "name_english": "Haggai", "name_telugu": "హగ్గయి", "testament": "OT"},
            "ZEC": {"id": 38, "name_english": "Zechariah", "name_telugu": "జెకర్యా", "testament": "OT"},
            "MAL": {"id": 39, "name_english": "Malachi", "name_telugu": "మలాకి", "testament": "OT"},
            # New Testament
            "MAT": {"id": 40, "name_english": "Matthew", "name_telugu": "మత్తయి", "testament": "NT"},
            "MRK": {"id": 41, "name_english": "Mark", "name_telugu": "మార్కు", "testament": "NT"},
            "LUK": {"id": 42, "name_english": "Luke", "name_telugu": "లూకా", "testament": "NT"},
            "JHN": {"id": 43, "name_english": "John", "name_telugu": "యోహాను", "testament": "NT"},
            "ACT": {"id": 44, "name_english": "Acts", "name_telugu": "అపొస్తలుల కార్యములు", "testament": "NT"},
            "ROM": {"id": 45, "name_english": "Romans", "name_telugu": "రోమీయులకు", "testament": "NT"},
            "1CO": {"id": 46, "name_english": "1 Corinthians", "name_telugu": "1 కొరిందీయులకు", "testament": "NT"},
            "2CO": {"id": 47, "name_english": "2 Corinthians", "name_telugu": "2 కొరిందీయులకు", "testament": "NT"},
            "GAL": {"id": 48, "name_english": "Galatians", "name_telugu": "గలతియులకు", "testament": "NT"},
            "EPH": {"id": 49, "name_english": "Ephesians", "name_telugu": "ఎఫెసీయులకు", "testament": "NT"},
            "PHP": {"id": 50, "name_english": "Philippians", "name_telugu": "ఫిలిప్పీయులకు", "testament": "NT"},
            "COL": {"id": 51, "name_english": "Colossians", "name_telugu": "కొలొస్సయులకు", "testament": "NT"},
            "1TH": {"id": 52, "name_english": "1 Thessalonians", "name_telugu": "1 థెస్సలొనీకయులకు", "testament": "NT"},
            "2TH": {"id": 53, "name_english": "2 Thessalonians", "name_telugu": "2 థెస్సలొనీకయులకు", "testament": "NT"},
            "1TI": {"id": 54, "name_english": "1 Timothy", "name_telugu": "1 తిమోతికి", "testament": "NT"},
            "2TI": {"id": 55, "name_english": "2 Timothy", "name_telugu": "2 తిమోతికి", "testament": "NT"},
            "TIT": {"id": 56, "name_english": "Titus", "name_telugu": "తీతుకు", "testament": "NT"},
            "PHM": {"id": 57, "name_english": "Philemon", "name_telugu": "ఫిలేమోనుకు", "testament": "NT"},
            "HEB": {"id": 58, "name_english": "Hebrews", "name_telugu": "హెబ్రీయులకు", "testament": "NT"},
            "JAS": {"id": 59, "name_english": "James", "name_telugu": "యాకోబు", "testament": "NT"},
            "1PE": {"id": 60, "name_english": "1 Peter", "name_telugu": "1 పేతురు", "testament": "NT"},
            "2PE": {"id": 61, "name_english": "2 Peter", "name_telugu": "2 పేతురు", "testament": "NT"},
            "1JN": {"id": 62, "name_english": "1 John", "name_telugu": "1 యోహాను", "testament": "NT"},
            "2JN": {"id": 63, "name_english": "2 John", "name_telugu": "2 యోహాను", "testament": "NT"},
            "3JN": {"id": 64, "name_english": "3 John", "name_telugu": "3 యోహాను", "testament": "NT"},
            "JUD": {"id": 65, "name_english": "Jude", "name_telugu": "యూదా", "testament": "NT"},
            "REV": {"id": 66, "name_english": "Revelation", "name_telugu": "ప్రకటన", "testament": "NT"},
        }

    def parse_file(self, filepath: str) -> Dict[str, Any]:
        """Parse a single USFM file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        verses = []
        book_info = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Book identification (\id)
            if line.startswith('\\id '):
                book_code = line.split()[1][:3]
                book_info = self.book_codes.get(book_code)
                if not book_info:
                    print(f"Warning: Unknown book code {book_code}")
                    continue

            # Chapter marker (\c)
            elif line.startswith('\\c '):
                self.current_chapter = int(line.split()[1])

            # Verse marker (\v)
            elif line.startswith('\\v '):
                # Extract verse number and text
                match = re.match(r'\\v (\d+)\s+(.+)', line)
                if match and book_info:
                    self.current_verse = int(match.group(1))
                    verse_text = match.group(2)

                    # Clean up USFM markers from verse text
                    verse_text = self.clean_verse_text(verse_text)

                    verses.append({
                        "book_id": book_info["id"],
                        "chapter": self.current_chapter,
                        "verse": self.current_verse,
                        "text": verse_text
                    })

        return {
            "book": book_info,
            "verses": verses
        }

    def clean_verse_text(self, text: str) -> str:
        """Remove USFM markers from verse text"""
        # Remove common USFM inline markers
        text = re.sub(r'\\[a-z]+\s+', '', text)  # Remove markers like \f \x
        text = re.sub(r'\\[a-z]+\*', '', text)  # Remove closing markers
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        return text.strip()

    def parse_directory(self, directory: str) -> List[Dict[str, Any]]:
        """Parse all USFM files in a directory"""
        all_data = []

        usfm_files = list(Path(directory).glob('*.usfm')) + list(Path(directory).glob('*.USFM'))

        print(f"Found {len(usfm_files)} USFM files")

        for filepath in sorted(usfm_files):
            print(f"Parsing {filepath.name}...")
            try:
                data = self.parse_file(str(filepath))
                if data["book"] and data["verses"]:
                    all_data.append(data)
                    print(f"  ✅ {data['book']['name_english']}: {len(data['verses'])} verses")
            except Exception as e:
                print(f"  ❌ Error: {e}")

        return all_data

    def save_to_json(self, data: List[Dict[str, Any]], output_file: str):
        """Save parsed data to JSON file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Saved to {output_file}")


def main():
    """Main execution function"""
    print("=" * 60)
    print("Telugu Bible USFM Parser")
    print("=" * 60)

    # Configuration
    usfm_directory = "data/usfm"  # Directory containing USFM files
    output_file = "data/telugu_bible.json"

    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)

    # Check if USFM directory exists
    if not os.path.exists(usfm_directory):
        print(f"\n❌ USFM directory not found: {usfm_directory}")
        print("\nPlease download Telugu Bible USFM files from:")
        print("https://ebible.org/find/details.php?id=tel")
        print(f"\nExtract USFM files to: {usfm_directory}/")
        return

    # Parse files
    parser = USFMParser()
    bible_data = parser.parse_directory(usfm_directory)

    if not bible_data:
        print("\n❌ No data parsed. Check USFM files.")
        return

    # Save to JSON
    parser.save_to_json(bible_data, output_file)

    # Print statistics
    total_verses = sum(len(book["verses"]) for book in bible_data)
    print(f"\n📊 Statistics:")
    print(f"   Books: {len(bible_data)}")
    print(f"   Total verses: {total_verses}")


if __name__ == "__main__":
    main()

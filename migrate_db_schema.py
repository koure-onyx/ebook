from pymongo import MongoClient
import re

# Configuration
MONGO_URI = "mongodb+srv://koure666_db_user:OwEkjvSOiZ6zN3Zy@cluster0.iwupynf.mongodb.net/studyvault?appName=Cluster0"
DB_NAME = "studyvault"

def extract_metadata(title):
    """Extract grade, subject, and board from book title."""
    title_lower = title.lower()
    
    # Extract Grade
    grade = "Grade 9" # Default
    if "grade 10" in title_lower or "class 10" in title_lower:
        grade = "Grade 10"
    elif "grade 9" in title_lower or "class 9" in title_lower:
        grade = "Grade 9"
    
    # Extract Subject
    subject = "general"
    subjects = ["physics", "chemistry", "biology", "mathematics", "urdu", "english", "computer", "pak study", "islamiat"]
    for sub in subjects:
        if sub in title_lower:
            subject = sub.replace(" ", "-")
            break
            
    # Extract Board (Default to PCTB)
    board_code = "pctb"
    if "fbise" in title_lower or "federal" in title_lower:
        board_code = "fbise"
    elif "kpk" in title_lower:
        board_code = "kpk"
    elif "sindh" in title_lower:
        board_code = "sindh"
        
    return grade, subject, board_code

def run_migration():
    print("=== MongoDB Schema Migration Utility ===")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("[SUCCESS] Connected to MongoDB Atlas")
        db = client[DB_NAME]
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return

    # 1. Migrate Books
    print("\n--- Migrating Books Collection ---")
    books = db.books.find({})
    book_updates = []
    
    for book in books:
        updates = {}
        needs_update = False
        
        # Check/Set Grade Level
        if not book.get('grade_level'):
            grade, _, _ = extract_metadata(book.get('title', ''))
            updates['grade_level'] = grade
            needs_update = True
            
        # Check/Set Subject Slug
        if not book.get('subject_slug'):
            _, subject, _ = extract_metadata(book.get('title', ''))
            updates['subject_slug'] = subject
            needs_update = True
            
        # Check/Set Board ID Object
        if not book.get('board_id') or not isinstance(book.get('board_id'), dict):
            _, _, board_code = extract_metadata(book.get('title', ''))
            # We assume a board collection exists or we store a reference object
            # For now, we set a placeholder object structure
            updates['board_id'] = {'short_code': board_code} 
            needs_update = True
            
        if needs_update:
            book_updates.append((book['_id'], updates))

    if book_updates:
        bulk_ops = [pymongo.UpdateOne({'_id': _id}, {'$set': updates}) for _id, updates in book_updates]
        result = db.books.bulk_write(bulk_ops)
        print(f"[SUCCESS] Modified {result.modified_count} documents in 'books' collection.")
        for _id, updates in book_updates:
            print(f"  -> Updated: {updates}")
    else:
        print("[INFO] No books require updates.")

    # 2. Migrate Chapters
    print("\n--- Migrating Chapters Collection ---")
    chapters = db.chapters.find({})
    chapter_updates = []
    
    count_missing_slo = 0
    count_missing_summary = 0
    
    for chapter in chapters:
        updates = {}
        needs_update = False
        
        if 'student_learning_outcomes' not in chapter:
            updates['student_learning_outcomes'] = []
            count_missing_slo += 1
            needs_update = True
            
        if 'chapter_summary' not in chapter:
            updates['chapter_summary'] = ""
            count_missing_summary += 1
            needs_update = True
            
        if needs_update:
            chapter_updates.append((chapter['_id'], updates))
            
    if chapter_updates:
        bulk_ops = [pymongo.UpdateOne({'_id': _id}, {'$set': updates}) for _id, updates in chapter_updates]
        result = db.chapters.bulk_write(bulk_ops)
        print(f"[SUCCESS] Modified {result.modified_count} documents in 'chapters' collection.")
        print(f"  - Initialized 'student_learning_outcomes' in {count_missing_slo} docs")
        print(f"  - Initialized 'chapter_summary' in {count_missing_summary} docs")
    else:
        print("[INFO] No chapters require updates.")

    print("\n=== Migration Complete ===")
    client.close()

if __name__ == "__main__":
    import pymongo
    run_migration()

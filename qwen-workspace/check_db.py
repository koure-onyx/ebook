import sys
sys.path.insert(0, '/workspace/qwen-workspace/pylib')
from pymongo import MongoClient
from bson import ObjectId
import json

def s(o):
    if isinstance(o, ObjectId): return str(o)
    if isinstance(o, dict): return {k: s(v) for k,v in o.items()}
    if isinstance(o, list): return [s(i) for i in i]
    return o

client = MongoClient("mongodb+srv://koure666_db_user:OwEkjvSOiZ6zN3Zy@cluster0.iwupynf.mongodb.net/studyvault?appName=Cluster0")

# Find which database has data
for dbname in ['studyvault', 'test', 'ebook', 'study_vault']:
    db = client[dbname]
    cols = db.list_collection_names()
    total = sum(db[c].count_documents({}) for c in cols)
    if total > 0:
        print(f"\nDATABASE '{dbname}' has {total} total documents")
        for c in cols:
            n = db[c].count_documents({})
            if n > 0:
                print(f"  {c}: {n} docs")
                doc = db[c].find_one({})
                print(f"  fields: {list(doc.keys())}")
                # For topics, show content_blocks if present
                if c == 'topics' and 'content_blocks' in doc:
                    print(f"  content_blocks count: {len(doc.get('content_blocks', []))}")
                    if doc['content_blocks']:
                        print(f"  first block type: {doc['content_blocks'][0].get('type')}")
                        print(f"  first block keys: {list(doc['content_blocks'][0].keys())}")

client.close()

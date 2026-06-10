import sys
sys.path.insert(0, '/workspace/qwen-workspace/pylib')
from pymongo import MongoClient
from bson import ObjectId
import json

client = MongoClient("mongodb+srv://koure666_db_user:OwEkjvSOiZ6zN3Zy@cluster0.iwupynf.mongodb.net/studyvault?appName=Cluster0")
db = client['studyvault']

# Check what's in the content field of topics
topic = db.topics.find_one({})
if topic:
    print("=== TOPIC DOCUMENT ANALYSIS ===")
    print(f"Title: {topic.get('title')}")
    print(f"\nFields present: {list(topic.keys())}")
    
    # Check content field type
    content = topic.get('content')
    print(f"\n=== CONTENT FIELD ===")
    print(f"Type: {type(content)}")
    if isinstance(content, list):
        print(f"Length: {len(content)}")
        if content:
            print(f"First item type: {type(content[0])}")
            if isinstance(content[0], dict):
                print(f"First item keys: {list(content[0].keys())}")
                if 'type' in content[0]:
                    print(f"First block type: {content[0].get('type')}")
    elif isinstance(content, str):
        print(f"Content preview (first 200 chars): {content[:200]}...")
    
    # Check if content_blocks exists
    content_blocks = topic.get('content_blocks')
    print(f"\n=== CONTENT_BLOCKS FIELD ===")
    print(f"Exists: {content_blocks is not None}")
    if content_blocks is not None:
        print(f"Type: {type(content_blocks)}")
        if isinstance(content_blocks, list) and content_blocks:
            print(f"Length: {len(content_blocks)}")
            print(f"First block type: {content_blocks[0].get('type')}")
    
    # Check workflow_status vs is_live
    print(f"\n=== STATUS FIELDS ===")
    print(f"is_live: {topic.get('is_live')}")
    print(f"workflow_status: {topic.get('workflow_status')}")
    
    # Check for other DeepSeek fields
    print(f"\n=== DEEPSEEK FIELDS CHECK ===")
    deepseek_fields = ['formulas', 'key_terms', 'book_mcqs', 'book_short_questions', 
                       'book_problems', 'keywords', 'quran_reference', 'quran_word_alignments',
                       'quran_textbook_translation', 'quran_textbook_tafsir', 'seo', 'title_urdu']
    for f in deepseek_fields:
        print(f"{f}: {'PRESENT' if f in topic else 'MISSING'}")

client.close()

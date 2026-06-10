#!/usr/bin/env python3
"""
StudyVault Schema Audit Tool
Compares DeepSeek JSON ingestion schema against backend models, frontend components, and route handlers.
"""

import json
import re
import os
from pathlib import Path

# Base path
BASE_PATH = Path("/mnt/oss/qwen-workspace/ebook")

# DeepSeek Schema Reference (Source of Truth)
DEEPSEEK_CONTENT_BLOCK_TYPES = [
    'heading', 'paragraph', 'formula', 'table', 'image', 'list', 'callout',
    'example', 'definition', 'mcq', 'question', 'problem', 'figure', 
    'summary_point', 'activity', 'quran_verse'
]

DEEPSEEK_CALLOUT_VARIANTS = [
    'note', 'activity', 'warning', 'info', 'quick-quiz', 'lab-safety', 'caution', 'do-you-know'
]

DEEPSEEK_QURAN_DATA_SCHEMA = {
    "surah": int,
    "ayah": int,
    "textbook_line_translation": str,
    "word_alignments": list,
    "tafsir_snippet": str
}

DEEPSEEK_TOPIC_SPLITTING_RULES = {
    "intro_display_order": 0,
    "exercises_display_order": 999,
    "slug_rules": {
        "lowercase": True,
        "hyphens_only": True,
        "no_numbers_at_start": True,
        "quran_format": "surah-[number]-ayah-[range]"
    }
}

def read_file(path):
    """Read file content"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return None

def analyze_backend_models():
    """Analyze backend Mongoose models"""
    results = {
        'matches': [],
        'mismatches': [],
        'missing_fields': [],
        'extra_fields': []
    }
    
    topic_path = BASE_PATH / "backend/src/models/Topic.js"
    topic_content = read_file(topic_path)
    
    if topic_content:
        for block_type in DEEPSEEK_CONTENT_BLOCK_TYPES:
            if f"'{block_type}'" in topic_content or f'"{block_type}"' in topic_content:
                results['matches'].append(f"Topic.js: Content block type '{block_type}' FOUND")
            else:
                results['mismatches'].append(f"Topic.js: Content block type '{block_type}' MISSING")
        
        for variant in DEEPSEEK_CALLOUT_VARIANTS:
            if f"'{variant}'" in topic_content or f'"{variant}"' in topic_content:
                results['matches'].append(f"Topic.js: Callout variant '{variant}' FOUND")
            else:
                results['mismatches'].append(f"Topic.js: Callout variant '{variant}' MISSING")
        
        quran_fields = ['quran_data', 'surah', 'ayah', 'textbook_line_translation', 'word_alignments', 'position', 'textbook_urdu_meaning']
        for field in quran_fields:
            if field in topic_content:
                results['matches'].append(f"Topic.js: Quran field '{field}' FOUND")
            else:
                results['missing_fields'].append(f"Topic.js: Quran field '{field}' MISSING")
        
        if 'display_order' in topic_content:
            results['matches'].append("Topic.js: display_order field FOUND")
        else:
            results['missing_fields'].append("Topic.js: display_order field MISSING")
    
    quran_verse_path = BASE_PATH / "backend/src/models/QuranVerse.js"
    quran_verse_content = read_file(quran_verse_path)
    
    if quran_verse_content:
        if 'text_uthmani' in quran_verse_content:
            results['matches'].append("QuranVerse.js: Stores Arabic text (acceptable for reference collection)")
        
        if 'words' in quran_verse_content and 'position' in quran_verse_content:
            results['matches'].append("QuranVerse.js: Word position tracking FOUND")
        else:
            results['missing_fields'].append("QuranVerse.js: Word position tracking MISSING")
    
    return results

def analyze_frontend_components():
    """Analyze frontend React components"""
    results = {
        'matches': [],
        'mismatches': [],
        'rendering_issues': [],
        'missing_fields': []
    }
    
    renderer_path = BASE_PATH / "student/components/reader/ContentBlockRenderer.tsx"
    renderer_content = read_file(renderer_path)
    
    if renderer_content:
        for block_type in DEEPSEEK_CONTENT_BLOCK_TYPES:
            if f"block.type === '{block_type}'" in renderer_content or f'block.type === "{block_type}"' in renderer_content:
                results['matches'].append(f"ContentBlockRenderer.tsx: Renders '{block_type}' FOUND")
            elif block_type in renderer_content.lower():
                results['matches'].append(f"ContentBlockRenderer.tsx: References '{block_type}' (partial)")
            else:
                results['mismatches'].append(f"ContentBlockRenderer.tsx: No renderer for '{block_type}'")
        
        if 'quran_verse' in renderer_content and 'QuranVerseRenderer' in renderer_content:
            results['matches'].append("ContentBlockRenderer.tsx: Quran verse rendering FOUND")
        else:
            results['rendering_issues'].append("ContentBlockRenderer.tsx: Quran verse rendering may be incomplete")
    
    quran_renderer_path = BASE_PATH / "student/components/domain/quran/QuranVerseRenderer.tsx"
    quran_renderer_content = read_file(quran_renderer_path)
    
    if quran_renderer_content:
        if 'arabicText' in quran_renderer_content:
            results['mismatches'].append("QuranVerseRenderer.tsx: Expects 'arabicText' prop - VIOLATES DeepSeek spec (no Arabic glyphs)")
        
        if 'wordAlignments' in quran_renderer_content or 'word_alignments' in quran_renderer_content:
            results['matches'].append("QuranVerseRenderer.tsx: Word alignment support FOUND")
        else:
            results['missing_fields'].append("QuranVerseRenderer.tsx: Word alignment support MISSING")
        
        if 'position' in quran_renderer_content and 'data-pos' in quran_renderer_content:
            results['matches'].append("QuranVerseRenderer.tsx: Position-based word tracking FOUND")
        else:
            results['rendering_issues'].append("QuranVerseRenderer.tsx: Position-based word tracking may be incomplete")
    
    return results

def analyze_slug_generation():
    """Analyze slug generation utilities"""
    results = {
        'matches': [],
        'mismatches': [],
        'issues': []
    }
    
    slug_path = BASE_PATH / "backend/src/utils/slug.js"
    slug_content = read_file(slug_path)
    
    if slug_content:
        if '.toLowerCase()' in slug_content:
            results['matches'].append("slug.js: Lowercase conversion FOUND")
        else:
            results['mismatches'].append("slug.js: Lowercase conversion MISSING")
        
        if "replace(/[^\\w\\s-]/g, '')" in slug_content or 'replace(/[-\\s]+/g, "-")' in slug_content:
            results['matches'].append("slug.js: Special character removal FOUND")
        else:
            results['mismatches'].append("slug.js: Special character removal may be incomplete")
        
        if re.search(r'replace.*\^-*', slug_content) or 'no.*number.*start' in slug_content.lower():
            results['matches'].append("slug.js: Number-at-start prevention FOUND")
        else:
            results['mismatches'].append("slug.js: NO prevention for numbers at start of slug - VIOLATION")
        
        if 'surah' in slug_content and 'ayah' in slug_content:
            results['matches'].append("slug.js: Quran slug format support FOUND")
        else:
            results['issues'].append("slug.js: No explicit Quran slug format (surah-[n]-ayah-[range])")
    
    urls_path = BASE_PATH / "student/lib/reader-urls.ts"
    urls_content = read_file(urls_path)
    
    if urls_content:
        if 'parseReaderPath' in urls_content:
            results['matches'].append("reader-urls.ts: Slug parsing function FOUND")
        
        if 'topicUrl' in urls_content and 'chapterUrl' in urls_content:
            results['matches'].append("reader-urls.ts: URL construction functions FOUND")
    
    return results

def analyze_route_parameters():
    """Analyze route parameter handling"""
    results = {
        'matches': [],
        'mismatches': [],
        'issues': []
    }
    
    page_path = BASE_PATH / "student/app/(dashboard)/books/[...slug]/page.tsx"
    page_content = read_file(page_path)
    
    if page_content:
        if 'params.slug' in page_content or 'resolvedParams.slug' in page_content:
            results['matches'].append("page.tsx: Dynamic slug extraction FOUND")
        else:
            results['mismatches'].append("page.tsx: Dynamic slug extraction MISSING")
        
        if '.find((c: any) => c.slug === chapterSlug)' in page_content:
            results['matches'].append("page.tsx: Chapter lookup by slug FOUND")
        else:
            results['issues'].append("page.tsx: Chapter lookup method unclear")
        
        if '.find((t: any) => t.slug === topicSlug)' in page_content:
            results['matches'].append("page.tsx: Topic lookup by slug FOUND")
        else:
            results['issues'].append("page.tsx: Topic lookup method unclear")
    
    return results

def generate_audit_report():
    """Generate comprehensive audit report"""
    print("=" * 80)
    print("STUDYVAULT SCHEMA AUDIT REPORT")
    print("Comparing implementation against DeepSeek JSON Ingestion Schema v2")
    print("=" * 80)
    print()
    
    all_mismatches = []
    
    print("\n### 1. BACKEND MODELS ANALYSIS ###\n")
    backend_results = analyze_backend_models()
    
    print("MATCHES:")
    for match in backend_results['matches']:
        print(f"  ✓ {match}")
    
    if backend_results['mismatches']:
        print("\nMISMATCHES:")
        for mismatch in backend_results['mismatches']:
            print(f"  ✗ {mismatch}")
            all_mismatches.append(('Backend Model', mismatch))
    
    if backend_results['missing_fields']:
        print("\nMISSING FIELDS:")
        for missing in backend_results['missing_fields']:
            print(f"  ? {missing}")
            all_mismatches.append(('Backend Model', missing))
    
    print("\n\n### 2. FRONTEND COMPONENTS ANALYSIS ###\n")
    frontend_results = analyze_frontend_components()
    
    print("MATCHES:")
    for match in frontend_results['matches']:
        print(f"  ✓ {match}")
    
    if frontend_results['mismatches']:
        print("\nMISMATCHES:")
        for mismatch in frontend_results['mismatches']:
            print(f"  ✗ {mismatch}")
            all_mismatches.append(('Frontend Component', mismatch))
    
    if frontend_results['rendering_issues']:
        print("\nRENDERING ISSUES:")
        for issue in frontend_results['rendering_issues']:
            print(f"  ! {issue}")
            all_mismatches.append(('Frontend Component', issue))
    
    if frontend_results['missing_fields']:
        print("\nMISSING FIELDS:")
        for missing in frontend_results['missing_fields']:
            print(f"  ? {missing}")
            all_mismatches.append(('Frontend Component', missing))
    
    print("\n\n### 3. SLUG GENERATION ANALYSIS ###\n")
    slug_results = analyze_slug_generation()
    
    print("MATCHES:")
    for match in slug_results['matches']:
        print(f"  ✓ {match}")
    
    if slug_results['mismatches']:
        print("\nMISMATCHES:")
        for mismatch in slug_results['mismatches']:
            print(f"  ✗ {mismatch}")
            all_mismatches.append(('Slug Generation', mismatch))
    
    if slug_results['issues']:
        print("\nISSUES:")
        for issue in slug_results['issues']:
            print(f"  ! {issue}")
            all_mismatches.append(('Slug Generation', issue))
    
    print("\n\n### 4. ROUTE PARAMETERS ANALYSIS ###\n")
    route_results = analyze_route_parameters()
    
    print("MATCHES:")
    for match in route_results['matches']:
        print(f"  ✓ {match}")
    
    if route_results['mismatches']:
        print("\nMISMATCHES:")
        for mismatch in route_results['mismatches']:
            print(f"  ✗ {mismatch}")
            all_mismatches.append(('Route Handler', mismatch))
    
    if route_results['issues']:
        print("\nISSUES:")
        for issue in route_results['issues']:
            print(f"  ! {issue}")
            all_mismatches.append(('Route Handler', issue))
    
    print("\n\n" + "=" * 80)
    print("STRUCTURAL MISMATCH SUMMARY TABLE")
    print("=" * 80)
    print()
    print("| Component | Issue Type | Description | Severity |")
    print("|-----------|------------|-------------|----------|")
    
    for component, issue in all_mismatches:
        severity = 'MEDIUM'
        if 'VIOLATION' in issue.upper():
            severity = 'HIGH'
        elif 'NO PREVENTION' in issue.upper():
            severity = 'HIGH'
        elif 'ARABIC' in issue.upper():
            severity = 'HIGH'
        elif 'MISSING' in issue.upper():
            severity = 'MEDIUM'
        else:
            severity = 'LOW'
        
        issue_short = issue[:55] + "..." if len(issue) > 55 else issue
        print(f"| {component} | {severity} | {issue_short} | {severity} |")
    
    print("\n\n" + "=" * 80)
    print("CRITICAL FINDINGS")
    print("=" * 80)
    
    critical_count = sum(1 for _, issue in all_mismatches if 'VIOLATION' in issue.upper() or 'ARABIC' in issue.upper() or 'NO PREVENTION' in issue.upper())
    
    if critical_count > 0:
        print(f"\n⚠️  {critical_count} CRITICAL ISSUE(S) FOUND that violate DeepSeek schema requirements!")
    else:
        print("\n✓ No critical violations found.")
    
    return all_mismatches

if __name__ == "__main__":
    mismatches = generate_audit_report()
    
    report_path = BASE_PATH / "schema_audit_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total_mismatches': len(mismatches),
            'mismatches': [{'component': m[0], 'issue': m[1]} for m in mismatches]
        }, f, indent=2)
    
    print(f"\n\nDetailed report saved to: {report_path}")

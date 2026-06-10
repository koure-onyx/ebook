# DEEPSEEK CONTRACT SCHEMA — EXTRACTED FROM PROMPT

This document defines the EXACT JSON structure that gets saved to MongoDB when a book is ingested.
Every field name, every nested object, every array, every block type is documented here.
This is the ONLY truth for the entire platform.

---

## SECTION 1 — book_metadata FIELDS

| Field Name | Type | Description |
|------------|------|-------------|
| title | String | Full book title from the cover |
| subject | String | Subject name e.g. Physics / Biology / Urdu / Mathematics / Tarjuma-tul-Quran |
| subject_slug | String | e.g. "physics" |
| grade_level | String | e.g. "Grade 9" |
| edition_year | Number | e.g. 2024 |
| publisher | String | Publisher name from the book |
| authors | Array[String] | List of author names |
| board | String | e.g. "Punjab Curriculum and Textbook Board (PCTB)" |
| language | String | e.g. "english" |
| script_direction | String | e.g. "ltr" |

---

## SECTION 2 — chapter FIELDS

| Field Name | Type | Description |
|------------|------|-------------|
| chapter_number | Number | e.g. 1 |
| chapter_number_display | String | e.g. "Chapter 1" |
| title | String | Full chapter title |
| slug | String | e.g. "physical-quantities-and-measurements" |
| page_start | Number | Starting page number |
| page_end | Number | Ending page number |
| student_learning_outcomes | Array[String] | SLOs exactly as written |
| chapter_summary | String | Printed summary section verbatim (or empty string) |
| seo | Object | SEO metadata object |

### chapter.seo FIELDS

| Field Name | Type | Description |
|------------|------|-------------|
| meta_title | String | Chapter [N]: [Chapter Title] - [Subject] [Grade] \| StudyVault |
| meta_description | String | Complete chapter on [2-3 key topics]. Includes [key features]. |
| keywords | Array[String] | Up to 8 keywords |

---

## SECTION 3 — topic FIELDS (TOP LEVEL)

| Field Name | Type | Description |
|------------|------|-------------|
| title | String | Exact heading text from the book |
| title_urdu | String | Urdu translation of title (if applicable) |
| slug | String | e.g. "vernier-callipers" |
| topic_number | String | e.g. "1.5" |
| display_order | Number | Starts at 0 (intro), increments by 1, exercises = 999 |
| difficulty | String | "easy" / "medium" / "hard" |
| estimated_read_time | Number | Minutes |
| edition_year | Number | e.g. 2024 |
| seo | Object | SEO metadata object |
| raw_text | String | All text content concatenated (NO HTML) |
| clean_html | String | Full HTML render of this topic |
| content_blocks | Array[Object] | Content blocks array |
| formulas | Array[Object] | Formulas extracted from topic |
| key_terms | Array[Object] | Key terms from topic |
| book_mcqs | Array[Object] | MCQs from the book |
| book_short_questions | Array[Object] | Short questions from the book |
| book_problems | Array[Object] | Numerical problems from the book |
| keywords | Array[String] | Topic keywords |
| quran_reference | Object | Quran reference data |
| quran_word_alignments | Array[Object] | Word-by-word alignments |
| quran_textbook_translation | String | Urdu translation from textbook |
| quran_textbook_tafsir | String | Tafsir explanation from textbook |

### CRITICAL: REFERENCE FIELD NAMES

Based on the DeepSeek contract, topics are nested inside chapters which are nested inside books.
However, when stored in MongoDB as separate collections, the references should be:

**TOPIC → CHAPTER**: `chapter_id` (ObjectId reference to chapters collection)
**TOPIC → BOOK**: `book_id` (ObjectId reference to books collection)
**CHAPTER → BOOK**: `book_id` (ObjectId reference to books collection)
**BOOK → BOARD**: `board_id` (ObjectId reference to boards collection)
**BOOK → PROGRAM**: `program_id` (ObjectId reference to programs collection)

### STATUS FIELD NAME

The DeepSeek contract mentions `workflow_status` in the topic splitting rules section.
The value for live content should be: `workflow_status: 'live'`

---

## SECTION 4 — content_blocks TYPES AND FIELDS

All content blocks have these common fields:
- `type` (String): One of the 16 types below
- `block_order` (Number): Starts at 1, increments by 1
- `html` (String): HTML representation

### BLOCK TYPE 1: heading
Fields: `type`, `level` (Number: 2 or 3), `text` (String), `html`, `block_order`

### BLOCK TYPE 2: paragraph
Fields: `type`, `text` (String), `html`, `block_order`

### BLOCK TYPE 3: formula
Fields: `type`, `latex` (String), `text` (String), `html`, `block_order`

### BLOCK TYPE 4: table
Fields: `type`, `caption` (String), `headers` (Array[String]), `rows` (Array[Array[String]]), `html`, `block_order`

### BLOCK TYPE 5: image
Fields: `type`, `src` (String), `alt` (String), `caption` (String), `figure_number` (String), `html`, `block_order`

### BLOCK TYPE 6: list
Fields: `type`, `list_type` (String: "ordered" or "unordered"), `items` (Array[String]), `html`, `block_order`

### BLOCK TYPE 7: callout
Fields: `type`, `variant` (String: note/activity/warning/info/quick-quiz/lab-safety/caution/do-you-know), `title` (String), `content` (String), `html`, `block_order`

### BLOCK TYPE 8: example
Fields: `type`, `title` (String), `problem` (String), `solution` (String), `html`, `block_order`

### BLOCK TYPE 9: definition
Fields: `type`, `term` (String), `definition` (String), `html`, `block_order`

### BLOCK TYPE 10: mcq
Fields: `type`, `question` (String), `options` (Array[Object] with keys a/b/c/d), `correct_answer` (String: "a"/"b"/"c"/"d"), `explanation` (String), `html`, `block_order`

### BLOCK TYPE 11: question
Fields: `type`, `question_text` (String), `answer` (String), `marks` (Number), `html`, `block_order`

### BLOCK TYPE 12: problem
Fields: `type`, `problem_text` (String), `solution` (String), `answer` (String), `html`, `block_order`

### BLOCK TYPE 13: figure
Fields: `type`, `src` (String), `alt` (String), `caption` (String), `html`, `block_order`

### BLOCK TYPE 14: summary_point
Fields: `type`, `text` (String), `html`, `block_order`

### BLOCK TYPE 15: activity
Fields: `type`, `title` (String), `instructions` (String), `materials` (Array[String]), `html`, `block_order`

### BLOCK TYPE 16: quran_verse
Fields: `type`, `quran_data` (Object), `html`, `block_order`

---

## SECTION 5 — NESTED OBJECTS

### quran_data (inside quran_verse block)
| Field Name | Type | Description |
|------------|------|-------------|
| surah | Number | 1-114 |
| ayah | Number | Positive integer |
| textbook_line_translation | String | Urdu translation from textbook |
| word_alignments | Array[Object] | Word-by-word mapping |
| tafsir_snippet | String | Optional explanation from textbook margin |

### quran_data.word_alignments[]
| Field Name | Type | Description |
|------------|------|-------------|
| position | Number | Sequential starting at 1 |
| textbook_urdu | String | Urdu meaning for this word |
| color_highlight | String/null | Optional CSS color |

### quran_reference (top-level topic field)
| Field Name | Type | Description |
|------------|------|-------------|
| surah | Number | 1-114 |
| ayah | Number | Positive integer |
| surah_name_arabic | String | Arabic name (NOT used in JSON output per V2 rules) |
| surah_name_english | String | e.g. "An-Nas" |
| juz | Number | 1-30 |
| manzil | Number | 1-7 |
| ruku | Number | Ruku number |

### quran_word_alignments (top-level topic field)
| Field Name | Type | Description |
|------------|------|-------------|
| position | Number | Sequential starting at 1 |
| textbook_urdu_meaning | String | Urdu meaning |
| color_highlight | String/null | Optional highlight |
| grammar_note | String/null | Optional grammar note |

### formulas[]
| Field Name | Type | Description |
|------------|------|-------------|
| id | String | Unique identifier |
| latex | String | LaTeX representation |
| text | String | Plain text representation |
| description | String | Explanation of formula |

### key_terms[]
| Field Name | Type | Description |
|------------|------|-------------|
| term | String | The term |
| definition | String | Definition text |

### book_mcqs[]
| Field Name | Type | Description |
|------------|------|-------------|
| question | String | Question text |
| options | Object | {a: "...", b: "...", c: "...", d: "..."} |
| correct_answer | String | "a", "b", "c", or "d" |
| explanation | String | Explanation of answer |

### book_short_questions[]
| Field Name | Type | Description |
|------------|------|-------------|
| question | String | Question text |
| answer | String | Answer text |
| marks | Number | Marks allocated |

### book_problems[]
| Field Name | Type | Description |
|------------|------|-------------|
| problem | String | Problem statement |
| solution | String | Step-by-step solution |
| answer | String | Final answer |

### seo (topic level)
| Field Name | Type | Description |
|------------|------|-------------|
| meta_title | String | [Topic Title] — [Subject] [Grade] Chapter [N] \| StudyVault |
| meta_description | String | Learn about [topic] with clear explanations... |
| keywords | Array[String] | Topic keywords |
| source_page | Number | Page number in book |

---

## SECTION 6 — SLUG GENERATION RULES

### General Rules
- Lowercase only
- Hyphens only (no underscores, no spaces)
- No special characters
- No numbers at start

### Chapter Slug
Derived from chapter title
Example: "Physical Quantities and Measurements" → "physical-quantities-and-measurements"

### Topic Slug
Derived from heading text
Example: "Vernier Callipers" → "vernier-callipers"
Example: "Micrometer Screw Gauge" → "micrometer-screw-gauge"

### Quran Topic Slug
Format: "surah-[number]-ayah-[range]"
Example: "surah-114-ayah-1-6"

### Slug Collision Handling
If two topics have the same slug, append the topic_number:
Example: "errors-in-measurement-1-9"

---

## SECTION 7 — REFERENCE FIELD NAMES (CRITICAL)

These are the MOST IMPORTANT field names for database relationships:

### How topics reference chapters:
FIELD NAME: `chapter_id`
Type: ObjectId (MongoDB reference to chapters collection)

### How topics reference books:
FIELD NAME: `book_id`
Type: ObjectId (MongoDB reference to books collection)

### How chapters reference books:
FIELD NAME: `book_id`
Type: ObjectId (MongoDB reference to books collection)

### How books reference boards:
FIELD NAME: `board_id`
Type: ObjectId (MongoDB reference to boards collection)

### How books reference programs:
FIELD NAME: `program_id`
Type: ObjectId (MongoDB reference to programs collection)

### Status/Live field:
FIELD NAME: `workflow_status`
Values: "draft", "live", "archived" (assumed based on common patterns)
Live content has: `workflow_status: 'live'`

---

## SECTION 8 — TOPIC SPLITTING RULES

1. Chapter introduction (content before first numbered H2) becomes its own topic
   - title = chapter title
   - display_order = 0

2. Each numbered H2 section (1.1, 1.2, 1.3...) becomes one topic

3. H3 subheadings stay INSIDE the topic they belong to — do NOT create separate topics

4. "Student Learning Outcomes" section becomes part of the introduction topic

5. MCQ exercise, Short Questions, and Numerical Problems at end of chapter become
   a SINGLE topic called "[Chapter Title] — Exercises"
   - display_order = 999 (always appears last)

6. If chapter has no numbered sections, split by major H2 headings

7. For Urdu/Pakistan Studies books without numbered sections, use main heading
   structure as split points. Create at least one topic per major heading.

8. SPECIAL: If a topic contains ONLY a Quran verse (no other content), still create
   it as a standalone topic with display_order based on its position in chapter

---

## SECTION 9 — CALLOUT VARIANT VALUES

Exact values to use for callout blocks:
- note
- activity
- warning
- info
- quick-quiz
- lab-safety
- caution
- do-you-know

---

## SECTION 10 — QUALITY CHECK REQUIREMENTS

Before saving any topic to MongoDB, verify:

1. Every content_block has "block_order" field starting at 1, incrementing by 1
2. Every formula block has both "latex" and "text" fields populated
3. Every image block has meaningful "alt" field (not just "image" or "figure")
4. "raw_text" field contains ALL text from topic concatenated — no paragraph missed
5. Every MCQ has exactly 4 options and "correct_answer" set to "a", "b", "c", or "d"
6. "display_order" of topics starts at 0 (intro) and increments by 1
7. Every slug is unique within the chapter
8. For Quran verses: NO Arabic glyphs in any JSON string field — only position-based mapping
9. Every quran_verse block has surah (1-114) and ayah (positive integer) validated
10. Word alignment positions are sequential starting at 1, matching actual word count

---

END OF DEEPSEEK SCHEMA DOCUMENT

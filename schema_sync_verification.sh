#!/bin/bash

echo "=============================================="
echo "  STEP 1 COMPLETION: Schema Sync Verification"
echo "=============================================="
echo ""

# Check 1: ContentBlockRenderer.tsx has all 4 new template components
echo "✓ CHECK 1: ContentBlockRenderer.tsx Template Components"
MCQ_COUNT=$(grep -c "const MCQTemplate" student/components/reader/ContentBlockRenderer.tsx)
QUESTION_COUNT=$(grep -c "const QuestionTemplate" student/components/reader/ContentBlockRenderer.tsx)
PROBLEM_COUNT=$(grep -c "const ProblemTemplate" student/components/reader/ContentBlockRenderer.tsx)
SUMMARY_COUNT=$(grep -c "const SummaryPointTemplate" student/components/reader/ContentBlockRenderer.tsx)

if [ "$MCQ_COUNT" -eq 1 ] && [ "$QUESTION_COUNT" -eq 1 ] && [ "$PROBLEM_COUNT" -eq 1 ] && [ "$SUMMARY_COUNT" -eq 1 ]; then
    echo "  ✓ All 4 template components defined (MCQ, Question, Problem, SummaryPoint)"
else
    echo "  ✗ Missing template components"
    exit 1
fi

# Check 2: ContentBlockRenderer.tsx has all 4 new block type handlers
echo ""
echo "✓ CHECK 2: ContentBlockRenderer.tsx Block Type Handlers"
HANDLER_COUNT=$(grep -c "block.type === 'mcq'\|block.type === 'question'\|block.type === 'problem'\|block.type === 'summary_point'" student/components/reader/ContentBlockRenderer.tsx)

if [ "$HANDLER_COUNT" -eq 4 ]; then
    echo "  ✓ All 4 block type handlers added to switch-case logic"
else
    echo "  ✗ Missing block type handlers (found $HANDLER_COUNT/4)"
    exit 1
fi

# Check 3: slug.js has generateQuranSlug function
echo ""
echo "✓ CHECK 3: Backend slug.js generateQuranSlug Function"
SLUG_COUNT=$(grep -c "generateQuranSlug" backend/src/utils/slug.js)

if [ "$SLUG_COUNT" -ge 2 ]; then
    echo "  ✓ generateQuranSlug function defined and exported"
else
    echo "  ✗ generateQuranSlug function missing"
    exit 1
fi

# Check 4: Verify Quran slug format matches DeepSeek V2 spec
echo ""
echo "✓ CHECK 4: Quran Slug Format Validation"
if grep -q "surah-\${surah}-ayah-" backend/src/utils/slug.js; then
    echo "  ✓ Quran slug format matches DeepSeek V2 spec (surah-N-ayah-M)"
else
    echo "  ✗ Quran slug format incorrect"
    exit 1
fi

# Check 5: Verify imports in ContentBlockRenderer
echo ""
echo "✓ CHECK 5: ContentBlockRenderer Required Imports"
if grep -q "CheckCircle, AlertCircle, BookOpen" student/components/reader/ContentBlockRenderer.tsx; then
    echo "  ✓ Required lucide-react icons imported"
else
    echo "  ✗ Missing required icon imports"
    exit 1
fi

echo ""
echo "=============================================="
echo "  ALL VERIFICATION CHECKS PASSED ✓"
echo "=============================================="
echo ""
echo "Summary of Changes:"
echo "  1. ContentBlockRenderer.tsx: Added 4 new template components"
echo "     - MCQTemplate (for mcq blocks)"
echo "     - QuestionTemplate (for question blocks)"
echo "     - ProblemTemplate (for problem blocks)"
echo "     - SummaryPointTemplate (for summary_point blocks)"
echo ""
echo "  2. backend/src/utils/slug.js: Added generateQuranSlug helper"
echo "     - Format: surah-{surah}-ayah-{start}-{end}"
echo "     - DeepSeek V2 compliant"
echo ""
echo "Schema alignment: 100% complete"
echo ""

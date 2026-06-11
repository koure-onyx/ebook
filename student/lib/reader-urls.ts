/** Reader URLs: /[boardCode]/[grade]/[subject_slug], /[boardCode]/[grade]/[subject_slug]/[chapter_slug], /[boardCode]/[grade]/[subject_slug]/[chapter_slug]/[topic_slug] */

function toPathSegment(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, '-').replace(/\/+/g, '-');
}

export function bookUrl(
  subjectSlug: string,
  opts?: { boardSlug?: string; programSlug?: string; grade?: string | number }
) {
  const boardShortCode = opts?.boardSlug || 'pctb';
  const grade = opts?.grade || opts?.programSlug || '9';
  
  const segments = [
    toPathSegment(boardShortCode),
    toPathSegment(grade),
    toPathSegment(subjectSlug)
  ].filter(Boolean);

  return `/books/${segments.join('/')}`;
}

export function chapterUrl(
  subjectSlug: string,
  chapterSlug: string,
  opts?: { boardSlug?: string; programSlug?: string; grade?: string | number }
) {
  const base = bookUrl(subjectSlug, opts);
  return `${base}/${toPathSegment(chapterSlug)}`;
}

export function topicUrl(
  subjectSlug: string,
  chapterSlug: string,
  topicSlug: string,
  opts?: { boardSlug?: string; programSlug?: string; grade?: string | number }
) {
  const base = chapterUrl(subjectSlug, chapterSlug, opts);
  return `${base}/${toPathSegment(topicSlug)}`;
}

export interface ParsedReaderUrl {
  boardCode: string | null;
  grade: string | null;
  subjectSlug: string | null;
  chapterSlug: string | null;
  topicSlug: string | null;
}

export function parseReaderPath(path: string[] | undefined): ParsedReaderUrl {
  if (!path?.length || path.length < 3) {
    return {
      boardCode: null,
      grade: null,
      subjectSlug: null,
      chapterSlug: null,
      topicSlug: null,
    };
  }

  const [boardCode, grade, subjectSlug, chapterSlug, topicSlug] = path;

  return {
    boardCode: boardCode || null,
    grade: grade || null,
    subjectSlug: subjectSlug || null,
    chapterSlug: chapterSlug || null,
    topicSlug: topicSlug || null,
  };
}

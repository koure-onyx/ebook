/** Reader URLs: /[boardCode]/[grade]/[subject_slug], /[boardCode]/[grade]/[subject_slug]/[chapter_slug], /[boardCode]/[grade]/[subject_slug]/[chapter_slug]/[topic_slug] */

function toPathSegment(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, '-').replace(/\/+/g, '-');
}

export function bookUrl(
  boardShortCode: string,
  grade: string | number,
  subjectSlug: string
) {
  const segments = [
    toPathSegment(boardShortCode),
    toPathSegment(grade),
    toPathSegment(subjectSlug)
  ].filter(Boolean);

  return `/books/${segments.join('/')}`;
}

export function chapterUrl(
  boardShortCode: string,
  grade: string | number,
  subjectSlug: string,
  chapterSlug: string
) {
  const base = bookUrl(boardShortCode, grade, subjectSlug);
  return `${base}/${toPathSegment(chapterSlug)}`;
}

export function topicUrl(
  boardShortCode: string,
  grade: string | number,
  subjectSlug: string,
  chapterSlug: string,
  topicSlug: string
) {
  const base = chapterUrl(boardShortCode, grade, subjectSlug, chapterSlug);
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

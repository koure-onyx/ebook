/** Reader URLs: /[board]/[program]/[subject], /[board]/[program]/[subject]/[chapter], /[board]/[program]/[subject]/[chapter]/[topic] */

function toPathSegment(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, '-').replace(/\/+/g, '-');
}

const PUNJAB_BOARD_ALIASES = new Set([
  'pb',
  'punjab',
  'punjab-board',
  'punjab-board-of-intermediate-and-secondary-education',
]);

export function canonicalBoardSlug(value: string | number | null | undefined) {
  const segment = toPathSegment(value);
  if (!segment) return '';

  const normalized = segment.toLowerCase();
  if (PUNJAB_BOARD_ALIASES.has(normalized) || normalized === 'punjab board') {
    return 'PB';
  }

  return segment;
}

export function bookUrl(
  subjectSlug: string,
  opts?: { boardSlug?: string; programSlug?: string; grade?: string | number }
) {
  const segments = [] as string[];

  const boardSlug = opts?.boardSlug ? canonicalBoardSlug(opts.boardSlug) : '';
  const progSlug = opts?.programSlug ? toPathSegment(opts.programSlug) : '';

  if (boardSlug) {
    segments.push(boardSlug);
  }
  if (progSlug) {
    segments.push(progSlug);
  }

  segments.push(toPathSegment(subjectSlug));

  return `/${segments.filter(Boolean).join('/')}`;
}

export function chapterUrl(
  subjectSlug: string,
  chapterSlug: string | number,
  opts?: { boardSlug?: string; programSlug?: string; grade?: string | number }
) {
  return `${bookUrl(subjectSlug, opts)}/${toPathSegment(chapterSlug)}`;
}

export function topicUrl(
  subjectSlug: string,
  chapterSlug: string | number,
  topicSlug: string,
  opts?: { boardSlug?: string; programSlug?: string; grade?: string | number }
) {
  return `${chapterUrl(subjectSlug, chapterSlug, opts)}/${toPathSegment(topicSlug)}`;
}

export function parseReaderPath(path: string[] | undefined) {
  if (!path?.length) {
    return {
      chapterSlug: null as string | null,
      chapterNumber: null as number | null,
      topicSlug: null as string | null,
    };
  }

  const [chapterSlug, topicSlug] = path;
  const chapterMatch = String(chapterSlug || '').match(/^chapter-(\d+)$/i);
  const chapterNumber = chapterMatch ? parseInt(chapterMatch[1], 10) : null;

  return {
    chapterSlug: chapterSlug || null,
    chapterNumber,
    topicSlug: topicSlug || null,
  };
}

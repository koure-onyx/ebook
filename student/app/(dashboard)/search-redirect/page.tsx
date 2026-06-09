import { redirect } from 'next/navigation';
import connectDB from '@studyvault/db/connect';
import Topic from '@studyvault/db/models/Topic';
import '@studyvault/db/models/Book';
import { topicUrl } from '@/lib/reader-urls';

export default async function SearchRedirect({ searchParams }: { searchParams: { topicId: string } }) {
  if (!searchParams.topicId) redirect('/dashboard');

  await connectDB();
  const topic = await Topic.findById(searchParams.topicId)
    .populate({
      path: 'book_id',
      select: 'subject_slug board_id program_id',
      populate: [
        { path: 'board_id', select: 'short_code slug' },
        { path: 'program_id', select: 'slug' },
      ],
    })
    .populate('chapter_id', 'slug chapter_number')
    .lean();

  if (!topic) redirect('/dashboard');

  const subjectSlug = topic.book_id?.subject_slug || 'subject';
  const chapterSlug = topic.chapter_id?.slug || `chapter-${topic.chapter_id?.chapter_number || 1}`;
  const programSlug = topic.book_id?.program_id?.slug;
  const boardSlug = topic.book_id?.board_id?.short_code || topic.book_id?.board_id?.slug;

  const opts = boardSlug || programSlug ? { boardSlug, programSlug } : undefined;
  redirect(topicUrl(subjectSlug, chapterSlug, topic.slug || topic._id.toString(), opts));
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import schemas dynamically / locally
const BoardSchema = new mongoose.Schema({}, { strict: false });
const ProgramSchema = new mongoose.Schema({}, { strict: false });
const BookSchema = new mongoose.Schema({}, { strict: false });

const Board = mongoose.models.Board || mongoose.model('Board', BoardSchema);
const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);
const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'studyvault'
  });
  console.log("Connected to DB");

  const boards = await Board.find({});
  console.log("\n--- BOARDS ---");
  boards.forEach(b => console.log({ _id: b._id, name: b.name, slug: b.slug, short_code: b.short_code }));

  const programs = await Program.find({});
  console.log("\n--- PROGRAMS ---");
  programs.forEach(p => console.log({ _id: p._id, name: p.name, slug: p.slug }));

  const books = await Book.find({});
  console.log("\n--- BOOKS ---");
  books.forEach(b => console.log({
    _id: b._id,
    title: b.title,
    slug: b.slug,
    subject: b.subject,
    subject_slug: b.subject_slug,
    grade: b.grade,
    board: b.board,
    board_id: b.board_id,
    program_id: b.program_id,
    is_live: b.is_live
  }));

  await mongoose.disconnect();
  console.log("\nDisconnected");
}

run().catch(console.error);

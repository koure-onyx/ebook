import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'studyvault'
  });
  console.log("Connected to DB");

  const Board = mongoose.model('Board', new mongoose.Schema({}, { strict: false }));
  const Book = mongoose.model('Book', new mongoose.Schema({}, { strict: false }));
  const Chapter = mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }));
  const Topic = mongoose.model('Topic', new mongoose.Schema({}, { strict: false }));

  // 1. Update Board Punjab Board to have short_code 'PCTB' (or 'pctb')
  let board = await Board.findOne({ name: 'Punjab Board' });
  if (!board) {
    // If not found, find by short_code PUB
    board = await Board.findOne({ short_code: 'PUB' });
  }

  if (!board) {
    console.log("Punjab Board not found. Creating it...");
    board = await Board.create({
      name: 'Punjab Board',
      slug: 'punjab-board',
      short_code: 'PCTB'
    });
  } else {
    board.short_code = 'PCTB';
    board.slug = 'punjab-board';
    await board.save();
    console.log(`Updated board short_code to: ${board.short_code}`);
  }

  const boardId = board._id;

  // 2. Fix books
  const booksResult = await Book.updateMany(
    {},
    {
      $set: {
        board_id: boardId,
        board: 'Punjab Board'
      }
    }
  );
  console.log(`Updated ${booksResult.modifiedCount} books with board_id: ${boardId}`);

  // 3. Fix chapters
  const chaptersResult = await Chapter.updateMany(
    {},
    {
      $set: {
        board_id: boardId
      }
    }
  );
  console.log(`Updated ${chaptersResult.modifiedCount} chapters with board_id: ${boardId}`);

  // 4. Fix topics
  const topicsResult = await Topic.updateMany(
    {},
    {
      $set: {
        board_id: boardId
      }
    }
  );
  console.log(`Updated ${topicsResult.modifiedCount} topics with board_id: ${boardId}`);

  await mongoose.disconnect();
  console.log("Done");
}

run().catch(console.error);

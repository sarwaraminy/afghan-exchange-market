import db, { initializeDatabase, saveDatabaseNow } from './config/database';

async function cleanDuplicates() {
  console.log('='.repeat(60));
  console.log('CLEANING DUPLICATE HAWALADARS');
  console.log('='.repeat(60));

  await initializeDatabase();

  // Count total hawaladars
  const total = db.prepare('SELECT COUNT(*) as count FROM hawaladars').get() as { count: number };
  console.log(`\nTotal hawaladars before cleanup: ${total.count}`);

  // Find duplicates by name and location
  const duplicates = db.prepare(`
    SELECT name, location, COUNT(*) as count, GROUP_CONCAT(id) as ids
    FROM hawaladars
    GROUP BY name, location
    HAVING count > 1
  `).all() as Array<{ name: string; location: string; count: number; ids: string }>;

  console.log(`\nFound ${duplicates.length} sets of duplicates`);

  let deletedCount = 0;

  for (const dup of duplicates) {
    const ids = dup.ids.split(',').map(id => parseInt(id));
    console.log(`\n"${dup.name}" at "${dup.location}": ${dup.count} copies (IDs: ${ids.join(', ')})`);

    // Keep the first ID, delete the rest
    const idsToDelete = ids.slice(1);

    for (const id of idsToDelete) {
      // Check if this hawaladar is used in any transactions
      const usedInTransactions = db.prepare(`
        SELECT COUNT(*) as count
        FROM hawala_transactions
        WHERE sender_hawaladar_id = ? OR receiver_hawaladar_id = ?
      `).get(id, id) as { count: number };

      if (usedInTransactions.count > 0) {
        console.log(`  - ID ${id}: Used in ${usedInTransactions.count} transaction(s), updating references to ID ${ids[0]}...`);

        // Update transactions to use the first ID instead
        db.prepare(`
          UPDATE hawala_transactions
          SET sender_hawaladar_id = ?
          WHERE sender_hawaladar_id = ?
        `).run(ids[0], id);

        db.prepare(`
          UPDATE hawala_transactions
          SET receiver_hawaladar_id = ?
          WHERE receiver_hawaladar_id = ?
        `).run(ids[0], id);
      }

      // Now safe to delete
      db.prepare('DELETE FROM hawaladars WHERE id = ?').run(id);
      deletedCount++;
      console.log(`  - Deleted ID ${id}`);
    }
  }

  // Count after cleanup
  const totalAfter = db.prepare('SELECT COUNT(*) as count FROM hawaladars').get() as { count: number };
  console.log(`\nTotal hawaladars after cleanup: ${totalAfter.count}`);
  console.log(`Deleted ${deletedCount} duplicate records`);

  // Save database
  saveDatabaseNow();
  console.log('\nDatabase saved successfully!');
  console.log('='.repeat(60));
}

cleanDuplicates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error cleaning duplicates:', error);
    process.exit(1);
  });

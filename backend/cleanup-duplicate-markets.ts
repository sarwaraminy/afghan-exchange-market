import db, { initializeDatabase, saveDatabaseNow } from './src/config/database';

async function cleanupDuplicates() {
  console.log('Initializing database...');
  await initializeDatabase();

  console.log('\n=== Before Cleanup ===');
  const beforeMarkets = db.prepare('SELECT id, name, location FROM markets ORDER BY id').all();
  console.log('Total markets:', beforeMarkets.length);
  console.log(beforeMarkets);

  console.log('\n=== Removing Duplicates ===');

  // Keep only the first occurrence of each market name
  // Delete all other occurrences
  const uniqueNames = db.prepare(`
    SELECT name, MIN(id) as keep_id
    FROM markets
    GROUP BY name
  `).all() as Array<{ name: string; keep_id: number }>;

  for (const { name, keep_id } of uniqueNames) {
    const deleted = db.prepare(`
      DELETE FROM markets
      WHERE name = ? AND id != ?
    `).run(name, keep_id);

    if (deleted.changes > 0) {
      console.log(`Deleted ${deleted.changes} duplicate(s) of "${name}", kept ID ${keep_id}`);
    }
  }

  console.log('\n=== After Cleanup ===');
  const afterMarkets = db.prepare('SELECT id, name, location FROM markets ORDER BY id').all();
  console.log('Total markets:', afterMarkets.length);
  console.log(afterMarkets);

  // Also check and fix any exchange_rates that reference deleted market IDs
  console.log('\n=== Checking Exchange Rates ===');
  const orphanedRates = db.prepare(`
    SELECT COUNT(*) as count
    FROM exchange_rates er
    WHERE NOT EXISTS (SELECT 1 FROM markets m WHERE m.id = er.market_id)
  `).get() as { count: number };

  if (orphanedRates.count > 0) {
    console.log(`Warning: Found ${orphanedRates.count} exchange rates with invalid market_id`);
    console.log('You may need to reassign or delete these rates manually');
  } else {
    console.log('All exchange rates reference valid markets ✓');
  }

  saveDatabaseNow();
  console.log('\n✅ Cleanup complete! Database saved.');
}

cleanupDuplicates().catch(console.error);

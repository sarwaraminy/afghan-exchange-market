-- Check if new tables exist
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'hawala_%' ORDER BY name;

-- Check if new columns exist in hawaladars
PRAGMA table_info(hawaladars);

-- Check if new columns exist in hawala_transactions
PRAGMA table_info(hawala_transactions);

-- Check if new columns exist in users
PRAGMA table_info(users);

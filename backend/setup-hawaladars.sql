-- ============================================
-- HAWALA SYSTEM - INITIAL SETUP SCRIPT
-- ============================================
-- Run this after the database migrations complete
-- This sets up hawaladar prefixes and transaction limits
-- ============================================

-- ============================================
-- STEP 1: Set Hawaladar Prefixes
-- ============================================
-- IMPORTANT: Each hawaladar must have a unique 3-letter prefix
-- This prefix is used in reference codes to prevent duplicates

-- Major Cities (Customize based on your actual hawaladars)
UPDATE hawaladars SET hawaladar_prefix = 'KBL' WHERE name LIKE '%Kabul%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'HRT' WHERE name LIKE '%Herat%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'KNR' WHERE name LIKE '%Kandahar%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'MZR' WHERE name LIKE '%Mazar%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'JLB' WHERE name LIKE '%Jalalabad%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'KHT' WHERE name LIKE '%Khost%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'BLK' WHERE name LIKE '%Balkh%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'GHZ' WHERE name LIKE '%Ghazni%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'KNZ' WHERE name LIKE '%Kunduz%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'BDK' WHERE name LIKE '%Badakhshan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'TKR' WHERE name LIKE '%Takhar%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'BGL' WHERE name LIKE '%Baghlan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'PRW' WHERE name LIKE '%Parwan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'KPS' WHERE name LIKE '%Kapisa%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'LGR' WHERE name LIKE '%Laghman%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'NGR' WHERE name LIKE '%Nangarhar%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'PKA' WHERE name LIKE '%Paktia%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'PKK' WHERE name LIKE '%Paktika%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'LOG' WHERE name LIKE '%Logar%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'WRD' WHERE name LIKE '%Wardak%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'BMY' WHERE name LIKE '%Bamyan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'GHR' WHERE name LIKE '%Ghor%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'FRH' WHERE name LIKE '%Farah%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'HLM' WHERE name LIKE '%Helmand%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'NMR' WHERE name LIKE '%Nimroz%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'ZBL' WHERE name LIKE '%Zabul%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'URZ' WHERE name LIKE '%Uruzgan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'DKN' WHERE name LIKE '%Daikundi%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'SAR' WHERE name LIKE '%Sar-e Pol%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'SMG' WHERE name LIKE '%Samangan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'JWZ' WHERE name LIKE '%Jawzjan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'FRB' WHERE name LIKE '%Faryab%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'BDS' WHERE name LIKE '%Badghis%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'NRG' WHERE name LIKE '%Nuristan%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'KNR' WHERE name LIKE '%Kunar%' AND hawaladar_prefix IS NULL;
UPDATE hawaladars SET hawaladar_prefix = 'PNG' WHERE name LIKE '%Panjshir%' AND hawaladar_prefix IS NULL;

-- For hawaladars without a specific location match, generate prefix from first 3 letters
UPDATE hawaladars
SET hawaladar_prefix = UPPER(SUBSTR(REPLACE(name, ' ', ''), 1, 3))
WHERE hawaladar_prefix IS NULL AND is_active = 1;

-- Verify no duplicates
SELECT hawaladar_prefix, COUNT(*) as count
FROM hawaladars
WHERE hawaladar_prefix IS NOT NULL
GROUP BY hawaladar_prefix
HAVING count > 1;

-- If duplicates found, manually fix them:
-- UPDATE hawaladars SET hawaladar_prefix = 'KBL2' WHERE id = X;

-- ============================================
-- STEP 2: Set Transaction Limits
-- ============================================
-- Set default limits for all active hawaladars
-- Adjust these values based on your business requirements

-- Default limits (in base currency units)
UPDATE hawaladars
SET
  max_transaction_amount = 100000,    -- Maximum single transaction
  daily_transaction_limit = 500000    -- Maximum daily total
WHERE is_active = 1
  AND max_transaction_amount IS NULL;

-- Optional: Set different limits for specific hawaladars
-- Example: Higher limits for major city hawaladars
UPDATE hawaladars
SET
  max_transaction_amount = 200000,
  daily_transaction_limit = 1000000
WHERE hawaladar_prefix IN ('KBL', 'HRT', 'KNR', 'MZR')
  AND is_active = 1;

-- ============================================
-- STEP 3: Link Users to Hawaladars (IMPORTANT)
-- ============================================
-- This enables jurisdiction-based access control
-- Users can only complete payouts for their assigned hawaladar

-- Example: Link users to their hawaladars
-- REPLACE THESE WITH YOUR ACTUAL USERNAMES AND HAWALADAR IDS

-- UPDATE users SET hawaladar_id = 1 WHERE username = 'kabul_saraf_user';
-- UPDATE users SET hawaladar_id = 2 WHERE username = 'herat_saraf_user';
-- UPDATE users SET hawaladar_id = 3 WHERE username = 'kandahar_saraf_user';

-- Admin users don't need hawaladar_id (they can access all)
-- UPDATE users SET hawaladar_id = NULL WHERE role = 'admin';

-- ============================================
-- STEP 4: Verify Setup
-- ============================================

-- Check hawaladar prefixes
SELECT
  id,
  name,
  hawaladar_prefix,
  max_transaction_amount,
  daily_transaction_limit,
  is_active
FROM hawaladars
ORDER BY hawaladar_prefix;

-- Check users linked to hawaladars
SELECT
  u.id,
  u.username,
  u.role,
  u.hawaladar_id,
  h.name as hawaladar_name,
  h.hawaladar_prefix
FROM users u
LEFT JOIN hawaladars h ON u.hawaladar_id = h.id
ORDER BY u.username;

-- ============================================
-- STEP 5: Initialize Reference Counter (if needed)
-- ============================================
-- This should already be done by migrations, but verify:

SELECT * FROM hawala_reference_counter;

-- If not exists, initialize:
-- INSERT OR IGNORE INTO hawala_reference_counter (id, counter, year)
-- VALUES (1, 0, strftime('%Y', 'now'));

-- ============================================
-- STEP 6: Verify New Tables Exist
-- ============================================

-- Check audit log table
SELECT COUNT(*) as audit_log_count FROM hawala_audit_log;

-- Check transaction history table
SELECT COUNT(*) as history_count FROM hawala_transaction_history;

-- Check settlements table
SELECT COUNT(*) as settlements_count FROM hawala_settlements;

-- Check daily snapshots table
SELECT COUNT(*) as snapshots_count FROM daily_hawaladar_snapshots;

-- ============================================
-- OPTIONAL: Sample Data for Testing
-- ============================================

-- Uncomment to insert test data
/*
-- Test hawaladar prefixes
SELECT
  'HWL-' || hawaladar_prefix || '-' || strftime('%Y', 'now') || '-000001' as sample_reference_code,
  name
FROM hawaladars
WHERE is_active = 1
ORDER BY hawaladar_prefix;
*/

-- ============================================
-- DEPLOYMENT CHECKLIST
-- ============================================
/*
[ ] All hawaladars have unique prefixes
[ ] Transaction limits are set appropriately
[ ] Users are linked to their hawaladars
[ ] Reference counter is initialized
[ ] All new tables exist and are accessible
[ ] Sample transaction can be created with new format
[ ] Audit logging is working
[ ] Reports are accessible
*/

-- ============================================
-- END OF SETUP SCRIPT
-- ============================================

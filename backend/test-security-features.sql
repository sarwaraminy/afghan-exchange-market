-- ============================================
-- HAWALA SYSTEM - SECURITY FEATURES TEST SCRIPT
-- ============================================
-- This script helps verify that all security features are working correctly
-- Run these queries in sequence and verify the expected results
-- ============================================

-- ============================================
-- TEST 1: Verify Hawaladar Prefixes
-- ============================================
PRINT 'TEST 1: Hawaladar Prefixes';

-- Should show all hawaladars with unique prefixes
SELECT
  id,
  name,
  hawaladar_prefix,
  CASE WHEN hawaladar_prefix IS NULL THEN '❌ MISSING' ELSE '✅ SET' END as status
FROM hawaladars
WHERE is_active = 1
ORDER BY hawaladar_prefix;

-- Check for duplicates (should return 0 rows)
SELECT
  hawaladar_prefix,
  COUNT(*) as count,
  GROUP_CONCAT(name) as hawaladars
FROM hawaladars
WHERE hawaladar_prefix IS NOT NULL
GROUP BY hawaladar_prefix
HAVING count > 1;

-- Expected: No rows (no duplicates)

-- ============================================
-- TEST 2: Verify Transaction Limits
-- ============================================
PRINT 'TEST 2: Transaction Limits';

-- Should show all hawaladars with limits set
SELECT
  id,
  name,
  max_transaction_amount,
  daily_transaction_limit,
  CASE
    WHEN max_transaction_amount IS NULL THEN '❌ MISSING'
    WHEN max_transaction_amount <= 0 THEN '⚠️ INVALID'
    ELSE '✅ SET'
  END as status
FROM hawaladars
WHERE is_active = 1
ORDER BY name;

-- ============================================
-- TEST 3: Verify User-Hawaladar Links
-- ============================================
PRINT 'TEST 3: User-Hawaladar Links';

-- Should show which users are linked to which hawaladars
SELECT
  u.id,
  u.username,
  u.role,
  u.hawaladar_id,
  h.name as hawaladar_name,
  h.hawaladar_prefix,
  CASE
    WHEN u.role = 'admin' THEN '✅ Admin (no restriction needed)'
    WHEN u.hawaladar_id IS NULL THEN '⚠️ Not linked to hawaladar'
    ELSE '✅ Linked'
  END as status
FROM users u
LEFT JOIN hawaladars h ON u.hawaladar_id = h.id
ORDER BY u.role, u.username;

-- ============================================
-- TEST 4: Verify New Tables Exist
-- ============================================
PRINT 'TEST 4: New Tables';

-- Check audit log
SELECT 'hawala_audit_log' as table_name, COUNT(*) as record_count FROM hawala_audit_log
UNION ALL
SELECT 'hawala_transaction_history', COUNT(*) FROM hawala_transaction_history
UNION ALL
SELECT 'hawala_settlements', COUNT(*) FROM hawala_settlements
UNION ALL
SELECT 'daily_hawaladar_snapshots', COUNT(*) FROM daily_hawaladar_snapshots;

-- ============================================
-- TEST 5: Verify New Columns Exist
-- ============================================
PRINT 'TEST 5: New Columns';

-- Check hawaladars table
SELECT
  'hawaladars.hawaladar_prefix' as column_check,
  CASE WHEN hawaladar_prefix IS NOT NULL THEN '✅ EXISTS' ELSE '⚠️ NULL' END as status
FROM hawaladars
LIMIT 1;

-- Check hawala_transactions table
SELECT
  id,
  reference_code,
  secret_pin,
  expires_at,
  linked_transaction_id,
  is_origin_transaction,
  CASE WHEN secret_pin IS NOT NULL THEN '✅ HAS PIN' ELSE '⚠️ NO PIN' END as pin_status,
  CASE WHEN expires_at IS NOT NULL THEN '✅ HAS EXPIRY' ELSE '⚠️ NO EXPIRY' END as expiry_status
FROM hawala_transactions
ORDER BY id DESC
LIMIT 5;

-- ============================================
-- TEST 6: Reference Code Format Test
-- ============================================
PRINT 'TEST 6: Reference Code Format';

-- Check recent transactions for new format
SELECT
  ht.id,
  ht.reference_code,
  h.hawaladar_prefix,
  CASE
    WHEN ht.reference_code LIKE 'HWL-%-%-%' THEN '✅ NEW FORMAT'
    WHEN ht.reference_code LIKE 'HWL-%-%' THEN '⚠️ OLD FORMAT'
    ELSE '❌ INVALID FORMAT'
  END as format_status,
  ht.created_at
FROM hawala_transactions ht
LEFT JOIN hawaladars h ON ht.sender_hawaladar_id = h.id OR ht.receiver_hawaladar_id = h.id
ORDER BY ht.id DESC
LIMIT 10;

-- ============================================
-- TEST 7: Transaction Expiration Test
-- ============================================
PRINT 'TEST 7: Transaction Expiration';

-- Check for expired pending transactions
SELECT
  id,
  reference_code,
  status,
  created_at,
  expires_at,
  julianday(expires_at) - julianday('now') as days_until_expiry,
  CASE
    WHEN status IN ('completed', 'cancelled') THEN '✅ Finalized'
    WHEN expires_at IS NULL THEN '⚠️ No expiry set'
    WHEN julianday('now') > julianday(expires_at) THEN '❌ EXPIRED'
    WHEN julianday(expires_at) - julianday('now') < 1 THEN '⚠️ Expires soon'
    ELSE '✅ Valid'
  END as expiry_status
FROM hawala_transactions
WHERE status IN ('pending', 'in_transit')
ORDER BY expires_at ASC
LIMIT 10;

-- ============================================
-- TEST 8: Audit Log Test
-- ============================================
PRINT 'TEST 8: Audit Log';

-- Check recent audit events
SELECT
  id,
  transaction_id,
  action,
  actor_name,
  created_at,
  details
FROM hawala_audit_log
ORDER BY created_at DESC
LIMIT 10;

-- Count audit events by action type
SELECT
  action,
  COUNT(*) as event_count,
  DATE(created_at) as date
FROM hawala_audit_log
GROUP BY action, DATE(created_at)
ORDER BY date DESC, event_count DESC
LIMIT 20;

-- ============================================
-- TEST 9: Transaction History Test
-- ============================================
PRINT 'TEST 9: Transaction History';

-- Check if any field changes are being tracked
SELECT
  th.id,
  th.transaction_id,
  ht.reference_code,
  th.changed_field,
  th.old_value,
  th.new_value,
  th.changed_at,
  th.change_reason
FROM hawala_transaction_history th
JOIN hawala_transactions ht ON th.transaction_id = ht.id
ORDER BY th.changed_at DESC
LIMIT 10;

-- ============================================
-- TEST 10: Linked Transactions Test
-- ============================================
PRINT 'TEST 10: Linked Transactions';

-- Find linked transaction pairs
SELECT
  t1.id as origin_id,
  t1.reference_code as origin_code,
  t1.transaction_direction as origin_direction,
  t2.id as linked_id,
  t2.reference_code as linked_code,
  t2.transaction_direction as linked_direction,
  t1.amount,
  t1.status as origin_status,
  t2.status as linked_status
FROM hawala_transactions t1
LEFT JOIN hawala_transactions t2 ON t1.id = t2.linked_transaction_id
WHERE t1.is_origin_transaction = 1
ORDER BY t1.created_at DESC
LIMIT 10;

-- ============================================
-- TEST 11: Daily Transaction Limits Test
-- ============================================
PRINT 'TEST 11: Daily Transaction Limits';

-- Check today's transaction volume per hawaladar
SELECT
  h.id,
  h.name,
  h.hawaladar_prefix,
  h.daily_transaction_limit,
  COALESCE(SUM(ht.total_amount), 0) as today_total,
  h.daily_transaction_limit - COALESCE(SUM(ht.total_amount), 0) as remaining_limit,
  CASE
    WHEN COALESCE(SUM(ht.total_amount), 0) > h.daily_transaction_limit THEN '❌ EXCEEDED'
    WHEN COALESCE(SUM(ht.total_amount), 0) > h.daily_transaction_limit * 0.8 THEN '⚠️ 80% USED'
    ELSE '✅ OK'
  END as limit_status
FROM hawaladars h
LEFT JOIN hawala_transactions ht ON ht.sender_hawaladar_id = h.id
  AND DATE(ht.created_at) = DATE('now')
  AND ht.status != 'cancelled'
WHERE h.is_active = 1
GROUP BY h.id, h.name, h.hawaladar_prefix, h.daily_transaction_limit
ORDER BY today_total DESC;

-- ============================================
-- TEST 12: Reports Availability Test
-- ============================================
PRINT 'TEST 12: Reports Data Availability';

-- Net Positions Summary
SELECT
  'Net Positions Report' as report_name,
  COUNT(*) as data_available
FROM (
  SELECT
    h1.id as hawaladar_a_id,
    h2.id as hawaladar_b_id,
    COALESCE(SUM(CASE
      WHEN ht.sender_hawaladar_id = h1.id AND ht.receiver_hawaladar_id = h2.id
      THEN ht.amount ELSE 0 END), 0) as sent_by_a
  FROM hawaladars h1
  CROSS JOIN hawaladars h2
  LEFT JOIN hawala_transactions ht ON
    (ht.sender_hawaladar_id = h1.id AND ht.receiver_hawaladar_id = h2.id)
    OR (ht.sender_hawaladar_id = h2.id AND ht.receiver_hawaladar_id = h1.id)
  WHERE h1.id < h2.id
  GROUP BY h1.id, h2.id
  HAVING sent_by_a > 0
);

-- Unpaid Hawalas Summary
SELECT
  'Unpaid Hawalas Report' as report_name,
  COUNT(*) as pending_count,
  SUM(amount) as total_amount
FROM hawala_transactions
WHERE status = 'pending';

-- Commission Report Data
SELECT
  'Commission Report' as report_name,
  COUNT(DISTINCT sender_hawaladar_id) as hawaladars_with_activity,
  SUM(commission_amount) as total_commission
FROM hawala_transactions
WHERE status = 'completed'
  AND DATE(created_at) >= DATE('now', '-30 days');

-- Transaction Aging Summary
SELECT
  'Transaction Aging Report' as report_name,
  CASE
    WHEN julianday('now') - julianday(created_at) <= 1 THEN '0-24 hours'
    WHEN julianday('now') - julianday(created_at) <= 3 THEN '1-3 days'
    WHEN julianday('now') - julianday(created_at) <= 7 THEN '3-7 days'
    ELSE 'over 7 days'
  END as age_bracket,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM hawala_transactions
WHERE status IN ('pending', 'in_transit')
GROUP BY age_bracket;

-- ============================================
-- TEST 13: Security Validation
-- ============================================
PRINT 'TEST 13: Security Validation';

-- Check for transactions without PINs (old transactions)
SELECT
  'Transactions without PIN' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '⚠️ Old transactions' ELSE '✅ All have PINs' END as status
FROM hawala_transactions
WHERE secret_pin IS NULL;

-- Check for transactions without expiry dates
SELECT
  'Transactions without expiry' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '⚠️ Old transactions' ELSE '✅ All have expiry' END as status
FROM hawala_transactions
WHERE expires_at IS NULL;

-- Check for users without hawaladar assignment (non-admins)
SELECT
  'Non-admin users without hawaladar' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '⚠️ Need assignment' ELSE '✅ All assigned' END as status
FROM users
WHERE role != 'admin' AND hawaladar_id IS NULL;

-- ============================================
-- TEST SUMMARY
-- ============================================
PRINT 'TEST SUMMARY';

SELECT
  'Total Active Hawaladars' as metric,
  COUNT(*) as value
FROM hawaladars WHERE is_active = 1
UNION ALL
SELECT
  'Hawaladars with Prefix',
  COUNT(*) FROM hawaladars WHERE hawaladar_prefix IS NOT NULL
UNION ALL
SELECT
  'Total Transactions',
  COUNT(*) FROM hawala_transactions
UNION ALL
SELECT
  'Transactions with PIN',
  COUNT(*) FROM hawala_transactions WHERE secret_pin IS NOT NULL
UNION ALL
SELECT
  'Transactions with Expiry',
  COUNT(*) FROM hawala_transactions WHERE expires_at IS NOT NULL
UNION ALL
SELECT
  'Audit Log Entries',
  COUNT(*) FROM hawala_audit_log
UNION ALL
SELECT
  'Transaction History Entries',
  COUNT(*) FROM hawala_transaction_history
UNION ALL
SELECT
  'Active Users',
  COUNT(*) FROM users
UNION ALL
SELECT
  'Users Linked to Hawaladar',
  COUNT(*) FROM users WHERE hawaladar_id IS NOT NULL;

-- ============================================
-- END OF TEST SCRIPT
-- ============================================
-- If all tests pass, the system is ready for production use
-- ============================================

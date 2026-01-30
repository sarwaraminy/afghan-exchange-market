# Hawala Receipt Header Fix - Status Update

**Date:** January 30, 2026
**Status:** 🔧 IN PROGRESS

---

## Problem Statement

User reported that for **incoming** Hawala transaction receipts:
- ❌ Header shows generic "Receipt" text
- ✅ Should show receiver hawaladar's business information (name, location, floor, shop, phone)

**Example:**
- **Outgoing receipt header** (correct): "Jurm Sarafi, Hiadari Market, Floor: اول, Shop: 165, 0700254517"
- **Incoming receipt header** (incorrect): "Receipt"

---

## Root Cause Analysis

The issue appears to be that `currentHawaladar.name` is **null** or **undefined** for incoming transactions, causing the code to fall back to displaying `t('hawala.receipt')`.

**Code Location:** `frontend/src/pages/HawalaReceipt.tsx` lines 275-283

```typescript
{
  currentHawaladar.name
    ? (i18n.language === 'fa'
        ? currentHawaladar.name_fa || currentHawaladar.name
        : i18n.language === 'ps'
        ? currentHawaladar.name_ps || currentHawaladar.name
        : currentHawaladar.name)
    : t('hawala.receipt')  // ← Falls back to "Receipt"
}
```

**Possible Causes:**
1. Backend not returning `receiver_hawaladar_name` for incoming transactions
2. User's `hawaladar_id` not matching `transaction.receiver_hawaladar_id`
3. Missing field in database query

---

## Changes Made So Far

### 1. Added Missing `receiver_hawaladar_phone` Field ✅

**Backend Changes:**

- **File:** `backend/src/controllers/hawalaController.ts`
- **Functions Updated:**
  - `getTransactionById` (line 370)
  - `getTransactionByCode` (line 419)
  - `getTransactions` (line 240)

**Added SQL field:**
```sql
rh.phone as receiver_hawaladar_phone,
```

**Frontend Type Update:**

- **File:** `frontend/src/types/index.ts`
- **Added to HawalaTransaction interface:**
```typescript
receiver_hawaladar_phone?: string;
```

### 2. Added Debug Logging ✅

**File:** `frontend/src/pages/HawalaReceipt.tsx` (after line 112)

```typescript
useEffect(() => {
  if (transaction && user) {
    console.log('=== RECEIPT DEBUG ===');
    console.log('User hawaladar_id:', user.hawaladar_id);
    console.log('Transaction sender_hawaladar_id:', transaction.sender_hawaladar_id);
    console.log('Transaction receiver_hawaladar_id:', transaction.receiver_hawaladar_id);
    console.log('isIncoming:', isIncoming);
    console.log('isOutgoing:', isOutgoing);
    console.log('Transaction data:', transaction);
    console.log('Receiver hawaladar name:', transaction.receiver_hawaladar_name);
    console.log('Sender hawaladar name:', transaction.sender_hawaladar_name);
  }
}, [transaction, user]);
```

### 3. Backend Rebuilt and Restarted ✅

- Built successfully with `npm run build`
- Backend server restarted on port 5000

---

## Current Receipt Logic (Already Correct)

### Direction Detection
```typescript
const isIncoming = transaction && user && transaction.receiver_hawaladar_id === user.hawaladar_id;
const isOutgoing = transaction && user && transaction.sender_hawaladar_id === user.hawaladar_id;
```

### Header Selection (Adaptive)
```typescript
const currentHawaladar = isIncoming ? {
  name: transaction?.receiver_hawaladar_name,  // For incoming
  // ... other receiver fields
} : {
  name: transaction?.sender_hawaladar_name,    // For outgoing
  // ... other sender fields
};
```

### Body Label (Correct)
```typescript
{isIncoming ? t('hawala.senderAgent') : t('hawala.receiverAgent')}
```

- For **incoming**: Shows "Sender Agent" ✅
- For **outgoing**: Shows "Receiver Agent" ✅

---

## Next Steps

1. **Test the Receipt** - View an incoming transaction receipt in the browser
2. **Check Debug Console** - Review the console output to see:
   - Is `user.hawaladar_id` defined?
   - Does `transaction.receiver_hawaladar_name` have a value?
   - Is `isIncoming` correctly evaluated?
3. **Identify Missing Data** - Determine if:
   - Backend is not returning the data
   - Frontend logic issue
   - Database doesn't have the data
4. **Fix Accordingly** - Based on findings

---

## Testing Instructions

### For User to Test:

1. **Open Browser** - Navigate to `http://localhost:5173`
2. **Login** as a hawaladar user (not admin)
3. **Go to Hawala Transactions**
4. **Find an Incoming Transaction** - One where you are the receiver
5. **Click to View Receipt**
6. **Open Browser Console** (Press F12)
7. **Check Console Output** - Look for "=== RECEIPT DEBUG ===" logs
8. **Check Header** - Does it show your hawaladar business information or "Receipt"?

### Expected Result:

**Header should show:**
- Your hawaladar business name (in current language)
- Location
- Floor and shop number
- Phone number

**Body should show:**
- Label: "Sender Agent"
- Sender hawaladar's complete information including phone

---

## Files Modified

### Backend (3 locations in 1 file)
- ✅ `backend/src/controllers/hawalaController.ts` - Added `receiver_hawaladar_phone` to 3 SQL queries

### Frontend (2 files)
- ✅ `frontend/src/types/index.ts` - Added `receiver_hawaladar_phone` to interface
- ✅ `frontend/src/pages/HawalaReceipt.tsx` - Added debug logging

---

## Status: Awaiting Test Results

Need to:
1. Test incoming receipt with debug console open
2. Review debug output
3. Determine if data is available
4. Fix any remaining issues

---

**Last Updated:** January 30, 2026

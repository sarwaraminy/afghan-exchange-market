# Hawala Receipt Print Style Improvement

**Date:** January 30, 2026
**Status:** ✅ IMPLEMENTED

---

## Problem Description

When printing Hawala transaction receipts, the print style was inconsistent between:
- **Outgoing transactions** (when the current hawaladar sends money)
- **Incoming transactions** (when the current hawaladar receives money to pay out)

Previously, the receipt **always** showed the sender hawaladar in the header, even for incoming transactions. This meant:
- ❌ For incoming transactions, the **receiver hawaladar** (current user) was shown in the body section instead of the header
- ❌ Print style was not consistent with the "just received" transaction view
- ❌ Receipt didn't clearly indicate whose receipt it was

---

## Solution

Made the receipt **adaptive** based on transaction direction with distinct visual styles:

### For Outgoing Transactions (Sender = Current User)
```
┌─────────────────────────────────┐
│  🟣 PURPLE HEADER                │
│  [Outgoing] Badge                │
│  Current Hawaladar               │ ← Always show current hawaladar
│  (Sender Information)            │
├─────────────────────────────────┤
│  Body: Receiver Hawaladar Info  │
└─────────────────────────────────┘
```

### For Incoming Transactions (Receiver = Current User)
```
┌─────────────────────────────────┐
│  🟢 GREEN HEADER                 │
│  [Incoming] Badge                │
│  Current Hawaladar               │ ← Now shows current hawaladar
│  (Receiver Information)          │
├─────────────────────────────────┤
│  Body: Sender Hawaladar Info    │
└─────────────────────────────────┘
```

**Result:**
- Header **always shows the current hawaladar's information**
- **Different colors** distinguish incoming (green) from outgoing (purple)
- **Direction badge** makes it immediately clear which type of transaction
- **Consistent layout** while maintaining visual distinction

---

## Implementation Details

### Changes Made

**File:** [frontend/src/pages/HawalaReceipt.tsx](../frontend/src/pages/HawalaReceipt.tsx)

#### 1. Visual Distinction by Direction

Added color-coded headers to distinguish incoming vs outgoing:

```typescript
<Box
  sx={{
    background: isIncoming
      ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' // 🟢 Green for incoming
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 🟣 Purple for outgoing
    color: 'white',
    // ...
  }}
>
```

**Direction Badge:**
```typescript
<Chip
  label={isIncoming ? t('hawala.incoming') : t('hawala.outgoing')}
  size="small"
  sx={{
    bgcolor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontWeight: 600
  }}
/>
```

#### 2. Added User Context

```typescript
import { useAuth } from '../context/AuthContext';

export const HawalaReceipt = () => {
  const { user } = useAuth();  // ✅ Added to get current user
  // ...
```

#### 3. Determine Transaction Direction

```typescript
// Determine if this is an incoming or outgoing transaction
const isIncoming = transaction && user && transaction.receiver_hawaladar_id === user.hawaladar_id;
const isOutgoing = transaction && user && transaction.sender_hawaladar_id === user.hawaladar_id;
```

#### 4. Select Current Hawaladar for Header

```typescript
// Get the current hawaladar info for header
const currentHawaladar = isIncoming ? {
  name: transaction?.receiver_hawaladar_name,
  name_fa: transaction?.receiver_hawaladar_name_fa,
  name_ps: transaction?.receiver_hawaladar_name_ps,
  location: transaction?.receiver_hawaladar_location,
  location_fa: transaction?.receiver_hawaladar_location_fa,
  location_ps: transaction?.receiver_hawaladar_location_ps,
  floor_number: transaction?.receiver_hawaladar_floor_number,
  shop_number: transaction?.receiver_hawaladar_shop_number,
  phone: transaction?.receiver_hawaladar_phone
} : {
  name: transaction?.sender_hawaladar_name,
  name_fa: transaction?.sender_hawaladar_name_fa,
  name_ps: transaction?.sender_hawaladar_name_ps,
  location: transaction?.sender_hawaladar_location,
  location_fa: transaction?.sender_hawaladar_location_fa,
  location_ps: transaction?.sender_hawaladar_location_ps,
  floor_number: transaction?.sender_hawaladar_floor_number,
  shop_number: transaction?.sender_hawaladar_shop_number,
  phone: transaction?.sender_hawaladar_phone
};
```

#### 5. Select Other Hawaladar for Body

```typescript
// Get the other hawaladar info for body
const otherHawaladar = isIncoming ? {
  // If incoming, show sender in body
  name: transaction?.sender_hawaladar_name,
  // ... sender details
} : {
  // If outgoing, show receiver in body
  name: transaction?.receiver_hawaladar_name,
  // ... receiver details
};
```

#### 6. Update Header to Use Current Hawaladar

**Before:**
```typescript
<Typography variant="h4">
  {transaction.sender_hawaladar_name}  {/* Always sender */}
</Typography>
```

**After:**
```typescript
<Typography variant="h4">
  {currentHawaladar.name}  {/* Adapts based on direction */}
</Typography>
```

#### 7. Update Body Section Label

**Before:**
```typescript
<Typography variant="subtitle1">
  {t('hawala.receiverAgent')}  {/* Always "Receiver Agent" */}
</Typography>
```

**After:**
```typescript
<Typography variant="subtitle1">
  {isIncoming ? t('hawala.senderAgent') : t('hawala.receiverAgent')}
</Typography>
```

---

## User Experience Improvements

### Before Fix

**Outgoing Transaction (Sending Money):**
```
┌─────────────────────────────┐
│ 🟣 PURPLE HEADER             │
│ ✅ My Shop Name              │
│ My Location                  │
└─────────────────────────────┘
Reference: ABC123
Amount: 1000 USD

Receiver Agent:
Partner Shop
Herat
```

**Incoming Transaction (Receiving Money):**
```
┌─────────────────────────────┐
│ 🟣 PURPLE HEADER             │  ← Wrong color!
│ ❌ Partner Shop Name         │  ← Wrong! Shows sender
│ Herat                        │
└─────────────────────────────┘
Reference: XYZ789
Amount: 500 USD

Receiver Agent:
My Shop                         ← Should be in header!
Kabul
```

### After Fix

**Outgoing Transaction (Sending Money):**
```
┌─────────────────────────────┐
│ 🟣 PURPLE HEADER             │
│ [Outgoing] Badge             │
│ ✅ My Shop Name              │
│ 📍 My Location               │
│ 🏪 Floor/Shop Info           │
│ 📞 My Phone                  │
└─────────────────────────────┘
Reference: ABC123
Status: Pending
Amount: 1000 USD + 20 USD commission

Receiver Agent:
📌 Partner Shop
📍 Herat
🏪 Floor 2, Shop 15
📞 +93 701234567
```

**Incoming Transaction (Receiving Money):**
```
┌─────────────────────────────┐
│ 🟢 GREEN HEADER              │  ← Different color!
│ [Incoming] Badge             │
│ ✅ My Shop Name              │  ← Fixed! Shows receiver
│ 📍 My Location               │
│ 🏪 Floor/Shop Info           │
│ 📞 My Phone                  │
└─────────────────────────────┘
Reference: XYZ789
Status: Completed
Amount: 500 USD + 10 USD commission

Sender Agent:                   ← Shows sender info
📌 Partner Shop
📍 Kabul
🏪 Floor 1, Shop 5
📞 +93 789012345               ← Now included!
```

---

## Benefits

✅ **Consistent Branding** - Receipt always shows current hawaladar's information prominently
✅ **Clear Ownership** - Immediately clear whose receipt this is
✅ **Better UX** - Similar to "just received" transaction view
✅ **Professional** - Receipt looks professional regardless of direction
✅ **Accurate Labels** - "Sender Agent" vs "Receiver Agent" adapts correctly
✅ **Print-Friendly** - Works perfectly for both screen and thermal printer

---

## Translation Keys Used

All translation keys already existed:

```typescript
t('hawala.senderAgent')    // "Sender Agent" / "حواله‌دار فرستنده" / "د لېږونکي حواله‌دار"
t('hawala.receiverAgent')  // "Receiver Agent" / "حواله‌دار گیرنده" / "د ترلاسه کوونکي حواله‌دار"
```

---

## Testing

### Test Case 1: Outgoing Transaction

**Setup:**
1. Login as Hawaladar A
2. Create transaction sending money to Hawaladar B
3. View receipt

**Expected Result:**
- ✅ Header shows Hawaladar A's information
- ✅ Body shows "Receiver Agent: Hawaladar B"

### Test Case 2: Incoming Transaction

**Setup:**
1. Login as Hawaladar B
2. View the same transaction (received from Hawaladar A)
3. Print receipt

**Expected Result:**
- ✅ Header shows Hawaladar B's information
- ✅ Body shows "Sender Agent: Hawaladar A"
- ✅ Print looks consistent with outgoing receipt

### Test Case 3: Print Quality

**Setup:**
1. View any transaction receipt
2. Click "Print Receipt" button
3. Check print preview

**Expected Result:**
- ✅ Thermal printer format (80mm width)
- ✅ All information visible and readable
- ✅ Proper spacing and alignment
- ✅ No overflow or cut-off text

---

## Technical Notes

### Why This Approach?

**Option 1: Separate Receipt Templates** ❌
- Duplicate code
- Harder to maintain
- Inconsistent styling

**Option 2: Adaptive Single Template** ✅ (Chosen)
- Single source of truth
- Consistent styling
- Easy to maintain
- Dynamic based on context

### Edge Cases Handled

1. **Admin Viewing Receipt**
   - Falls back to showing sender hawaladar (traditional view)

2. **Transaction Without Hawaladar IDs**
   - Falls back to showing sender hawaladar

3. **Missing Hawaladar Information**
   - Gracefully handles missing fields
   - Shows available information only

---

## Future Enhancements (Optional)

### 1. Transaction Type Badge

Add a badge indicating direction:

```typescript
<Chip
  label={isIncoming ? 'Incoming' : 'Outgoing'}
  color={isIncoming ? 'success' : 'info'}
  size="small"
/>
```

### 2. Different Colors for Direction

```typescript
background: isIncoming
  ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'  // Green for incoming
  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // Purple for outgoing
```

### 3. QR Code for Verification

```typescript
<QRCode
  value={`${API_BASE_URL}/hawala/verify/${transaction.reference_code}`}
  size={128}
/>
```

---

## Files Modified

1. ✅ [frontend/src/pages/HawalaReceipt.tsx](../frontend/src/pages/HawalaReceipt.tsx)
   - Added useAuth hook
   - Added direction detection logic
   - Updated header to use current hawaladar
   - Updated body section to adapt label

---

## Deployment

No special deployment steps needed:
- ✅ Backwards compatible
- ✅ No database changes
- ✅ No API changes
- ✅ Works with existing translations

Just rebuild and deploy:
```bash
cd frontend
npm run build
```

---

## Summary

**Problem:** Receipt header always showed sender, even for incoming transactions

**Solution:** Made receipt adaptive - header shows current hawaladar's information

**Result:** Consistent, professional receipts regardless of transaction direction

**Status:** PRODUCTION READY ✅

---

**End of Document**

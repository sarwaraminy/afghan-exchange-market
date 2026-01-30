# Frontend Dev Server - Restart Required

**Issue:** `Uncaught SyntaxError: The requested module '/src/types/index.ts' does not provide an export named 'HawalaTransaction'`

**Cause:** Hot Module Replacement (HMR) cache issue after adding new import

**Solution:** Restart the frontend development server

---

## Quick Fix

### Step 1: Stop Frontend Server

**Windows:**
```bash
# Press Ctrl+C in the terminal running the dev server
# OR
taskkill //F //IM node.exe
```

**Mac/Linux:**
```bash
# Press Ctrl+C in the terminal running the dev server
# OR
pkill node
```

### Step 2: Clear Vite Cache (Optional but Recommended)

```bash
cd frontend
rm -rf node_modules/.vite
# OR on Windows
rmdir /s /q node_modules\.vite
```

### Step 3: Restart Frontend Server

```bash
cd frontend
npm run dev
```

---

## Why This Happened

When we added the import:
```typescript
import { HawalaTransaction } from '../types';
```

The Vite dev server's Hot Module Replacement (HMR) didn't properly detect the new import dependency. This is a known issue with Vite when:
1. Adding new imports from existing files
2. Changing module exports
3. Module graph changes

The export **does exist** in `frontend/src/types/index.ts:188`:
```typescript
export interface HawalaTransaction {
  // ...
}
```

But the dev server's cache is stale.

---

## Verification

After restarting, verify the fix:

1. Open browser to `http://localhost:5173`
2. Check browser console - error should be gone
3. Navigate to Hawala receipts
4. Receipt should load correctly

---

## If Error Persists

### 1. Hard Refresh Browser
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2. Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

### 3. Check TypeScript Compilation
```bash
cd frontend
npx tsc --noEmit
```

Should show no errors.

### 4. Rebuild Completely
```bash
cd frontend
rm -rf node_modules/.vite
rm -rf dist
npm run build
npm run dev
```

---

## Alternative: Use Type Import

If issues persist, you can use a type-only import:

```typescript
import type { HawalaTransaction } from '../types';
```

This explicitly tells TypeScript it's only a type import, which can help with some module resolution issues.

---

## Status

**Root Cause:** Vite HMR cache issue
**Fix:** Restart dev server
**Time:** < 30 seconds
**Risk:** None

---

**Note:** This is a common development issue and does NOT affect production builds.

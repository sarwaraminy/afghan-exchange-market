# Hawaladar Logo Upload Feature

**Date:** January 12, 2026
**Version:** 1.2.1

## Overview

Complete logo upload and management system for hawaladar branding, with real-time image preview and receipt display.

## Features

### ✅ Implemented

1. **Logo Upload UI** - Admin interface for uploading hawaladar logos
2. **Image Preview** - Real-time preview of selected files before upload
3. **Current Logo Display** - Shows existing logo when editing hawaladars
4. **Receipt Integration** - Logos appear on transaction receipts
5. **Multi-language Support** - Translation keys in English, Dari, and Pashto
6. **File Validation** - Server-side validation for file type and size
7. **Memory Management** - Proper cleanup of object URLs to prevent memory leaks

## Architecture

### Backend Implementation

#### Database Schema
**Table:** `hawaladars`
```sql
ALTER TABLE hawaladars ADD COLUMN logo TEXT;
```
- **Column:** `logo` - Stores the filename of the uploaded logo
- **Migration:** Applied automatically on startup (v1.2.0)

#### API Endpoint
```
POST /api/hawala/agents/:id/logo
Authorization: Bearer <token> (Admin only)
Content-Type: multipart/form-data
```

**Request:**
```
FormData {
  logo: <File> (JPEG or PNG, max 5MB)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hawaladar Name",
    "logo": "1736730456789-logo.png",
    ...
  }
}
```

#### File Storage
- **Location:** `backend/uploads/logos/`
- **Naming:** `{timestamp}-{originalname}`
- **Cleanup:** Old logos are automatically deleted when new ones are uploaded

#### Multer Configuration
```typescript
const logoUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/logos',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + file.originalname;
      cb(null, uniqueSuffix);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});
```

### Frontend Implementation

#### Component Structure
**File:** `frontend/src/pages/Hawala.tsx`

**State Management:**
```typescript
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string | null>(null);
```

#### UI Components

**Logo Upload Section** (Lines 2004-2101):
```tsx
<Box sx={{ mt: 2 }}>
  <Typography variant="subtitle2">{t('hawala.logo')}</Typography>

  {/* Current Logo Display */}
  {selectedHawaladar?.logo && !logoFile && (
    <Box sx={{ mb: 2 }}>
      <img src={`${API_BASE_URL}/uploads/logos/${selectedHawaladar.logo}`} />
    </Box>
  )}

  {/* New File Preview */}
  {logoPreview && logoFile && (
    <Box sx={{ mb: 2 }}>
      <img src={logoPreview} />
    </Box>
  )}

  {/* Upload Button */}
  <Button component="label">
    {selectedHawaladar?.logo || logoFile ? t('hawala.changeLogo') : t('hawala.uploadLogo')}
    <input type="file" hidden accept="image/jpeg,image/png" onChange={handleFileSelect} />
  </Button>

  {/* Remove Button */}
  {logoFile && <Button onClick={handleRemoveLogo}>{t('hawala.removeLogo')}</Button>}
</Box>
```

#### File Selection Handler
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Clean up old preview URL
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    // Create new preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
  }
};
```

#### Save Flow Integration
```typescript
const handleSaveHawaladar = async () => {
  try {
    // 1. Save hawaladar data
    let hawaladarId: number;
    if (selectedHawaladar) {
      const updated = await updateHawaladar(selectedHawaladar.id, data);
      hawaladarId = updated.id;
    } else {
      const created = await createHawaladar(data);
      hawaladarId = created.id;
    }

    // 2. Upload logo if selected
    if (logoFile) {
      await uploadHawaladarLogo(hawaladarId, logoFile);
      setLogoFile(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
    }

    // 3. Refresh data
    fetchData();
  } catch (err) {
    setError(err.response?.data?.error);
  }
};
```

#### API Service
**File:** `frontend/src/services/api.ts` (Lines 284-298)
```typescript
export const uploadHawaladarLogo = async (id: number, file: File): Promise<Hawaladar> => {
  const formData = new FormData();
  formData.append('logo', file);

  const { data } = await api.post<ApiResponse<Hawaladar>>(
    `/hawala/agents/${id}/logo`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data.data!;
};
```

### Receipt Display

**File:** `frontend/src/pages/HawalaReceipt.tsx` (Lines 122-128)

```tsx
{transaction.sender_hawaladar_logo && (
  <img
    src={getLogoUrl(transaction.sender_hawaladar_logo)}
    alt="Hawaladar Logo"
    style={{ maxHeight: '100px', marginBottom: '16px' }}
  />
)}
```

**Logo URL Helper:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getLogoUrl = (logoFilename?: string): string | undefined => {
  if (!logoFilename) return undefined;
  return `${API_BASE_URL}/uploads/logos/${logoFilename}`;
};
```

## Backend Query Updates

To ensure logo data is available for receipts, all transaction queries now include logo fields:

**Updated Queries:**
1. `getTransactions()` - Line 240
2. `getTransactionById()` - Line 371
3. `getTransactionByCode()` - Line 416

**Added Fields:**
```sql
sh.logo as sender_hawaladar_logo,
sh.phone as sender_hawaladar_phone,
rh.logo as receiver_hawaladar_logo
```

## Translation Keys

### English
```typescript
logo: 'Logo',
uploadLogo: 'Upload Logo',
changeLogo: 'Change Logo',
removeLogo: 'Remove Logo',
logoMaxSize: 'Max size: 5MB (JPEG, PNG)',
currentLogo: 'Current Logo'
```

### Dari (دری)
```typescript
logo: 'لوگو',
uploadLogo: 'بارگذاری لوگو',
changeLogo: 'تغییر لوگو',
removeLogo: 'حذف لوگو',
logoMaxSize: 'حداکثر حجم: ۵ مگابایت (JPEG، PNG)',
currentLogo: 'لوگوی فعلی'
```

### Pashto (پښتو)
```typescript
logo: 'لوګو',
uploadLogo: 'لوګو پورته کول',
changeLogo: 'لوګو بدلول',
removeLogo: 'لوګو لرې کول',
logoMaxSize: 'ډیره کچه: ۵ مګابایټ (JPEG، PNG)',
currentLogo: 'اوسنی لوګو'
```

## Type Definitions

### Backend Types
**File:** `backend/src/types/index.ts`

```typescript
export interface Hawaladar {
  id: number;
  name: string;
  logo?: string;
  // ... other fields
}

export interface HawalaTransactionWithDetails extends HawalaTransaction {
  sender_hawaladar_logo?: string;
  sender_hawaladar_phone?: string;
  receiver_hawaladar_logo?: string;
  // ... other fields
}
```

### Frontend Types
**File:** `frontend/src/types/index.ts`

```typescript
export interface Hawaladar {
  id: number;
  name: string;
  logo?: string;
  // ... other fields
}

export interface HawalaTransaction {
  sender_hawaladar_logo?: string;
  sender_hawaladar_phone?: string;
  receiver_hawaladar_logo?: string;
  // ... other fields
}
```

## User Flow

### Admin - Upload Logo

1. Navigate to **Hawala → Agents** tab
2. Click **Edit** on a hawaladar (or add new)
3. Scroll to **Logo** section in dialog
4. Click **Upload Logo** (or **Change Logo** if one exists)
5. Select JPEG or PNG file (max 5MB)
6. **Preview appears immediately** with blue border
7. Click **Save** to upload
8. Logo is uploaded and dialog closes
9. Table refreshes with updated data

### Customer - View Logo on Receipt

1. Admin creates hawala transaction with a hawaladar that has a logo
2. Click **Receipt** icon (📄) on the transaction
3. **Logo displays at top** of receipt above hawaladar name
4. Click **Print Receipt** to print with logo included

## Memory Management

**Object URL Lifecycle:**
- Created: `URL.createObjectURL(file)` when file selected
- Used: Display preview in `<img src={logoPreview}>`
- Cleaned: `URL.revokeObjectURL(logoPreview)` when:
  - New file selected (replaces old preview)
  - Logo removed (cancel selection)
  - Upload completed successfully
  - Dialog closed

**Why This Matters:**
- Object URLs hold file data in memory
- Must be manually released to prevent memory leaks
- Browser automatically cleans on page unload, but good practice to clean explicitly

## Security

### File Validation
- **Type Check:** Only JPEG and PNG allowed via Multer filter
- **Size Check:** 5MB maximum file size
- **Authorization:** Admin-only endpoint with JWT verification

### File Naming
- Timestamp-based unique filenames prevent overwrites
- Original filename sanitized to prevent path traversal

### Old File Cleanup
```typescript
// Delete old logo if exists
if (existing.logo) {
  const oldLogoPath = path.join(__dirname, '../../uploads/logos', existing.logo);
  if (fs.existsSync(oldLogoPath)) {
    fs.unlinkSync(oldLogoPath);
  }
}
```

## Troubleshooting

### Logo Not Showing in Dialog

**Issue:** Current logo doesn't display when editing.

**Solution:**
- Verify `selectedHawaladar?.logo` has a value
- Check API_BASE_URL is set correctly
- Check network tab for 404 errors on logo URL
- Verify file exists in `backend/uploads/logos/`

### Preview Not Appearing

**Issue:** Selected file preview doesn't show.

**Solution:**
- Check `logoPreview` state is set
- Verify `URL.createObjectURL()` is being called
- Check browser console for errors
- Ensure file is valid image format

### Logo Not Showing in Receipt

**Issue:** Receipt doesn't display hawaladar logo.

**Solution:**
- Verify transaction has `sender_hawaladar_logo` field
- Check backend queries include logo fields
- Verify logo file exists on server
- Check API_BASE_URL in HawalaReceipt.tsx

### Upload Fails with 413 Error

**Issue:** File too large error.

**Solution:**
- Verify file is under 5MB
- Check Multer limits configuration
- Resize image before uploading

## Future Enhancements

### Potential Features
- [ ] Image cropping/resizing in browser before upload
- [ ] Logo templates or default logos
- [ ] Bulk logo upload for multiple hawaladars
- [ ] Logo watermarking on receipts
- [ ] Multiple logo sizes (thumbnail, full)
- [ ] Logo preview in hawaladar list table
- [ ] WebP format support for smaller file sizes

### Performance Optimizations
- [ ] Lazy loading logos in tables
- [ ] Client-side image compression before upload
- [ ] CDN integration for logo serving
- [ ] Cache-Control headers for logo URLs

## Testing Checklist

### Upload Functionality
- [ ] Upload new logo for new hawaladar
- [ ] Upload logo for existing hawaladar without logo
- [ ] Change logo for hawaladar with existing logo
- [ ] Remove selected file before saving
- [ ] Cancel dialog without saving
- [ ] Verify old logo deleted after change

### Preview Display
- [ ] Preview shows immediately after file selection
- [ ] Current logo displays when editing
- [ ] New preview replaces current logo display
- [ ] Preview clears when file removed
- [ ] Preview has blue border to distinguish from current logo

### Receipt Display
- [ ] Logo appears on receipt for transactions with logo
- [ ] Receipt gracefully handles missing logo
- [ ] Logo prints correctly
- [ ] Logo scales appropriately
- [ ] Multiple language receipts show logo correctly

### Error Handling
- [ ] File too large error displayed
- [ ] Invalid file type error shown
- [ ] Network error handled gracefully
- [ ] Non-admin user blocked from upload

## Related Files

### Backend
- `backend/src/controllers/hawalaController.ts` - Upload handler and queries
- `backend/src/middleware/upload.ts` - Multer configuration
- `backend/src/routes/hawala.ts` - Route definition
- `backend/src/types/index.ts` - Type definitions
- `backend/uploads/logos/` - Storage directory

### Frontend
- `frontend/src/pages/Hawala.tsx` - Upload UI
- `frontend/src/pages/HawalaReceipt.tsx` - Display in receipts
- `frontend/src/services/api.ts` - API client
- `frontend/src/types/index.ts` - Type definitions
- `frontend/src/i18n/translations.ts` - Translation keys

### Documentation
- `CHANGELOG.md` - Version 1.2.1 changes
- `README.md` - Feature overview
- `docs/LOGO_UPLOAD.md` - This file

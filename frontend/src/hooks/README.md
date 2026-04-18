# Custom Hooks

This directory contains reusable custom React hooks that encapsulate common logic patterns used throughout the application.

## Available Hooks

### `useCollapsibleSidebar`

Manages collapsible sidebar state with localStorage persistence.

**Usage:**
```typescript
import { useCollapsibleSidebar } from '../hooks';

const { isOpen, toggle, open, close } = useCollapsibleSidebar('mySidebarKey');
```

**Parameters:**
- `storageKey` (string): Unique key for localStorage persistence
- `options` (object, optional):
  - `defaultOpen` (boolean): Initial open state (default: `true`)

**Returns:**
- `isOpen` (boolean): Current sidebar state
- `toggle` (): Toggle sidebar open/closed
- `open` (): Open the sidebar
- `close` (): Close the sidebar

**Example:**
```typescript
const { isOpen, toggle } = useCollapsibleSidebar('hawala-sidebar');

<IconButton onClick={toggle}>
  {isOpen ? <ChevronLeft /> : <ChevronRight />}
</IconButton>
```

---

### `useFetch`

Handles data fetching with loading, error states, and refetch capability.

**Usage:**
```typescript
import { useFetch } from '../hooks';

const { data, loading, error, refetch } = useFetch(
  () => getMarkets(),
  {
    onSuccess: (data) => console.log('Success!', data),
    onError: (error) => console.error('Error:', error)
  }
);
```

**Parameters:**
- `fetchFn` (() => Promise<T>): Async function that returns data
- `options` (object, optional):
  - `onSuccess` ((data: T) => void): Callback on successful fetch
  - `onError` ((error: any) => void): Callback on error
  - `initialData` (T): Initial data value
  - `enabled` (boolean): Whether to auto-fetch (default: `true`)

**Returns:**
- `data` (T | null): Fetched data
- `loading` (boolean): Loading state
- `error` (string | null): Error message
- `refetch` (() => Promise<void>): Manually refetch data
- `setData` ((data: T | null) => void): Manually set data

**Example:**
```typescript
const { data: rates, loading, error, refetch } = useFetch(
  () => getExchangeRates(marketId),
  { enabled: marketId !== null }
);

if (loading) return <Loading />;
if (error) return <Alert severity="error">{error}</Alert>;
```

---

### `useMobileNav`

Manages mobile navigation drawer state and responsive breakpoints.

**Usage:**
```typescript
import { useMobileNav } from '../hooks';

const { isMobile, mobileOpen, handleDrawerToggle, closeMobileDrawer } = useMobileNav();
```

**Returns:**
- `isMobile` (boolean): True if screen is below 'md' breakpoint
- `mobileOpen` (boolean): Mobile drawer open state
- `handleDrawerToggle` (): Toggle mobile drawer
- `closeMobileDrawer` (): Close mobile drawer
- `openMobileDrawer` (): Open mobile drawer

**Example:**
```typescript
const { isMobile, mobileOpen, handleDrawerToggle } = useMobileNav();

{isMobile && (
  <IconButton onClick={handleDrawerToggle}>
    <MenuIcon />
  </IconButton>
)}

<Drawer open={mobileOpen} onClose={handleDrawerToggle}>
  {/* Drawer content */}
</Drawer>
```

---

### `useCrudState`

Centralized state management for CRUD operations (Create, Read, Update, Delete).

**Usage:**
```typescript
import { useCrudState } from '../hooks';

const {
  editDialog,
  createDialog,
  selectedItem,
  error,
  formData,
  openEdit,
  openCreate,
  closeEdit,
  setError,
  updateFormData
} = useCrudState<MyType>({ name: '', value: 0 });
```

**Parameters:**
- `initialFormData` (Partial<T>): Initial form data structure

**Returns:**
- `editDialog` (boolean): Edit dialog open state
- `createDialog` (boolean): Create dialog open state
- `deleteDialog` (boolean): Delete dialog open state
- `selectedItem` (T | null): Currently selected item
- `error` (string): Error message
- `formData` (Partial<T>): Current form data
- `openEdit` ((item: T) => void): Open edit dialog with item
- `openCreate` (): Open create dialog
- `openDelete` ((item: T) => void): Open delete dialog
- `closeEdit` (): Close edit dialog and reset
- `closeCreate` (): Close create dialog and reset
- `closeDelete` (): Close delete dialog
- `closeAll` (): Close all dialogs and reset
- `setError` ((error: string) => void): Set error message
- `clearError` (): Clear error message
- `updateFormData` ((data: Partial<T>) => void): Update form data
- `resetFormData` (): Reset form to initial data

**Example:**
```typescript
const {
  editDialog,
  selectedItem,
  formData,
  openEdit,
  closeEdit,
  updateFormData
} = useCrudState<ExchangeRate>({ buy_rate: 0, sell_rate: 0 });

// Open edit dialog
<IconButton onClick={() => openEdit(rate)}>
  <Edit />
</IconButton>

// In dialog
<Dialog open={editDialog} onClose={closeEdit}>
  <TextField
    value={formData.buy_rate}
    onChange={(e) => updateFormData({ buy_rate: parseFloat(e.target.value) })}
  />
</Dialog>
```

---

## Best Practices

1. **Use hooks at component top level** - Never call hooks conditionally or in loops
2. **Provide descriptive storage keys** - Use unique, descriptive keys for localStorage hooks
3. **Handle loading and error states** - Always check loading/error from `useFetch`
4. **Clean up effects** - Hooks handle cleanup internally, but be mindful of dependencies
5. **TypeScript types** - Provide generic types for type-safe hook usage

---

## Import Shortcut

All hooks are exported from the index file for convenient importing:

```typescript
import {
  useCollapsibleSidebar,
  useFetch,
  useMobileNav,
  useCrudState
} from '../hooks';
```

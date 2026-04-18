# Common Components

This directory contains reusable UI components used throughout the application.

## Available Components

### `CollapsibleSidebar`

A reusable collapsible sidebar with tooltips, icons, and responsive behavior.

**Props:**
```typescript
interface CollapsibleSidebarProps {
  title: string;                    // Sidebar header title
  items: SidebarMenuItem[];         // Menu items to display
  isOpen: boolean;                  // Sidebar open/closed state
  onToggle: () => void;            // Toggle callback
  headerBgColor?: string;          // Header background color (default: '#1e3a5f')
  collapsedWidth?: number;         // Width when collapsed (default: 70px)
  expandedWidth?: number;          // Width when expanded (default: 250px)
  renderSubItems?: (item: SidebarMenuItem) => ReactNode;  // Custom sub-item renderer
}

interface SidebarMenuItem {
  id: string | number;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  selected?: boolean;
  subItems?: SidebarMenuItem[];
  expanded?: boolean;  // For items with subItems, controls expand/collapse icon
}
```

**Usage:**
```typescript
import { CollapsibleSidebar, type SidebarMenuItem } from '../components/common/CollapsibleSidebar';

const menuItems: SidebarMenuItem[] = [
  {
    id: 1,
    label: 'Dashboard',
    icon: <Dashboard />,
    onClick: () => navigate('/dashboard'),
    selected: location.pathname === '/dashboard'
  },
  // ... more items
];

<CollapsibleSidebar
  title="Menu"
  items={menuItems}
  isOpen={sidebarOpen}
  onToggle={toggleSidebar}
/>
```

---

### `HoverCard`

Card component with hover effects for feature showcases.

**Props:**
```typescript
interface HoverCardProps {
  icon: ReactNode;       // Icon to display
  title: string;         // Card title
  description: string;   // Card description
  onClick?: () => void;  // Optional click handler
}
```

**Usage:**
```typescript
import { HoverCard } from '../components/common/HoverCard';

<HoverCard
  icon={<Dashboard />}
  title="Dashboard"
  description="View your dashboard and analytics"
  onClick={() => navigate('/dashboard')}
/>
```

---

### `StatCard`

Statistics display card with customizable colors and icons.

**Props:**
```typescript
interface StatCardProps {
  label: string;          // Stat label
  value: string | number; // Stat value
  icon?: ReactNode;       // Optional icon
  bgColor?: string;       // Background color (default: '#e3f2fd')
  valueColor?: string;    // Value text color (default: 'primary.main')
  isMobile?: boolean;     // Mobile layout flag (default: false)
}
```

**Usage:**
```typescript
import { StatCard } from '../components/common/StatCard';

<StatCard
  label="Total Sales"
  value={1234}
  icon={<TrendingUp />}
  bgColor="#e8f5e9"
  valueColor="success.main"
/>
```

---

### `DialogFooter`

Reusable dialog action buttons (Cancel/Confirm).

**Props:**
```typescript
interface DialogFooterProps {
  onCancel: () => void;                  // Cancel button handler
  onConfirm: () => void;                 // Confirm button handler
  confirmLabel?: string;                 // Confirm button text (default: 'Save')
  cancelLabel?: string;                  // Cancel button text (default: 'Cancel')
  confirmColor?: 'primary' | 'error' | ...; // Confirm button color
  loading?: boolean;                     // Loading state
  disabled?: boolean;                    // Disabled state
}
```

**Usage:**
```typescript
import { DialogFooter } from '../components/common/DialogFooter';

<Dialog open={dialogOpen} onClose={handleClose}>
  <DialogTitle>Edit Item</DialogTitle>
  <DialogContent>
    {/* Dialog content */}
  </DialogContent>
  <DialogFooter
    onCancel={handleClose}
    onConfirm={handleSave}
    confirmLabel="Save Changes"
    loading={saving}
  />
</Dialog>
```

---

### `DraggableDialog` & `DraggableDialogTitle`

Dialog components that can be dragged by the title bar.

**Usage:**
```typescript
import { DraggableDialog } from '../components/common/DraggableDialog';
import { DraggableDialogTitle } from '../components/common/DraggableDialogTitle';

<DraggableDialog open={open} onClose={onClose}>
  <DraggableDialogTitle>
    Drag Me!
  </DraggableDialogTitle>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</DraggableDialog>
```

**Features:**
- Drag by title bar to reposition
- Uses `react-draggable` with `nodeRef` for React 18 compatibility
- Prevents dragging from dialog content area
- All standard MUI Dialog props supported

---

## Styling Guidelines

All common components follow these principles:

1. **Material-UI Design System** - Uses MUI theme and components
2. **Responsive** - Mobile-first design with breakpoints
3. **Customizable** - Props for colors, sizes, and behavior
4. **Accessible** - ARIA labels and keyboard navigation
5. **TypeScript** - Full type safety with exported interfaces

---

## Component Composition

These components are designed to be composed together:

```typescript
// Example: Page with collapsible sidebar and stat cards
<Box sx={{ display: 'flex' }}>
  <CollapsibleSidebar
    title="Navigation"
    items={menuItems}
    isOpen={sidebarOpen}
    onToggle={toggleSidebar}
  />

  <Box sx={{ flex: 1, p: 3 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <StatCard
          label="Active Users"
          value={users.length}
          bgColor="#e3f2fd"
        />
      </Grid>
      {/* More stat cards */}
    </Grid>
  </Box>
</Box>
```

---

## Future Enhancements

Potential additions to the common components library:

- `ConfirmDialog` - Confirmation dialog with action buttons
- `LoadingOverlay` - Full-page loading indicator
- `EmptyState` - Empty state placeholder with icon and message
- `ErrorBoundary` - Error boundary wrapper component
- `Toast` - Toast notification system

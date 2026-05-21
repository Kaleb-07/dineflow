# 🎨 Complete shadcn/ui Integration Guide

## ✅ What's Been Set Up

### 1. Dependencies Installed
```bash
✅ @tanstack/react-table - Table functionality
✅ class-variance-authority - Component variants
✅ clsx & tailwind-merge - ClassName utilities
```

### 2. UI Components Created
```
✅ components/ui/table.tsx - Table components
✅ components/ui/button.tsx - Button with variants
✅ components/ui/checkbox.tsx - Checkbox for selection
✅ components/ui/input.tsx - Input for search
✅ components/ui/dropdown-menu.tsx - Dropdown menus
✅ lib/utils.ts - Utility functions
✅ components/DataTable.tsx - Reusable data table
```

---

## 🚀 How to Use

### Option 1: Keep Current UI (Recommended for Now)

Your current MenuPage is already well-designed. The shadcn/ui components are ready when you need them for:
- New features
- More complex tables
- Better sorting/filtering needs

### Option 2: Upgrade to Data Tables

Replace current list views with professional data tables:

**Benefits:**
- ✅ Built-in sorting
- ✅ Column filtering
- ✅ Pagination
- ✅ Row selection
- ✅ Column visibility toggle
- ✅ Professional look

**When to upgrade:**
- When you have 50+ items
- When customers request advanced filtering
- When you need bulk actions

---

## 📝 Example: Menu Items Table

Here's how to use the DataTable component:

```tsx
import { DataTable } from '../components/DataTable';
import { type ColumnDef } from '@tanstack/react-table';

// Define columns
const columns: ColumnDef<MenuItem>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  // ... more columns
];

// Use in component
<DataTable
  columns={columns}
  data={items}
  searchKey="name"
  searchPlaceholder="Search items..."
/>
```

---

## 🎨 Styling

All components are pre-styled to match your dark theme:
- Background: `bg-gray-900`
- Borders: `border-gray-800`
- Text: `text-white` / `text-gray-400`
- Accent: `bg-amber-500` / `text-amber-400`
- Hover: `hover:bg-gray-800`

---

## 📦 Available Components

### Button
```tsx
import { Button } from './components/ui/button';

<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input
```tsx
import { Input } from './components/ui/input';

<Input placeholder="Search..." />
<Input type="email" />
<Input disabled />
```

### Checkbox
```tsx
import { Checkbox } from './components/ui/checkbox';

<Checkbox checked={true} onCheckedChange={(checked) => {}} />
```

### Dropdown Menu
```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Table
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>$10</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🔄 Migration Path

### Phase 1: Use New Components in New Features
- Use Button, Input, Checkbox in new modals
- Keep existing pages as-is
- Gradual adoption

### Phase 2: Upgrade High-Traffic Pages
- Start with MenuPage (most used)
- Then ReviewsPage
- Then QRPage

### Phase 3: Full Migration
- Replace all custom components
- Consistent UI across app
- Easier maintenance

---

## 💡 Best Practices

### 1. Use DataTable for Lists
```tsx
// ❌ Don't: Manual list rendering
{items.map(item => (
  <div key={item.id}>...</div>
))}

// ✅ Do: Use DataTable
<DataTable columns={columns} data={items} />
```

### 2. Use Button Component
```tsx
// ❌ Don't: Custom button classes
<button className="bg-amber-500 hover:bg-amber-400...">

// ✅ Do: Use Button component
<Button>Click me</Button>
```

### 3. Use Dropdown for Actions
```tsx
// ❌ Don't: Multiple action buttons
<button>Edit</button>
<button>Delete</button>
<button>Duplicate</button>

// ✅ Do: Use dropdown menu
<DropdownMenu>
  <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎯 Quick Wins

### 1. Replace Buttons
Find all custom buttons and replace with `<Button>`:

```tsx
// Before
<button className="flex items-center gap-1.5 px-3 py-2 bg-amber-500...">
  <Plus size={15} /> Add item
</button>

// After
<Button>
  <Plus size={15} /> Add item
</Button>
```

### 2. Replace Inputs
Find all custom inputs and replace with `<Input>`:

```tsx
// Before
<input className="w-full bg-gray-800 border border-gray-700..." />

// After
<Input />
```

### 3. Add Dropdowns to Action Buttons
Replace edit/delete button groups with dropdown menus.

---

## 📊 Example: Complete Menu Items Table

See `MenuPageWithTable.tsx` for a complete example with:
- ✅ Sortable columns
- ✅ Search/filter
- ✅ Pagination
- ✅ Row selection
- ✅ Column visibility
- ✅ Action dropdown
- ✅ Image preview
- ✅ Status badges

---

## 🐛 Troubleshooting

### TypeScript Errors
If you see TypeScript errors, make sure:
1. `tsconfig.json` has `"jsx": "react-jsx"`
2. All imports are correct
3. Types are properly defined

### Styling Issues
If components don't look right:
1. Check Tailwind is configured
2. Verify `cn()` utility is imported
3. Check dark mode classes

### Table Not Rendering
If DataTable doesn't show:
1. Check `data` prop has items
2. Verify `columns` are defined correctly
3. Check console for errors

---

## 📚 Resources

### Official Docs
- shadcn/ui: https://ui.shadcn.com
- TanStack Table: https://tanstack.com/table
- Tailwind CSS: https://tailwindcss.com

### Examples
- `components/DataTable.tsx` - Reusable table
- `pages/MenuPageWithTable.tsx` - Complete example
- `components/ui/*` - All UI components

---

## 🎉 Summary

**What You Have:**
- ✅ Professional UI components
- ✅ Reusable DataTable
- ✅ Dark theme styling
- ✅ TypeScript support
- ✅ Production-ready

**What to Do:**
1. **Now**: Use components in new features
2. **Later**: Gradually migrate existing pages
3. **Future**: Full shadcn/ui integration

**Your app now has enterprise-grade UI components!** 🚀

---

## 🔥 Next Steps

### Immediate (Optional)
1. Try Button component in one page
2. Test DataTable with sample data
3. Experiment with styling

### Short-term (When Needed)
1. Upgrade MenuPage to use DataTable
2. Add more shadcn/ui components (Dialog, Select, etc.)
3. Create custom variants

### Long-term (After Launch)
1. Full migration to shadcn/ui
2. Custom component library
3. Design system documentation

**Focus on launching first. Upgrade UI later based on customer feedback!**

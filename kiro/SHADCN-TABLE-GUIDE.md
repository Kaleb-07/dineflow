# 📊 shadcn/ui Table Components Guide

## Overview

I've installed shadcn/ui-style table components in your DineFlow project. These components work with TanStack Table (React Table v8) for powerful data tables with sorting, filtering, pagination, and column visibility.

---

## ✅ What's Installed

### Dependencies
- ✅ `@tanstack/react-table` - Headless table library
- ✅ `class-variance-authority` - For component variants
- ✅ `clsx` - Utility for conditional classes
- ✅ `tailwind-merge` - Merge Tailwind classes

### Components Created
- ✅ `components/ui/table.tsx` - Table, TableHeader, TableBody, TableRow, TableCell, etc.
- ✅ `components/ui/button.tsx` - Button with variants (default, outline, ghost, etc.)
- ✅ `components/ui/checkbox.tsx` - Checkbox for row selection
- ✅ `components/ui/input.tsx` - Input for search/filter
- ✅ `components/ui/dropdown-menu.tsx` - Dropdown for column visibility
- ✅ `lib/utils.ts` - Utility function for class merging

---

## 🚀 Quick Start Example

### Basic Table for Menu Items

Create `frontend/src/components/MenuItemsTable.tsx`:

```tsx
import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { MenuItem } from "../types";

interface MenuItemsTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

export default function MenuItemsTable({ items, onEdit, onDelete }: MenuItemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const item = row.original;
        return <div>{item.category?.name || "—"}</div>;
      },
    },
    {
      accessorKey: "variants",
      header: "Price",
      cell: ({ row }) => {
        const item = row.original;
        const prices = item.variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return (
          <div className="text-amber-400">
            {min === max ? `${min} ETB` : `${min}-${max} ETB`}
          </div>
        );
      },
    },
    {
      accessorKey: "isAvailable",
      header: "Status",
      cell: ({ row }) => (
        <div className={row.getValue("isAvailable") ? "text-green-400" : "text-gray-500"}>
          {row.getValue("isAvailable") ? "Available" : "Unavailable"}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-800">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No menu items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

---

## 📋 Features Included

### 1. Sorting
Click column headers to sort ascending/descending.

```tsx
{
  accessorKey: "name",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Name
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
}
```

### 2. Filtering
Add search input to filter rows.

```tsx
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

// In table config
onColumnFiltersChange: setColumnFilters,
getFilteredRowModel: getFilteredRowModel(),
state: {
  columnFilters,
},

// Search input
<Input
  placeholder="Search items..."
  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
  onChange={(event) =>
    table.getColumn("name")?.setFilterValue(event.target.value)
  }
  className="max-w-sm"
/>
```

### 3. Row Selection
Add checkboxes to select rows.

```tsx
const [rowSelection, setRowSelection] = useState({});

// Checkbox column
{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
}

// In table config
onRowSelectionChange: setRowSelection,
state: {
  rowSelection,
},

// Show selected count
<div className="text-sm text-gray-400">
  {table.getFilteredSelectedRowModel().rows.length} of{" "}
  {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```

### 4. Column Visibility
Toggle which columns are visible.

```tsx
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

// In table config
onColumnVisibilityChange: setColumnVisibility,
state: {
  columnVisibility,
},

// Column visibility dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      Columns <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {table
      .getAllColumns()
      .filter((column) => column.getCanHide())
      .map((column) => (
        <DropdownMenuCheckboxItem
          key={column.id}
          className="capitalize"
          checked={column.getIsVisible()}
          onCheckedChange={(value) => column.toggleVisibility(!!value)}
        >
          {column.id}
        </DropdownMenuCheckboxItem>
      ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### 5. Pagination
Navigate through pages of data.

```tsx
// In table config
getPaginationRowModel: getPaginationRowModel(),

// Pagination controls
<div className="flex items-center justify-end space-x-2 py-4">
  <Button
    variant="outline"
    size="sm"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    Next
  </Button>
</div>
```

---

## 🎨 Component Variants

### Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

---

## 💡 Usage in Your Project

### Replace MenuPage Table

You can replace the current menu items list in `MenuPage.tsx` with the new table component:

```tsx
import MenuItemsTable from '../components/MenuItemsTable';

// In MenuPage component
<MenuItemsTable
  items={items}
  onEdit={(item) => { setEditItem(item); setItemModal(true); }}
  onDelete={deleteItem}
/>
```

### Reviews Table

Create a table for reviews:

```tsx
const columns: ColumnDef<Review>[] = [
  {
    accessorKey: "guestName",
    header: "Guest",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex gap-0.5">
        {Array.from({ length: row.getValue("rating") }).map((_, i) => (
          <span key={i} className="text-amber-400">★</span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "isVisible",
    header: "Visible",
    cell: ({ row }) => (
      <div className={row.getValue("isVisible") ? "text-green-400" : "text-g
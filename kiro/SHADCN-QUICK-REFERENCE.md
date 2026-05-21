# shadcn/ui Quick Reference

## 🚀 Quick Start

### Import Components
```tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/DataTable';
import { type ColumnDef } from '@tanstack/react-table';
```

---

## 📊 DataTable Usage

### Basic Example
```tsx
const columns: ColumnDef<YourType>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

<DataTable
  columns={columns}
  data={yourDa
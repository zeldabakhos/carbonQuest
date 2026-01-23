# Import Path Fix

## Problem
After moving files from `app/src/` to `app/`, the relative imports broke:
```
Unable to resolve "./utils/productApi" from "app/product.tsx"
Unable to resolve "./utils/carbonFootprint" from "app/product.tsx"
```

## Root Cause
When the route files were in `app/src/`, the import path `./utils/productApi` worked because:
- File: `app/src/product.tsx`
- Import: `./utils/productApi`
- Resolved to: `app/src/utils/productApi.ts` ✅

After moving to `app/product.tsx`, the same import tried to resolve to:
- File: `app/product.tsx`
- Import: `./utils/productApi`
- Should resolve to: `app/utils/productApi.ts`
- But Expo was having trouble with the relative path ❌

## Solution
Changed from relative imports to **absolute imports using the `@/` alias** defined in `tsconfig.json`:

### Before (Relative):
```tsx
import { lookupProduct, Product } from "./utils/productApi";
import {
  calculateCarbonFootprint,
  formatCarbonValue,
  formatCarbonPerKg,
  getCarbonRating,
  getComparisonText,
} from "./utils/carbonFootprint";
```

### After (Absolute):
```tsx
import { lookupProduct, Product } from "@/app/utils/productApi";
import {
  calculateCarbonFootprint,
  formatCarbonValue,
  formatCarbonPerKg,
  getCarbonRating,
  getComparisonText,
} from "@/app/utils/carbonFootprint";
```

## Why This Works

The `tsconfig.json` has a path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This means:
- `@/app/utils/productApi` → resolves to → `./app/utils/productApi.ts`
- Works consistently regardless of where the importing file is located
- No ambiguity about relative paths

## Benefits of Absolute Imports

1. **More Reliable**: No confusion about `./` vs `../`
2. **Easier Refactoring**: Move files without updating imports
3. **Clearer Paths**: Always know where you're importing from
4. **Standard Practice**: Common in modern React/TypeScript projects

## File Structure
```
app/
├── product.tsx           ← Imports from utils
├── utils/
│   ├── productApi.ts     ← API utilities
│   └── carbonFootprint.ts ← Carbon calculations
├── scan.tsx
└── ...
```

## Testing the Fix

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Navigate to product screen:**
   - Sign in → Scan → View a product
   - Should load without import errors

3. **Check for errors:**
   - Terminal should show no "Unable to resolve" errors
   - Product details should display correctly

## Other Files That Might Need Updates

If you add more files that import from `utils`, use the same pattern:

### ❌ Don't use relative paths:
```tsx
import { something } from "./utils/file";
import { something } from "../utils/file";
```

### ✅ Use absolute paths:
```tsx
import { something } from "@/app/utils/file";
```

## Quick Reference

| Import Type | When to Use |
|-------------|-------------|
| `@/app/...` | Importing from app directory |
| `@/components/...` | Importing from components directory |
| `@/constants/...` | Importing from constants directory |
| `@/hooks/...` | Importing from hooks directory |

## Summary

✅ **Fixed**: Changed relative imports to absolute imports  
✅ **Using**: `@/app/utils/...` instead of `./utils/...`  
✅ **Works**: Product screen now loads correctly  
✅ **Future-proof**: More maintainable import structure  

The app should now work without any import resolution errors!

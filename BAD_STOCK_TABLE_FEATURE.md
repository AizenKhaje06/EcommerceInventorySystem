# Bad Stock Table - Specialized View

## Feature Overview
Created a specialized table view for **Bad Stock** items in the Inventory/Products page that shows a breakdown of bad items by reason category in separate columns.

## Implementation

### Location
`app/dashboard/inventory/page.tsx`

### When Activated
The specialized table automatically displays when:
- User selects **"Bad Stock"** from the Status filter dropdown

### Table Structure

**NORMAL VIEW** (All Status / Good Stock):
- Image | Product | Category | Status | Stock | Cost | Price | Margin | Actions

**BAD STOCK VIEW** (Specialized):
- Image | Item Name | Damaged | Defective | Expired | Customer Return | Lost | Other | Total Bad | Cost | COGS Lost

### Column Breakdown

#### 1. **Image**
- Product image with red border to indicate bad stock
- Shows placeholder icon if no image

#### 2. **Item Name**
- Product name in bold
- Shows main bad item reason below name in red text

#### 3. **Reason Columns** (Aggregated categories):

**Damaged** (Red badge):
- `damaged`, `damage`
- `water-damage`
- `broken-packaging`
- `pest-damage`
- `mishandling`

**Defective** (Orange badge):
- `defective`, `defect`
- `quality-failed`
- `quality-rejection`
- `missing-parts`

**Expired** (Yellow badge):
- `expired`
- `obsolete`
- `spoilage`
- `contaminated`

**Customer Return** (Blue badge):
- `customer-return`
- `customer-return-defective`

**Lost** (Purple badge):
- `lost`
- `theft-loss`

**Other** (Gray badge):
- `other`
- `supplier-return`
- `incorrect-storage`

#### 4. **Total Bad**
- Bold white text on red background
- Sum of all bad item quantities

#### 5. **Cost**
- Unit cost price per item
- Format: ₱XX.XX

#### 6. **COGS Lost**
- **Total cost of goods lost**
- Calculation: `Total Bad Qty × Cost Price`
- Format: ₱XX.XX in bold red
- Shows the financial impact of bad inventory

### Visual Features

**Color Coding:**
- Damaged: Red
- Defective: Orange
- Expired: Yellow
- Customer Return: Blue
- Lost: Purple
- Other: Gray
- Empty cells: Light gray with dash (-)

**Badges:**
- Each reason column uses colored badges
- Only shows numbers when > 0
- Shows "-" when quantity is 0

**Row Highlighting:**
- Hover: Light background
- Selected: Red tinted background with red ring (instead of blue)

### Benefits

✅ **Quick Analysis** - See all bad stock reasons at a glance
✅ **Pattern Identification** - Easily spot common issues (e.g., many "damaged" = packaging problem)
✅ **Financial Impact** - COGS Lost column shows total money lost per item
✅ **Better Decision Making** - Data-driven inventory management decisions
✅ **Aggregated Categories** - Similar reasons grouped together for clarity

### Example Usage

**Scenario:** Product has bad items from multiple reasons:
- Damaged: 10 units
- Defective: 5 units
- Customer Return: 3 units
- Cost Price: ₱100

**Table Display:**
```
| Image | Item Name          | Damaged | Defective | Expired | Customer Return | Lost | Other | Total Bad | Cost    | COGS Lost  |
|-------|-------------------|---------|-----------|---------|----------------|------|-------|-----------|---------|------------|
| 📦    | Product XYZ       |   10    |     5     |    -    |       3        |  -   |   -   |    18     | ₱100.00 | ₱1,800.00  |
|       | Main: Damaged     |         |           |         |                |      |       |           |         |            |
```

### Data Source

The breakdown data comes from the `bad_items_breakdown` JSONB field in the inventory table, which is automatically populated when items are reduced using the `/api/items/[id]/reduce` endpoint.

### Compatibility

- ✅ Works with existing bad item tracking system
- ✅ Backward compatible with legacy reason names
- ✅ Responsive design with horizontal scroll on mobile
- ✅ Dark mode support
- ✅ No breaking changes to normal table view

### Testing

To test the feature:
1. Go to Inventory/Products page
2. Select **"Bad Stock"** from Status filter
3. Table should automatically switch to specialized view
4. Verify columns show correct breakdown
5. Check COGS Lost calculation
6. Switch back to "All Status" - should show normal table

### Future Enhancements (Optional)

- Add export to CSV with bad stock breakdown
- Add summary row showing totals for each reason category
- Add filtering by specific bad item reason
- Add chart visualization of bad stock distribution
- Add trends over time for bad stock reasons

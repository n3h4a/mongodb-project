# Scenario A1: Online Store Inventory Update

**Syllabus focus:** Unit 1: Updating documents (`$set`, `$inc`, `$unset`, replace), deleting documents, aggregation basics
**Database / Collection:** `shopDB.products`

All queries for this scenario in one file: [`solution.js`](solution.js)

---

## Question

### Scenario

You are the database assistant of a small online electronics store. All products are stored in the `products` collection. This week the owner wants you to correct a price, update stock, clean an unwanted field, replace one outdated product record, remove discontinued items and finally prepare a small stock summary.

Insert the following sample data before starting the tasks.

```js
use shopDB
db.products.insertMany([
  { _id: 1, name: "Wireless Mouse", category: "Accessories", price: 800,
    stock: 50, discontinued: false, oldCode: "WM-01" },
  { _id: 2, name: "Keyboard", category: "Accessories", price: 1500,
    stock: 30, discontinued: false, oldCode: "KB-02" },
  { _id: 3, name: "USB Cable", category: "Accessories", price: 200,
    stock: 100, discontinued: false },
  { _id: 4, name: "Laptop", category: "Computers", price: 55000,
    stock: 10, discontinued: false },
  { _id: 5, name: "Monitor", category: "Computers", price: 12000,
    stock: 15, discontinued: false },
  { _id: 6, name: "Old Floppy Drive", category: "Computers", price: 300,
    stock: 0, discontinued: true },
  { _id: 7, name: "Dial-up Modem", category: "Computers", price: 500,
    stock: 0, discontinued: true },
  { _id: 8, name: "CD Drive", category: "Computers", price: 400,
    stock: 0, discontinued: true }
])
```

### Requirements

1. Change the price of the product "Keyboard" to 1400 using `$set`.
2. Add 25 units to the stock of "Wireless Mouse" using `$inc`.
3. Remove the obsolete field `oldCode` from every product using `$unset`.
4. Replace the complete document of `_id: 3` (USB Cable) with a new document: name "USB-C Cable", category "Accessories", price 350, stock 100, discontinued false.
5. Delete the single product named "Old Floppy Drive".
6. Delete all remaining products that are marked `discontinued: true`.
7. Using aggregation, consider only products with price 500 or more, and show for each category the total stock and the average price. The category with the highest total stock must appear first.

---

## Solution

### Task 1: Change a price with `$set`

```js
db.products.updateOne(
  { name: "Keyboard" },
  { $set: { price: 1400 } }
)
```

**Output**
```js
{ acknowledged: true, insertedId: null, matchedCount: 1,
  modifiedCount: 1, upsertedCount: 0 }
```

Check: `db.products.findOne({ name: "Keyboard" })` now shows `price: 1400`.

**Explanation:** `$set` changes only the field it names. Every other field of the document stays as it was.

---

### Task 2: Increase stock with `$inc`

```js
db.products.updateOne(
  { name: "Wireless Mouse" },
  { $inc: { stock: 25 } }
)
```

**Output:** `matchedCount: 1, modifiedCount: 1`. The stock of Wireless Mouse changes from **50 to 75**.

**Explanation:** `$inc` adds the given number to the current value on the server, so you don't need to read the old value first. A negative number would decrease the stock.

---

### Task 3: Remove an obsolete field with `$unset`

```js
db.products.updateMany(
  {},
  { $unset: { oldCode: "" } }
)
```

**Output**
```js
{ acknowledged: true, insertedId: null, matchedCount: 8,
  modifiedCount: 2, upsertedCount: 0 }
```

**Explanation:** The empty filter `{}` matches all 8 documents. Only 2 of them (Mouse and Keyboard) actually had `oldCode`, so `modifiedCount` is 2. The value given to `$unset` (`""`) is ignored. Only the field name matters.

---

### Task 4: Replace a whole document

```js
db.products.replaceOne(
  { _id: 3 },
  { name: "USB-C Cable", category: "Accessories", price: 350,
    stock: 100, discontinued: false }
)
```

**Output**
```js
{ acknowledged: true, insertedId: null, matchedCount: 1,
  modifiedCount: 1, upsertedCount: 0 }
```

`db.products.findOne({ _id: 3 })` returns:
```js
{ _id: 3, name: 'USB-C Cable', category: 'Accessories',
  price: 350, stock: 100, discontinued: false }
```

**Explanation:** `replaceOne` throws away every field of the old document except `_id` and stores the new document in its place. The replacement document must not contain update operators such as `$set`.

---

### Task 5: Delete a single document

```js
db.products.deleteOne({ name: "Old Floppy Drive" })
```

**Output**
```js
{ acknowledged: true, deletedCount: 1 }
```

---

### Task 6: Delete multiple documents

```js
db.products.deleteMany({ discontinued: true })
```

**Output**
```js
{ acknowledged: true, deletedCount: 2 }
```

Dial-up Modem and CD Drive are removed. `db.products.countDocuments()` returns **5**.

**Explanation:** `deleteOne` removes at most one matching document. `deleteMany` removes all of them. Old Floppy Drive was already deleted in Task 5, so only 2 discontinued products are left to delete.

---

### Task 7: Aggregation – stock summary per category

```js
db.products.aggregate([
  { $match: { price: { $gte: 500 } } },
  { $group: {
      _id: "$category",
      totalStock: { $sum: "$stock" },
      avgPrice:   { $avg: "$price" }
  } },
  { $sort: { totalStock: -1 } },
  { $project: { _id: 0, category: "$_id", totalStock: 1, avgPrice: 1 } }
])
```

**Output**
```js
[
  { category: 'Accessories', totalStock: 105, avgPrice: 1100 },
  { category: 'Computers',   totalStock: 25,  avgPrice: 33500 }
]
```

**Explanation of the pipeline**

| Stage | What it does |
|-------|--------------|
| `$match` | Keeps only products with `price >= 500`. USB-C Cable (350) is filtered out. |
| `$group` | Groups by `category` and computes `$sum` of stock and `$avg` of price. |
| `$sort` | `totalStock: -1` puts the category with the highest total stock first. |
| `$project` | Renames `_id` to `category` and hides `_id`. |

Working: Accessories = Mouse (75) + Keyboard (30) = 105, avg (800 + 1400) / 2 = 1100. Computers = Laptop (10) + Monitor (15) = 25, avg (55000 + 12000) / 2 = 33500.

*Field order inside each result may differ slightly.*

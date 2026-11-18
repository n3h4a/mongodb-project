// Scenario A1: Online Store Inventory Update
// Database / Collection: shopDB.products
// Run with:  mongosh solution.js
// (or paste each block into mongosh after `use shopDB`)

db = db.getSiblingDB("shopDB");
db.products.drop(); // start clean so the script can be re-run

// ---------- Sample data ----------
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
]);

// ---------- Task 1: Change a price with $set ----------
printjson(
  db.products.updateOne({ name: "Keyboard" }, { $set: { price: 1400 } })
);
printjson(db.products.findOne({ name: "Keyboard" }));

// ---------- Task 2: Increase stock with $inc ----------
printjson(
  db.products.updateOne({ name: "Wireless Mouse" }, { $inc: { stock: 25 } })
);
printjson(db.products.findOne({ name: "Wireless Mouse" }, { name: 1, stock: 1 }));

// ---------- Task 3: Remove an obsolete field with $unset ----------
printjson(
  db.products.updateMany({}, { $unset: { oldCode: "" } })
);

// ---------- Task 4: Replace a whole document ----------
printjson(
  db.products.replaceOne(
    { _id: 3 },
    { name: "USB-C Cable", category: "Accessories", price: 350,
      stock: 100, discontinued: false }
  )
);
printjson(db.products.findOne({ _id: 3 }));

// ---------- Task 5: Delete a single document ----------
printjson(db.products.deleteOne({ name: "Old Floppy Drive" }));

// ---------- Task 6: Delete multiple documents ----------
printjson(db.products.deleteMany({ discontinued: true }));
print("Documents left:", db.products.countDocuments());

// ---------- Task 7: Aggregation – stock summary per category ----------
printjson(
  db.products.aggregate([
    { $match: { price: { $gte: 500 } } },
    { $group: {
        _id: "$category",
        totalStock: { $sum: "$stock" },
        avgPrice: { $avg: "$price" }
    } },
    { $sort: { totalStock: -1 } },
    { $project: { _id: 0, category: "$_id", totalStock: 1, avgPrice: 1 } }
  ]).toArray()
);

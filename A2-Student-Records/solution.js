// Scenario A2: Student Records – Insert, Query, Sort and Project
// Database / Collection: collegeDB.students
// Run with:  mongosh solution.js
// (or paste each block into mongosh after `use collegeDB`)

db = db.getSiblingDB("collegeDB");
db.students.drop(); // the collection is empty at the start

// ---------- Task 1: Properly formed insert ----------
printjson(
  db.students.insertOne({
    _id: 101, name: "Arun", dept: "CSE", marks: 78,
    scores: [ { subject: "DBMS", mark: 85 }, { subject: "Maths", mark: 70 } ]
  })
);

// ---------- Task 2: Improperly formed insert (duplicate _id) ----------
try {
  db.students.insertOne({
    _id: 101, name: "Arun Kumar", dept: "IT", marks: 70,
    scores: [ { subject: "DBMS", mark: 60 }, { subject: "Maths", mark: 65 } ]
  });
} catch (e) {
  print("Error:", e.message);
}

// ---------- Task 3: Insert many documents ----------
printjson(
  db.students.insertMany([
    { _id: 102, name: "Bala", dept: "IT", marks: 66,
      scores: [ { subject: "DBMS", mark: 60 }, { subject: "Maths", mark: 72 } ] },
    { _id: 103, name: "Chitra", dept: "CSE", marks: 91,
      scores: [ { subject: "DBMS", mark: 95 }, { subject: "Maths", mark: 87 } ] },
    { _id: 104, name: "Divya", dept: "ECE", marks: 72,
      scores: [ { subject: "DBMS", mark: 55 }, { subject: "Maths", mark: 89 } ] },
    { _id: 105, name: "Eswar", dept: "IT", marks: 84,
      scores: [ { subject: "DBMS", mark: 88 }, { subject: "Maths", mark: 80 } ] },
    { _id: 106, name: "Farah", dept: "CSE", marks: 59,
      scores: [ { subject: "DBMS", mark: 45 }, { subject: "Maths", mark: 73 } ] }
  ])
);

// ---------- Task 4: Equality query ----------
printjson(db.students.find({ dept: "CSE" }).toArray());

// ---------- Task 5: Comparison operator ----------
printjson(db.students.find({ marks: { $gte: 75 } }).toArray());

// ---------- Task 6: $in operator ----------
printjson(db.students.find({ dept: { $in: ["CSE", "IT"] } }).toArray());

// ---------- Task 7: $elemMatch on an array ----------
printjson(
  db.students.find({
    scores: { $elemMatch: { subject: "DBMS", mark: { $gt: 80 } } }
  }).toArray()
);

// Wrong version (for comparison) – also returns Divya:
printjson(
  db.students.find(
    { "scores.subject": "DBMS", "scores.mark": { $gt: 80 } },
    { _id: 0, name: 1 }
  ).toArray()
);

// ---------- Task 8: Sorting, limiting and projection ----------
printjson(
  db.students.find({}, { _id: 0, name: 1, marks: 1 })
    .sort({ marks: -1 })
    .limit(3)
    .toArray()
);

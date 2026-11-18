// Scenario A3: Employee Directory – Speeding up Searches with Indexes
// Database / Collection: companyDB.employees
// Run with:  mongosh solution.js
// (or paste each block into mongosh after `use companyDB`)

db = db.getSiblingDB("companyDB");
db.employees.drop(); // start clean so the script can be re-run

// ---------- Sample data ----------
db.employees.insertMany([
  { _id: 1, name: "Anil", dept: "IT", city: "Chennai", salary: 60000,
    skills: ["MongoDB", "Python"] },
  { _id: 2, name: "Bhavna", dept: "HR", city: "Mumbai", salary: 45000,
    skills: ["Excel", "Communication"] },
  { _id: 3, name: "Charan", dept: "IT", city: "Chennai", salary: 75000,
    skills: ["Java", "MongoDB"] },
  { _id: 4, name: "Deepa", dept: "Finance", city: "Pune", salary: 52000,
    skills: ["Excel", "Tally"] },
  { _id: 5, name: "Elan", dept: "IT", city: "Bengaluru", salary: 68000,
    skills: ["Python", "Docker"] },
  { _id: 6, name: "Farida", dept: "HR", city: "Delhi", salary: 48000,
    skills: ["Communication", "Recruitment"] },
  { _id: 7, name: "Gokul", dept: "Finance", city: "Chennai", salary: 58000,
    skills: ["Tally", "Excel"] },
  { _id: 8, name: "Hema", dept: "IT", city: "Pune", salary: 82000,
    skills: ["MongoDB", "Kubernetes"] }
]);

// Helper: print the key parts of an explain("executionStats") result
function summary(exp) {
  const stages = [];
  (function walk(s) {
    if (!s) return;
    stages.push(s.indexName ? s.stage + " (" + s.indexName + ")" : s.stage);
    walk(s.inputStage);
  })(exp.queryPlanner.winningPlan.queryPlan || exp.queryPlanner.winningPlan);
  printjson({
    stages: stages.join(" <- "),
    nReturned: exp.executionStats.nReturned,
    totalKeysExamined: exp.executionStats.totalKeysExamined,
    totalDocsExamined: exp.executionStats.totalDocsExamined
  });
}

// ---------- Task 1: explain() without an index ----------
summary(db.employees.find({ dept: "IT" }).explain("executionStats"));

// ---------- Task 2: single-field index on dept ----------
print(db.employees.createIndex({ dept: 1 }));
summary(db.employees.find({ dept: "IT" }).explain("executionStats"));

// ---------- Task 3: compound index dept (asc) + salary (desc) ----------
print(db.employees.createIndex({ dept: 1, salary: -1 }));
printjson(
  db.employees.find({ dept: "IT" }, { _id: 0, name: 1, salary: 1 })
    .sort({ salary: -1 }).toArray()
);
summary(db.employees.find({ dept: "IT" }).sort({ salary: -1 }).explain("executionStats"));

// ---------- Task 4: multikey index on the skills array ----------
print(db.employees.createIndex({ skills: 1 }));
printjson(db.employees.find({ skills: "MongoDB" }, { _id: 0, name: 1, skills: 1 }).toArray());
summary(db.employees.find({ skills: "MongoDB" }).explain("executionStats"));

// ---------- Task 5: hide / unhide the skills_1 index ----------
printjson(db.employees.hideIndex("skills_1"));
summary(db.employees.find({ skills: "MongoDB" }).explain("executionStats"));
printjson(db.employees.unhideIndex("skills_1"));
summary(db.employees.find({ skills: "MongoDB" }).explain("executionStats"));

// ---------- Task 6: unique index errors ----------
try {
  db.employees.createIndex({ city: 1 }, { unique: true });
} catch (e) {
  print("Error:", e.message);
}
print(db.employees.createIndex({ name: 1 }, { unique: true }));

// ---------- Task 7: list all indexes ----------
printjson(db.employees.getIndexes());

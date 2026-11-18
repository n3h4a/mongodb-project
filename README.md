# MongoDB Mid-Term Lab – Set A

This repository contains the questions and solutions for the **MongoDB Mid-Term Lab, Set A**. It has four practical scenarios covering updates and deletes, queries, indexing and replication.

Each scenario folder contains:

- **`README.md`**: the full question (scenario, sample data and requirements), then the query, output and explanation for every task
- **`solution.js`**: all the MongoDB Shell (`mongosh`) commands for that scenario in one file

---

## Scenarios

| # | Scenario | Syllabus unit | Database.Collection |
|---|----------|---------------|---------------------|
| A1 | [Online Store Inventory Update](A1-Online-Store-Inventory/) | Unit 1: Updating & deleting documents, aggregation basics | `shopDB.products` |
| A2 | [Student Records: Insert, Query, Sort and Project](A2-Student-Records/) | Unit 2: Inserts, queries, sorting, limiting, projection | `collegeDB.students` |
| A3 | [Employee Directory: Speeding up Searches with Indexes](A3-Employee-Directory-Indexes/) | Unit 3: Indexes and explain plans | `companyDB.employees` |
| A4 | [Banking App: Building and Checking a Replica Set](A4-Banking-Replica-Set/) | Unit 4: Replication | `bankDB.accounts` |

---

### A1: Online Store Inventory Update
A small electronics store corrects a price, updates stock, removes an unwanted field, replaces an outdated product, deletes discontinued items and builds a stock summary.

**Concepts:** `updateOne`, `updateMany`, `$set`, `$inc`, `$unset`, `replaceOne`, `deleteOne`, `deleteMany`, `aggregate` with `$match`, `$group`, `$sort`, `$project`

### A2: Student Records: Insert, Query, Sort and Project
A college clerk inserts student records (including a deliberate duplicate `_id` mistake), and the Head of Department asks for reports.

**Concepts:** `insertOne`, `insertMany`, duplicate key error `E11000`, equality queries, `$gte`, `$in`, `$elemMatch` on arrays of sub-documents, `sort`, `limit`, projection

### A3: Employee Directory: Speeding up Searches with Indexes
Department and skill searches on an HR collection are made faster with indexes, and each improvement is checked with `explain("executionStats")`.

**Concepts:** `COLLSCAN` vs `IXSCAN`, single-field index, compound index and index order (ESR rule), multikey index, `hideIndex` / `unhideIndex`, unique index errors, `getIndexes`

### A4: Banking App: Building and Checking a Replica Set
A 3-node replica set `rs0` (ports 27017, 27018, 27019) keeps the bank's accounts database running even if one server crashes.

**Concepts:** `rs.initiate`, PRIMARY / SECONDARY, write concern `w: "majority"`, read preferences, the oplog (`local.oplog.rs`), `rs.stepDown` and elections, `rs.status()` and replication lag

---

## Repository structure

```
mongodb-project/
├── README.md
├── A1-Online-Store-Inventory/
│   ├── README.md
│   └── solution.js
├── A2-Student-Records/
│   ├── README.md
│   └── solution.js
├── A3-Employee-Directory-Indexes/
│   ├── README.md
│   └── solution.js
└── A4-Banking-Replica-Set/
    ├── README.md
    ├── solution.js
    ├── start-nodes.bat
    └── start-nodes.sh
```

# MongoDB Project – Set A

Solutions to the MongoDB assignment **Set A** (Scenarios A1 to A4: updates and deletes, queries, indexing and replication).

Each scenario has its own folder containing:
- `README.md`: the full question (scenario, sample data, requirements) followed by the solution, expected output and explanation for every task
- `solution.js`: a runnable script containing all the queries for that scenario

## Contents

| Scenario | Topic | Syllabus unit | Database.Collection |
|----------|-------|---------------|---------------------|
| [A1: Online Store Inventory Update](A1-Online-Store-Inventory/) | `$set`, `$inc`, `$unset`, `replaceOne`, `deleteOne`/`deleteMany`, aggregation | Unit 1 | `shopDB.products` |
| [A2: Student Records: Insert, Query, Sort and Project](A2-Student-Records/) | Proper/improper inserts, equality & comparison queries, `$in`, `$elemMatch`, sort, limit, projection | Unit 2 | `collegeDB.students` |
| [A3: Employee Directory: Speeding up Searches with Indexes](A3-Employee-Directory-Indexes/) | Single-field, compound and multikey indexes, `explain()`, hidden indexes, unique index errors | Unit 3 | `companyDB.employees` |
| [A4: Banking App: Building and Checking a Replica Set](A4-Banking-Replica-Set/) | Replica set setup, primary/secondary, write concern, read preference, oplog, elections, `rs.status()` | Unit 4 | `bankDB.accounts` |

## How to run

You need MongoDB and the MongoDB Shell (`mongosh`).

```bash
# start a local server (skip if MongoDB is already running)
mongod --dbpath ./data

# run any scenario
mongosh A1-Online-Store-Inventory/solution.js
mongosh A2-Student-Records/solution.js
mongosh A3-Employee-Directory-Indexes/solution.js
```

A4 needs a 3-node replica set instead of a single server. Follow the steps in [A4's README](A4-Banking-Replica-Set/README.md) (start the nodes with `start-nodes.bat` / `start-nodes.sh`, run `rs.initiate`, then run its `solution.js`).

Each A1–A3 script drops and recreates its own collection first, so it can be run again and again. You can also paste the commands from each README into an interactive `mongosh` session one task at a time.

> **Note on the GitHub language bar:** it shows *JavaScript* because the MongoDB Shell (`mongosh`) runs JavaScript. Every MongoDB query here (`db.products.find(...)` etc.) is a JavaScript call, so `.js` is the standard extension for MongoDB scripts.

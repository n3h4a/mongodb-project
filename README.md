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

Each script drops and recreates its own collection first, so it can be run again and again. You can also paste the commands from each README into an interactive `mongosh` session one task at a time.

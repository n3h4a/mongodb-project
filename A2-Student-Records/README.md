# Scenario A2: Student Records – Insert, Query, Sort and Project

**Syllabus focus:** Unit 2: Proper/improper inserts, equality and comparison queries, `$in`, `$elemMatch`, sorting, limiting, projection
**Database / Collection:** `collegeDB.students`

All queries for this scenario in one file: [`solution.js`](solution.js)

---

## Question

### Scenario

A college stores student details in the `students` collection. A clerk first adds the student records (including one deliberate mistake, so you can see how MongoDB reacts). Then the Head of Department asks for a few reports using queries. The collection is empty at the start.

The data to be stored (`marks` is the overall percentage; `scores` holds subject-wise marks as an array of sub-documents):

| _id | name   | dept | marks | DBMS | Maths |
|-----|--------|------|-------|------|-------|
| 101 | Arun   | CSE  | 78    | 85   | 70    |
| 102 | Bala   | IT   | 66    | 60   | 72    |
| 103 | Chitra | CSE  | 91    | 95   | 87    |
| 104 | Divya  | ECE  | 72    | 55   | 89    |
| 105 | Eswar  | IT   | 84    | 88   | 80    |
| 106 | Farah  | CSE  | 59    | 45   | 73    |

### Requirements

1. Insert the student Arun (`_id: 101`) with his `scores` array using `insertOne`.
2. Try to insert another student with the same `_id: 101`. Read the error message and explain why it happened.
3. Insert the remaining five students (102 to 106) with a single `insertMany`.
4. List all students of the CSE department.
5. List students whose overall `marks` are 75 or more.
6. List students who belong to either the CSE or the IT department.
7. Find students who scored more than 80 in the subject DBMS (subject and mark must be satisfied by the same array element).
8. Show only the name and marks of the top 3 students, highest marks first (hide `_id`).

---

## Solution

Each student is stored like this:

```js
{
  _id: 101, name: "Arun", dept: "CSE", marks: 78,
  scores: [ { subject: "DBMS", mark: 85 }, { subject: "Maths", mark: 70 } ]
}
```

```js
use collegeDB
```

### Task 1: Properly formed insert

```js
db.students.insertOne({
  _id: 101, name: "Arun", dept: "CSE", marks: 78,
  scores: [ { subject: "DBMS", mark: 85 }, { subject: "Maths", mark: 70 } ]
})
```

**Output**
```js
{ acknowledged: true, insertedId: 101 }
```

---

### Task 2: Improperly formed insert (duplicate `_id`)

```js
db.students.insertOne({
  _id: 101, name: "Arun Kumar", dept: "IT", marks: 70,
  scores: [ { subject: "DBMS", mark: 60 }, { subject: "Maths", mark: 65 } ]
})
```

**Output**
```
MongoServerError: E11000 duplicate key error collection:
collegeDB.students index: _id_ dup key: { _id: 101 }
```

**Reason:** `_id` is the primary key of every MongoDB collection. MongoDB automatically creates a **unique index** (`_id_`) on it, so two documents can never share the same `_id`. The insert is rejected and the original Arun document is **not changed**.

**Fix:** use a new `_id` value, or leave `_id` out so MongoDB generates an `ObjectId` automatically.

---

### Task 3: Insert many documents

```js
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
```

**Output**
```js
{ acknowledged: true,
  insertedIds: { '0': 102, '1': 103, '2': 104, '3': 105, '4': 106 } }
```

---

### Task 4: Equality query

```js
db.students.find({ dept: "CSE" })
```

**Output:** 3 documents: Arun (78), Chitra (91) and Farah (59).

---

### Task 5: Comparison operator

```js
db.students.find({ marks: { $gte: 75 } })
```

**Output:** 3 documents: Arun (78), Chitra (91) and Eswar (84).

**Explanation:** `$gte` means "greater than or equal to". Other comparison operators are `$gt`, `$lt`, `$lte`, `$eq` and `$ne`.

---

### Task 6: `$in` operator

```js
db.students.find({ dept: { $in: ["CSE", "IT"] } })
```

**Output:** 5 documents: Arun, Bala, Chitra, Eswar and Farah. Divya (ECE) is not returned.

**Explanation:** `$in` matches if the field equals **any** value in the list. It is a shorter way of writing `$or` on the same field.

---

### Task 7: `$elemMatch` on an array

```js
db.students.find({
  scores: { $elemMatch: { subject: "DBMS", mark: { $gt: 80 } } }
})
```

**Output:** 3 documents: Arun (85), Chitra (95) and Eswar (88).

**Why `$elemMatch` is needed:** without it, the query

```js
db.students.find({ "scores.subject": "DBMS", "scores.mark": { $gt: 80 } })
```

would **wrongly also return Divya**. Each condition can be satisfied by a *different* array element: her DBMS element satisfies `subject: "DBMS"`, and her Maths mark (89) satisfies `mark > 80`. `$elemMatch` forces both conditions to be true for the **same** array element.

---

### Task 8: Sorting, limiting and projection

```js
db.students.find({}, { _id: 0, name: 1, marks: 1 })
  .sort({ marks: -1 })
  .limit(3)
```

**Output**
```js
[
  { name: 'Chitra', marks: 91 },
  { name: 'Eswar',  marks: 84 },
  { name: 'Arun',   marks: 78 }
]
```

**Explanation**

| Part | Meaning |
|------|---------|
| `{ _id: 0, name: 1, marks: 1 }` | Projection: show only `name` and `marks`, hide `_id` (it is shown by default). |
| `.sort({ marks: -1 })` | `-1` = descending, so the highest marks come first. |
| `.limit(3)` | Return only the first 3 documents after sorting. |

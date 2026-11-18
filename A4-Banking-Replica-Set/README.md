# Scenario A4: Banking App – Building and Checking a Replica Set

**Syllabus focus:** Unit 4: Replication setup, primary/secondary, read preference, write concern, elections, oplog, `rs.status()` analysis
**Database / Collection:** `bankDB.accounts`

Files in this folder:
- [`start-nodes.bat`](start-nodes.bat): starts the 3 `mongod` instances on Windows
- [`start-nodes.sh`](start-nodes.sh): starts the 3 `mongod` instances on Linux/macOS
- [`solution.js`](solution.js): all the shell commands for Tasks 2–7 in one script

---

## Question

### Scenario

A bank wants its accounts database to keep working even if one server crashes. You will create a small 3-node replica set named `rs0` on one machine (ports 27017, 27018, 27019), test reads and writes, look at the oplog, and see what happens when the primary fails.

Open a separate terminal window for each `mongod` process. The paths below are for Windows; on Linux/macOS use paths such as `/data/rs0-1` and add `--fork --logpath <file>` to run in the background.

### Requirements

1. Start three `mongod` instances with replica set name `rs0` and initiate the replica set. Write two lines on why replication is used.
2. Find out which member is the PRIMARY and which members are SECONDARY.
3. Insert an account document using write concern `w: "majority"` so the data is safe on most members.
4. Set the read preference to `secondaryPreferred` and read the account back.
5. Look at the oplog entry created by your insert.
6. Force the primary to step down and observe how a new primary is elected.
7. Check the replication health using `rs.status()` and the replication lag of the secondaries.

---

## Solution

### Task 1: Start the nodes and initiate the replica set

**Step 1: create a data folder for each member and start three `mongod` processes** (one terminal window each):

Windows:
```bat
mkdir C:\data\rs0-1 C:\data\rs0-2 C:\data\rs0-3

mongod --replSet rs0 --port 27017 --dbpath C:\data\rs0-1 --bind_ip localhost
mongod --replSet rs0 --port 27018 --dbpath C:\data\rs0-2 --bind_ip localhost
mongod --replSet rs0 --port 27019 --dbpath C:\data\rs0-3 --bind_ip localhost
```

Linux/macOS (runs in the background):
```bash
mkdir -p /data/rs0-1 /data/rs0-2 /data/rs0-3
mongod --replSet rs0 --port 27017 --dbpath /data/rs0-1 --bind_ip localhost --fork --logpath /data/rs0-1/mongod.log
mongod --replSet rs0 --port 27018 --dbpath /data/rs0-2 --bind_ip localhost --fork --logpath /data/rs0-2/mongod.log
mongod --replSet rs0 --port 27019 --dbpath /data/rs0-3 --bind_ip localhost --fork --logpath /data/rs0-3/mongod.log
```

| Option | Meaning |
|--------|---------|
| `--replSet rs0` | This server is a member of the replica set named `rs0` |
| `--port` | Each member needs its own port because all three run on one machine |
| `--dbpath` | Each member needs its own data folder |

**Step 2: connect to one member and initiate the set** (only once):

```bash
mongosh --port 27017
```
```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

**Output:** `rs.initiate` returns `{ ok: 1, ... }`. After a few seconds an election is held and the shell prompt changes to:
```
rs0 [direct: primary] test>
```

**Purpose of replication:** the same data is kept on several servers. This gives **high availability** (automatic failover when a server fails), **data redundancy** (protection against data loss), and the option to **spread read load** to secondaries.

> Tip: for the remaining tasks, connect with the replica set connection string so the shell always finds the current primary:
> ```bash
> mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"
> ```

---

### Task 2: Identify primary and secondaries

```js
rs.status().members.map(m => ({ name: m.name, state: m.stateStr, health: m.health }))
```

**Output**
```js
[
  { name: 'localhost:27017', state: 'PRIMARY',   health: 1 },
  { name: 'localhost:27018', state: 'SECONDARY', health: 1 },
  { name: 'localhost:27019', state: 'SECONDARY', health: 1 }
]
```

Other quick checks: `db.hello().primary` prints `'localhost:27017'`, and `db.hello().isWritablePrimary` is `true` on the primary.

**Explanation:** the **primary** receives all writes. **Secondaries** copy the data from it by replaying its oplog. `health: 1` means the member is up (0 = down). Which member becomes primary can differ on your machine, but there is always exactly one.

---

### Task 3: Write with write concern

```js
use bankDB
db.accounts.insertOne(
  { accNo: 1001, holder: "Kumar", balance: 5000 },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
)
```

**Output**
```js
{ acknowledged: true, insertedId: ObjectId('...') }
```

**Explanation**

| Option | Meaning |
|--------|---------|
| `w: "majority"` | MongoDB confirms the write only after **at least 2 of the 3 members** have it. Even if the primary crashes right after, the write is not lost. |
| `j: true` | Waits until the write is saved in the on-disk **journal**. |
| `wtimeout: 5000` | Returns an error if this is not achieved within **5 seconds**, instead of waiting forever. |

For a bank, `w: "majority"` is important: with `w: 1`, the primary alone acknowledges the write. If it fails before the secondaries copy the write, the write can be **rolled back**.

---

### Task 4: Read preference

```js
db.getMongo().setReadPref("secondaryPreferred")
db.accounts.find({ accNo: 1001 })
```
(or, for one query only: `db.accounts.find({ accNo: 1001 }).readPref("secondaryPreferred")`)

**Output**
```js
[ { _id: ObjectId('...'), accNo: 1001, holder: 'Kumar', balance: 5000 } ]
```

The read may now be served by a secondary. The document is there because the secondaries had already replicated it (guaranteed by `w: "majority"`).

**Available modes**

| Read preference | Meaning |
|-----------------|---------|
| `primary` (default) | Always read from the primary: latest data, no stale reads. |
| `primaryPreferred` | Primary if available, otherwise a secondary. |
| `secondary` | Only secondaries: reduces load on the primary, data may be slightly stale. |
| `secondaryPreferred` | Secondary if available, otherwise the primary. |
| `nearest` | Member with the lowest network latency, primary or secondary. |

---

### Task 5: Inspect the oplog

The oplog (operations log) is a special capped collection `oplog.rs` in the `local` database. Every write on the primary is recorded there, and secondaries replay these entries to stay in sync.

```js
use local
db.oplog.rs.find({ ns: "bankDB.accounts", op: "i" }).sort({ $natural: -1 }).limit(1)
```

**Output**
```js
{
  op: 'i',
  ns: 'bankDB.accounts',
  o: { _id: ObjectId('...'), accNo: 1001, holder: 'Kumar', balance: 5000 },
  ts: Timestamp({ t: <seconds>, i: 1 }),
  ...
}
```

| Field | Meaning |
|-------|---------|
| `op` | Operation type: `i` = insert, `u` = update, `d` = delete, `c` = command, `n` = no-op |
| `ns` | Namespace: `database.collection` |
| `o` | The operation's document (here, the inserted account) |
| `ts` | Timestamp of the operation: `t` = seconds, `i` = counter within that second. Secondaries use it to know how far they have replicated. |

`$natural: -1` sorts in reverse insertion order, so the newest entry comes first. `rs.printReplicationInfo()` shows the oplog size and the time range it covers.

---

### Task 6: Step down the primary and observe the election

Run on the current primary (or through the replica set connection string):

```js
rs.stepDown(60)
```

**What happens**

1. The primary (`localhost:27017`) steps down and becomes a **SECONDARY**. The `60` means it will not try to become primary again for 60 seconds. In older shells the connection drops with a network error, which is expected.
2. The remaining members notice there is no primary and hold an **election**. A member needs votes from a **majority (2 of 3)** to win.
3. Within a few seconds (normally under 12) one of the old secondaries becomes the new **PRIMARY**.

Check it again:
```js
rs.status().members.map(m => ({ name: m.name, state: m.stateStr, health: m.health }))
```

**Output (example: the new primary may be 27018 or 27019)**
```js
[
  { name: 'localhost:27017', state: 'SECONDARY', health: 1 },
  { name: 'localhost:27018', state: 'PRIMARY',   health: 1 },
  { name: 'localhost:27019', state: 'SECONDARY', health: 1 }
]
```

The data is still there (`db.getSiblingDB("bankDB").accounts.find()` still returns Kumar's account), and applications using the replica set connection string automatically send new writes to the new primary. This is **automatic failover**.

> To simulate a real crash instead, close the terminal window of the primary (or run `db.adminCommand({ shutdown: 1 })` on it). The same election happens. That member shows `health: 0` and `state: '(not reachable/healthy)'` until it is restarted, after which it rejoins as a SECONDARY and catches up from the oplog.

---

### Task 7: Replication health and lag

```js
rs.status()
```

**Important fields in the output**
```js
{
  set: 'rs0',
  myState: 1,                       // 1 = PRIMARY, 2 = SECONDARY
  members: [
    { _id: 0, name: 'localhost:27017', health: 1, state: 2, stateStr: 'SECONDARY',
      optimeDate: ISODate('...'), syncSourceHost: 'localhost:27018',
      lastHeartbeat: ISODate('...'), pingMs: 0, ... },
    { _id: 1, name: 'localhost:27018', health: 1, state: 1, stateStr: 'PRIMARY',
      optimeDate: ISODate('...'), electionDate: ISODate('...'), ... },
    { _id: 2, name: 'localhost:27019', health: 1, state: 2, stateStr: 'SECONDARY',
      optimeDate: ISODate('...'), syncSourceHost: 'localhost:27018', ... }
  ],
  ok: 1
}
```

| Field | What to check |
|-------|---------------|
| `health` | `1` = member is reachable, `0` = down |
| `stateStr` | Exactly one `PRIMARY`, the rest `SECONDARY` |
| `optimeDate` | Time of the last operation applied by that member. Secondaries should be equal or very close to the primary. |
| `syncSourceHost` | Which member a secondary copies data from |
| `lastHeartbeat` / `pingMs` | Members ping each other every 2 seconds. A heartbeat failing for 10 seconds triggers an election. |
| `electionDate` | When the current primary was elected (shows the step-down from Task 6) |

**Replication lag:**

```js
rs.printSecondaryReplicationInfo()
```

**Output**
```
source: localhost:27017
{
  syncedTo: '<date>',
  replLag: '0 secs (0 hrs) behind the primary '
}
---
source: localhost:27019
{
  syncedTo: '<date>',
  replLag: '0 secs (0 hrs) behind the primary '
}
```

**Explanation:** replication lag is the delay between a write on the primary and the same write on a secondary (the difference in `optimeDate`). On one machine with very little data, the lag is **0 seconds**, so the replica set is healthy. A large or growing lag means a secondary is overloaded or has network problems. It would serve stale reads, and `w: "majority"` writes would become slow.

---

## Cleanup (optional)

Stop the three servers by closing their windows (Windows), or on Linux/macOS:
```bash
for p in 27017 27018 27019; do mongosh --port $p --quiet --eval 'db.adminCommand({ shutdown: 1, force: true })'; done
```

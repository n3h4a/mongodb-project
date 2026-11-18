// Scenario A4: Banking App – Building and Checking a Replica Set
// Database / Collection: bankDB.accounts
//
// 1. Start the three mongod processes first (start-nodes.bat or start-nodes.sh).
// 2. Initiate the replica set ONCE by connecting to one node:
//      mongosh --port 27017 --eval 'rs.initiate({ _id: "rs0", members: [
//        { _id: 0, host: "localhost:27017" },
//        { _id: 1, host: "localhost:27018" },
//        { _id: 2, host: "localhost:27019" } ] })'
// 3. Wait ~10 seconds for the election, then run this script against the set:
//      mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0" solution.js

function members() {
  return rs.status().members.map(m => ({ name: m.name, state: m.stateStr, health: m.health }));
}

// ---------- Task 2: Identify primary and secondaries ----------
printjson(members());
print("Primary is:", db.hello().primary);

// ---------- Task 3: Write with write concern majority ----------
const bank = db.getSiblingDB("bankDB");
bank.accounts.drop();
printjson(
  bank.accounts.insertOne(
    { accNo: 1001, holder: "Kumar", balance: 5000 },
    { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
  )
);

// ---------- Task 4: Read preference secondaryPreferred ----------
db.getMongo().setReadPref("secondaryPreferred");
printjson(bank.accounts.find({ accNo: 1001 }).toArray());
db.getMongo().setReadPref("primary"); // back to default for the next tasks

// ---------- Task 5: Inspect the oplog ----------
printjson(
  db.getSiblingDB("local").oplog.rs
    .find({ ns: "bankDB.accounts", op: "i" })
    .sort({ $natural: -1 })
    .limit(1)
    .toArray()
);

// ---------- Task 6: Force the primary to step down ----------
const oldPrimary = db.hello().primary;
print("Old primary:", oldPrimary);
try {
  printjson(rs.stepDown(60)); // old primary cannot become primary again for 60 s
} catch (e) {
  print("stepDown closed the connection (normal on older shells):", e.message);
}
sleep(15000); // give the remaining members time to hold an election
printjson(members());
print("New primary:", db.hello().primary);

// ---------- Task 7: Replication health and lag ----------
const st = rs.status();
printjson({ set: st.set, myState: st.myState, ok: st.ok });
printjson(st.members.map(m => ({
  name: m.name, state: m.stateStr, health: m.health,
  optimeDate: m.optimeDate, syncSourceHost: m.syncSourceHost
})));
rs.printSecondaryReplicationInfo();

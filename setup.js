db.createRole({
    role: "admin",
    privileges: [{
        resource: { 
            db: "lightwatch", 
            collection: "logs"}, 
            actions: ["insert","find", "update", "remove"] 
    }],
    roles: []
});

db.createUser(
  {
    user: "admin",
    pwd: "#admin",
    roles: [ { role: "admin", db: "lightwatch" } ]
  }
);




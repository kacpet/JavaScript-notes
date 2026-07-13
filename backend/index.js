const db = require("./database");

db.query("SELECT NOW()")
.then(result=>{
    console.log(result.rows);
})
.catch(error=>{
    console.log(error);
});
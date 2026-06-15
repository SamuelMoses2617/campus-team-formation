const pool = require("./config/database");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database Connection Error:", err);
  } else {
    console.log("Connected Successfully!");
    console.log(res.rows);
  }

  process.exit();
});

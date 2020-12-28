const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const app = express();
const port = process.env.PORT || "3001";
const db = new sqlite3.Database(
  process.env.DB_MENDE || "./data/mende-nn.sqlitedb"
);

app.get("/map/mende/:z/:x/:y.jpg", cors(), (req, res) => {
  const { x, y, z } = req.params;
  const zoom = 17 - +z;
  if (!x || !y || zoom > 7 || zoom < 3) {
    return res.status(404).send("out of range");
  }
  //this is translation standard mercator x/y/z to DB format
  console.log("map", req.params);
  onTile(+x, +y, 17 - +z, res);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});



const onTile = (x, y, z, res) => {
  db.serialize(() => {
    const sql = `SELECT *  FROM tiles WHERE x=? and y=? and z=? limit 1`;
    //   sql='SELECT sql FROM sqlite_master'
    console.log(sql);
    db.each(
      sql,
      [x, y, z],
      (err, row) => {
        if (err) {
          console.error("err", err.message);
          return;
        }
        const { image, ...meta } = row;
        console.log("result:", meta);
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(image, "binary");
        // fs.writeFileSync(`a-${row.x}.png`, row.image)
      },
      (err, count) => {
        console.log("complete:", count, err);
        if (err || count === 0) {
          res.status(404).send("out of range");
        }
      }
    ).on("debug", (s) => console.log(s));
  });
};

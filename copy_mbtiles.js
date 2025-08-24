const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

// Helper: Convert lat/lon to tile X/Y at a given zoom
function latLonToTile(lat, lon, zoom, tms = true) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  let y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  if (tms) {
    y = n - 1 - y;
  }
  return { x, y };
}

// Bounding box
const minLat = 54.777995,
  minLon = 41.694241;
const maxLat = 57.322922,
  maxLon = 46.755006;

// Paths
const srcPath = "data/osm-2020-02-10-v3.11_russia_volga-fed-district.mbtiles";
const dstPath = "data/filtered.mbtiles";

// Copy schema (tables, indexes, triggers)
function copySchema(srcDb, dstDb, callback) {
  // Step 1: Create tables
  srcDb.all(
    "SELECT sql FROM sqlite_master WHERE sql NOT NULL AND type='table'",
    [],
    (err, tables) => {
      if (err) throw err;
      tables.forEach((table) => {
        if (table.sql) dstDb.run(table.sql);
      });

      // Step 2: Create indexes and triggers
      srcDb.all(
        "SELECT sql FROM sqlite_master WHERE sql NOT NULL AND type IN ('index', 'trigger')",
        [],
        (err, objects) => {
          if (err) throw err;
          objects.forEach((obj) => {
            if (obj.sql) dstDb.run(obj.sql);
          });

          // Step 3: Create views
          srcDb.all(
            "SELECT sql FROM sqlite_master WHERE sql NOT NULL AND type='view'",
            [],
            (err, views) => {
              if (err) throw err;
              views.forEach((view) => {
                if (view.sql) dstDb.run(view.sql);
              });
              callback();
            },
          );
        },
      );
    },
  );
}

// Copy non-map/images tables
function copyOtherTables(srcDb, dstDb, callback) {
  srcDb.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('map', 'images', 'sqlite_sequence')",
    [],
    (err, tables) => {
      if (err) throw err;
      let remaining = tables.length;
      if (remaining === 0) return callback();
      tables.forEach((table) => {
        srcDb.all(`SELECT * FROM ${table.name}`, [], (err, rows) => {
          if (err) throw err;
          if (rows.length === 0) {
            if (--remaining === 0) callback();
            return;
          }
          const columns = Object.keys(rows[0]);
          const placeholders = columns.map(() => "?").join(",");
          const stmt = dstDb.prepare(
            `INSERT INTO ${table.name} (${columns.join(",")}) VALUES (${placeholders})`,
          );
          rows.forEach((row) => {
            stmt.run(columns.map((col) => row[col]));
          });
          stmt.finalize(() => {
            if (--remaining === 0) callback();
          });
        });
      });
    },
  );
}

// Insert map rows in batches
function insertMapRowsBatch(dstDb, rows, batchSize, callback) {
  let i = 0;
  function nextBatch() {
    if (i >= rows.length) return callback();
    const batch = rows.slice(i, i + batchSize);
    dstDb.serialize(() => {
      const stmt = dstDb.prepare(
        `INSERT INTO map (zoom_level, tile_column, tile_row, tile_id) VALUES (?, ?, ?, ?)`,
      );
      batch.forEach((row) => {
        stmt.run([row.zoom_level, row.tile_column, row.tile_row, row.tile_id]);
      });
      stmt.finalize(() => {
        i += batchSize;
        nextBatch();
      });
    });
  }
  nextBatch();
}

// Insert images rows in batches
function insertImagesRowsBatch(dstDb, rows, batchSize, callback) {
  let i = 0;
  function nextBatch() {
    if (i >= rows.length) return callback();
    const batch = rows.slice(i, i + batchSize);
    dstDb.serialize(() => {
      const stmt = dstDb.prepare(
        `INSERT INTO images (tile_id, tile_data) VALUES (?, ?)`,
      );
      batch.forEach((row) => {
        stmt.run([row.tile_id, row.tile_data]);
      });
      stmt.finalize(() => {
        i += batchSize;
        nextBatch();
      });
    });
  }
  nextBatch();
}

// Copy map and images in bounding box
function copyMapAndImages(srcDb, dstDb, callback) {
  srcDb.all("SELECT DISTINCT zoom_level FROM map", [], (err, zooms) => {
    if (err) throw err;
    const allTileIds = new Set();
    let totalMapRows = 0;
    if (zooms.length === 0) return callback(0);
    function processZoom(zoomIdx) {
      if (zoomIdx >= zooms.length) {
        console.log(`Total map rows copied: ${totalMapRows}`);
        // After all zooms, copy images
        copyImages(srcDb, dstDb, Array.from(allTileIds), callback);
        return;
      }
      const zoom_level = zooms[zoomIdx].zoom_level;
      const minTile = latLonToTile(minLat, minLon, zoom_level);
      const maxTile = latLonToTile(maxLat, maxLon, zoom_level);
      srcDb.all(
        `SELECT zoom_level, tile_column, tile_row, tile_id FROM map
                 WHERE zoom_level = ? AND tile_column BETWEEN ? AND ? AND tile_row BETWEEN ? AND ?`,
        [
          zoom_level,
          minTile.x - 1,
          maxTile.x + 1,
          minTile.y - 1,
          maxTile.y + 1,
        ],
        (err, rows) => {
          if (err) throw err;
          if (rows.length === 0) {
            console.log(`Zoom ${zoom_level}: 0 tiles in bbox.`);
            processZoom(zoomIdx + 1);
            return;
          }
          rows.forEach((row) => allTileIds.add(row.tile_id));
          totalMapRows += rows.length;
          console.log(`Zoom ${zoom_level}: copying ${rows.length} map rows.`);
          insertMapRowsBatch(dstDb, rows, 100, () => {
            processZoom(zoomIdx + 1);
          });
        },
      );
    }

    processZoom(0);
  });
}
//   zooms.forEach(({ zoom_level }) => {
//     const minTile = latLonToTile(minLat, minLon, zoom_level);
//     const maxTile = latLonToTile(maxLat, maxLon, zoom_level);
//     console.log("process:", zoom_level, "/", zooms.length, minTile);
//     srcDb.all(
//       `SELECT zoom_level, tile_column, tile_row, tile_id FROM map
//                WHERE zoom_level = ? AND tile_column BETWEEN ? AND ? AND tile_row BETWEEN ? AND ?`,
//       [
//         zoom_level,
//         minTile.x - 1,
//         maxTile.x + 1,
//         minTile.y - 1,
//         maxTile.y + 1,
//       ],
//       (err, rows) => {
//         if (err) throw err;
//         console.log(
//           "-row:",
//           zoom_level,
//           minTile.x,
//           maxTile.x,
//           minTile.y,
//           maxTile.y,
//           rows.length,
//         );
//         if (rows.length === 0) {
//           done++;
//           if (done === zooms.length) {
//             // After all zooms, copy images
//             copyImages(srcDb, dstDb, Array.from(allTileIds), callback);
//           }
//           return;
//         }
//         const stmt = dstDb.prepare(
//           `INSERT INTO map (zoom_level, tile_column, tile_row, tile_id) VALUES (?, ?, ?, ?)`,
//         );
//         rows.forEach((row) => {
//           stmt.run([
//             row.zoom_level,
//             row.tile_column,
//             row.tile_row,
//             row.tile_id,
//           ]);
//           allTileIds.add(row.tile_id);
//         });
//         stmt.finalize(() => {
//           done++;
//           if (done === zooms.length) {
//             // After all zooms, copy images
//             copyImages(srcDb, dstDb, Array.from(allTileIds), callback);
//           }
//         });
//       },
//     );
//   });
// });

function copyImages(srcDb, dstDb, tileIds, callback) {
  if (tileIds.length === 0) {
    console.log("No images to copy.");
    return callback(0);
  }
  console.log(`Copying ${tileIds.length} images.`);
  // Batch select and insert
  const batchSize = 100;
  let i = 0;
  let totalImages = 0;
  function nextBatch() {
    if (i >= tileIds.length) {
      console.log(`Total images copied: ${totalImages}`);
      return callback(totalImages);
    }
    const batchIds = tileIds.slice(i, i + batchSize);
    const placeholders = batchIds.map(() => "?").join(",");
    srcDb.all(
      `SELECT tile_id, tile_data FROM images WHERE tile_id IN (${placeholders})`,
      batchIds,
      (err, rows) => {
        if (err) throw err;
        totalImages += rows.length;
        insertImagesRowsBatch(dstDb, rows, 100, () => {
          i += batchSize;
          nextBatch();
        });
      },
    );
  }
  nextBatch();
}

// Main
if (fs.existsSync(dstPath)) fs.unlinkSync(dstPath);
const srcDb = new sqlite3.Database(srcPath);
const dstDb = new sqlite3.Database(dstPath);

copySchema(srcDb, dstDb, () => {
  copyOtherTables(srcDb, dstDb, () => {
    copyMapAndImages(srcDb, dstDb, (total) => {
      console.log(`Copied ${total} tiles to ${dstPath}`);
      srcDb.close();
      dstDb.close();
    });
  });
});

import { DataSource } from "typeorm";
import { Tile } from "../entitiesMap/tile";
import { MbTile } from "../entitiesMap/mbTile";
import { existsSync, unlinkSync } from "fs";

/**
 * Convert SQLite map tiles to MBTiles format
 * 
 * Current SQLite structure:
 * - tiles table with columns: x, y, z, image (Buffer)
 * - Coordinate transformation: zoom = 17 - z (inverse zoom levels)
 * 
 * MBTiles structure:
 * - tiles table with columns: zoom_level, tile_column, tile_row, tile_data
 * - Standard MBTiles uses TMS Y coordinate: tile_row = 2^zoom_level - y - 1
 */
const convertSqliteToMBTiles = async () => {
  const sourceDbName = "mende-nn-only";
  const targetDbName = "mende-nn-only-converted";
  
  try {
    console.log(`Starting conversion from ${sourceDbName}.sqlitedb to ${targetDbName}.mbtiles`);
    
    // Create source connection (current SQLite format)
    const sourceConnection = new DataSource({
      name: "source",
      type: "sqlite",
      database: `${__dirname}/../../data/${sourceDbName}.sqlitedb`,
      entities: [Tile],
      synchronize: false,
    });
    
    await sourceConnection.initialize();
    console.log("Source database connected");
    
    // Create target connection (MBTiles format)
    const targetDbPath = `${__dirname}/../../data/${targetDbName}.mbtiles`;
    
    // Delete existing target file if it exists
    if (existsSync(targetDbPath)) {
      unlinkSync(targetDbPath);
      console.log("Removed existing target file");
    }
    
    const targetConnection = new DataSource({
      name: "target",
      type: "sqlite",
      database: targetDbPath,
      entities: [MbTile],
      synchronize: true, // This will create the tables
    });
    
    await targetConnection.initialize();
    console.log("Target database created and connected");
    
    // Get and process tiles in batches
    const tileRepository = sourceConnection.getRepository(Tile);
    const mbTileRepository = targetConnection.getRepository(MbTile);
    let convertedCount = 0;
    const batchSize = 100;
    let offset = 0;
    let batchTiles = [];
    const count = await tileRepository.count();
    console.log(`Total tiles to convert: ${count}`);
    do {
      batchTiles = await tileRepository.find({ skip: offset, take: batchSize });
      if (batchTiles.length === 0) break;
      for (const tile of batchTiles) {
        // Apply coordinate transformation
        const zoomLevel = 17 - tile.z;
        const tileRow = Math.pow(2, zoomLevel) - tile.y - 1;
        const mbTile = new MbTile();
        mbTile.zoomLevel = zoomLevel;
        mbTile.tileColumn = tile.x;
        mbTile.tileRow = tileRow;
        mbTile.tileData = tile.image;
        await mbTileRepository.insert(mbTile);
        convertedCount++;
        if (convertedCount % 100 === 0) {
          console.log(`Converted ${convertedCount} tiles...`);
        }
      }
      offset += batchTiles.length;
    } while (batchTiles.length === batchSize);
    console.log(`Successfully converted ${convertedCount} tiles`);
    
    // Add metadata table (optional but recommended for MBTiles)
    await targetConnection.query(`
      CREATE TABLE IF NOT EXISTS metadata (
        name TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    
    // Add basic metadata
    await targetConnection.query(`
      INSERT OR REPLACE INTO metadata (name, value) VALUES 
      ('name', '${sourceDbName}'),
      ('type', 'baselayer'),
      ('version', '1.0'),
      ('description', 'Converted from SQLite format'),
      ('format', 'jpg')
    `);
    
    console.log("Added metadata to MBTiles file");
    
    // Close connections
    await sourceConnection.destroy();
    await targetConnection.destroy();
    
    console.log(`Conversion completed successfully!`);
    console.log(`Output file: ${targetDbPath}`);
    
  } catch (error) {
    console.error("Error during conversion:", error);
    process.exit(1);
  }
};

// Run the conversion
convertSqliteToMBTiles();

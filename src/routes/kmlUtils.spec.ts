import { expect } from "chai";
import fs from "fs";
import { FeatureCollection } from "geojson";
import { kmlToJson, jsonToKml } from "./kmlUtils";

describe("kmlUtils", () => {
  it("should parse valid kml", () => {
    const kml = fs.readFileSync("./tmp/test.kml");
    const json = kmlToJson(kml.toString());
    console.log("track:", json);
    expect(!!json).to.equal(true);
  });

  it("should generate valid kml", () => {
    const geoJson: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [44.328298, 56.079617],
              [44.328377, 56.079494],
              [44.328399, 56.079403],
              [44.328434, 56.079301],
              [44.328482, 56.079193],
            ],
          },
          properties: {},
          id: "1",
        },
      ],
    };
    const kml = jsonToKml({
      id: "test",
      name: "test",
      geoJson,
      timestamp: 123,
    });
    expect(!!kml).to.equal(true);
  });
});

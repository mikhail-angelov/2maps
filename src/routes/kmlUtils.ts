import { Position, Feature, LineString } from "geojson";
import dayjs from "dayjs";
import _ from "lodash";
import { v4 as uuid } from "@lukeed/uuid";
import { TrackDto } from "../dto/track.dto";

import { XMLBuilder } from "fast-xml-parser";
import { DOMParser } from "xmldom";
const tj = require("@mapbox/togeojson");

const addAltitude = ([lng, lat]: Position) => [lng, lat, 0];

export const kmlToJson = (data: string): TrackDto | null => {
  const kml = new DOMParser().parseFromString(data);
  const geoJson = tj.kml(kml);
  const feature = geoJson.features[0];
  if (!feature) {
    return null;
  }
  const id = feature?.id || uuid();
  const name =
    feature?.properties?.name || `track ${dayjs().format("YY.MM.DD HH-mm")}`;
  const timestamp = feature?.timespan?.begin
    ? dayjs(feature?.timespan?.begin).unix()
    : Date.now();
  return { id, name, geoJson, timestamp };
};

export const jsonToKml = (track: TrackDto): string => {
  const name =
    track.name || `track ${dayjs(track.timestamp).format("YY.MM.DD HH-mm")}`;
  const feature = track.geoJson.features[0] as Feature<LineString>;
  const coords = feature.geometry.coordinates;
  const coordinates = coords.map(addAltitude).join(" ");
  const timeStart = dayjs(track.timestamp).toISOString() || "";
  const timeEnd = dayjs(track.timestamp).toISOString() || "";
  const id = track.id || "";
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
  });
  const data = builder.build({
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
      "@_standalone": "yes",
    },
    kml: {
      Document: {
        id,
        name,
        description: "2maps.xyz",
        open: 1,
        Placemark: {
          name,
          TimeSpan: {
            begin: timeStart,
            end: timeEnd,
          },
          LineString: {
            tessellate: 1,
            coordinates,
          },
          "@_id": "track",
        },
      },
    },
    "@_xmlns": "http://www.opengis.net/kml/2.2",
    "@_xmlns:gx": "http://www.google.com/kml/ext/2.2",
    "@_xmlns:atom": "http://www.w3.org/2005/Atom",
  });

  return data;
};

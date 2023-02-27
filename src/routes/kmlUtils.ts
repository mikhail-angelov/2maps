import { Position, Feature, LineString } from "geojson";
import dayjs from "dayjs";
import _ from "lodash";
import { v4 as uuid } from "@lukeed/uuid";
import { TrackDto } from "../dto/track.dto";

import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

const addAltitude = (coordinates: Position) => [...coordinates, 0];

export const kmlToJson = (data: string): TrackDto | null => {
  const xml = new XMLParser({
    ignoreAttributes: false,
  }).parse(data);

  const placemark = xml?.kml?.Document?.Placemark;
  if (!placemark) {
    return null;
  }
  const coords = placemark["gx:MultiTrack"]["gx:Track"]["gx:coord"];
  const coordinates: Position[] = coords.map((coord: string) => {
    const [lng, lat] = coord.split(" ");
    return [+lng, +lat];
  });
  const track: Feature<LineString> = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {},
  };
  const id = xml.kml.Document.id || uuid();
  const name = placemark.name || `track ${dayjs().format("YY.MM.DD HH-mm")}`;
  const timestamp = placemark?.TimeSpan?.begin
    ? dayjs(placemark?.TimeSpan?.begin).unix()
    : Date.now();
  return { id, name, track, timestamp };
};

export const jsonToKml = (track: TrackDto): string => {
  const name =
    track.name || `track ${dayjs(track.timestamp).format("YY.MM.DD HH-mm")}`;
  const coords = track.track.geometry.coordinates;
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

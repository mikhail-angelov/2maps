import { Feature, LineString } from "geojson";

export interface TrackDto {
  id: string;
  name: string;
  image?: Buffer;
  track: Feature<LineString>;
  timestamp: number;
}

export interface TrackItemDto {
    id: string;
    name: string;
    image?: Buffer;
    timestamp: number;
  }
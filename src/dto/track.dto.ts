import { FeatureCollection } from "geojson";

export interface TrackDto {
  id: string;
  name: string;
  image?: Buffer;
  geoJson: FeatureCollection;
  timestamp: number;
}

export interface TrackItemDto {
    id: string;
    name: string;
    image?: Buffer;
    timestamp: number;
  }
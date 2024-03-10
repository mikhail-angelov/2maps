export default function (gj) {
  let coords; let
    bbox;
  if (!gj.hasOwnProperty('type')) return;
  coords = getCoordinatesDump(gj);
  bbox = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  return coords.reduce((prev, coord) => [
    Math.min(coord[0], prev[0]),
    Math.min(coord[1], prev[1]),
    Math.max(coord[0], prev[2]),
    Math.max(coord[1], prev[3]),
  ], bbox);
}

function getCoordinatesDump(gj) {
  let coords;
  if (gj.type == 'Point') {
    coords = [gj.coordinates];
  } else if (gj.type == 'LineString' || gj.type == 'MultiPoint') {
    coords = gj.coordinates;
  } else if (gj.type == 'Polygon' || gj.type == 'MultiLineString') {
    coords = gj.coordinates.reduce((dump, part) => dump.concat(part), []);
  } else if (gj.type == 'MultiPolygon') {
    coords = gj.coordinates.reduce((dump, poly) => dump.concat(poly.reduce((points, part) => points.concat(part), [])), []);
  } else if (gj.type == 'Feature') {
    coords = getCoordinatesDump(gj.geometry);
  } else if (gj.type == 'GeometryCollection') {
    coords = gj.geometries.reduce((dump, g) => dump.concat(getCoordinatesDump(g)), []);
  } else if (gj.type == 'FeatureCollection') {
    coords = gj.features.reduce((dump, f) => dump.concat(getCoordinatesDump(f)), []);
  }
  return coords;
}

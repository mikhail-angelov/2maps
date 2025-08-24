# 2maps

Map tiles provider
It gets map tiles from sqlite db and provides the over http

# How to get OSM vector tiles
- download osm pbf file for your region (e.g. RU-NIZ.pbf from http://osmosis.svimik.com/latest/) or [https://download.geofabrik.de/russia/volga-fed-district.html](https://download.geofabrik.de/russia/volga-fed-district.html)
- convert pbf file to map box sqlite format (mbtiles)
    - clone [https://github.com/systemed/tilemaker](https://github.com/systemed/tilemaker) repo
    - copy `RU-NIZ.pbf` to `~/repo/tilemaker/data/RU-NIZ.pbf`
    - build docker image `docker build . -t tilemaker`
    - run converter `docker run --rm -it -v .:/srv tilemaker --input=/srv/RU-NIZ.pbf --output=/srv/nn.mbtiles`
- now you can use `nn.mbtiles` as sqlite DB

- or you cal load mbtiles for your district form here [https://data.maptiler.com/downloads/dataset/osm/russia/volga-fed-district](https://data.maptiler.com/downloads/dataset/osm/russia/volga-fed-district)

# limit mbtiles files for given lat/long rect

this script is designed to filter some region from mbtiles sqlite db

```
node copy_mbtiles.js
```

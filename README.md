# mapnn-tiles

Map tiles provider
It gets map tiles from sqlite db and provides the over http

# How to get OSM vector tiles
- download osm pbf file for your region (e.g. RU-NIZ.pbf from https://needgeo.com/#regions)
- convert pbf file to map box sqlite format (mbtiles)
    - clone [https://github.com/systemed/tilemaker](https://github.com/systemed/tilemaker) repo
    - copy `RU-NIZ.pbf` to `~/repo/tilemaker/data/RU-NIZ.pbf`
    - get bounding box from it `osmium fileinfo -e data/RU-NIZ.pbf`
    - build docker image `docker build . -t tilemaker`
    - run converter `docker run -v ~/repo/tilemaker/data:/srv -it --rm tilemaker:latest tilemaker /srv/RU-NIZ.pbf --output=srv/nn.mbtiles --bbox 40.2203072,53.2465728,48.3677114,58.4653386`
- now you can use `nn.mbtiles` as sqlite DB


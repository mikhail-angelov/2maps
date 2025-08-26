import express from "express";
import { CommonRoutesConfig } from "./common";

const secret = process.env.VALHALLA_SECRET; //temp solution

export class Navigation implements CommonRoutesConfig {
  getRoutes() {
    const router = express.Router();
    router.post(`/${secret}`, async (req, res) => {
      try {
        console.log("Navigation request: ", req.body);
        const response = await fetch("http://valhalla:8002/route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        });

        // Forward status and headers
        res.status(response.status);
        for (const [key, value] of response.headers.entries()) {
          res.setHeader(key, value);
        }

        // Forward response body
        const data = await response.json();
        res.json(data);
      } catch (error) {
        res.status(500).send("Proxy error: " + error.message);
      }
    });
    return router;
  }

  //from https://valhalla.github.io/valhalla/decoding/
  parseShape(str: string) {
    let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, 6);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {
      // Reset shift, result, and byte
      byte = null;
      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      latitude_change = result & 1 ? ~(result >> 1) : result >> 1;

      shift = result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      longitude_change = result & 1 ? ~(result >> 1) : result >> 1;

      lat += latitude_change;
      lng += longitude_change;

      coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
  }
}

import express from "express";
import axios from "axios";
import { CommonRoutesConfig } from "./common";

interface NavigationLocation {
  lat: number;
  lon: number;
}

export class Navigation implements CommonRoutesConfig {
  getRoutes() {
    const router = express.Router();
    router.get("/route", async (req, res) => {
      try {
        const { from, to } = req.body;
        const route = await this.getNavigationRoute(from, to);
        if (!route) {
          console.log("cannot get route", req.body);
          return res.status(400).send("cannot get route");
        }
        const track = this.parseShape(route.trip.legs[0].shape);
        res.json(track);
      } catch (e) {
        console.error(e);
        res.status(400).send(`cannot get route: ${e}`);
      }
    });
    return router;
  }

  async getNavigationRoute(from: NavigationLocation, to: NavigationLocation) {
    const response = await axios.post(`${process.env.VALHALLA_HOST}/route`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        locations: [from, to],
        costing: "auto",
      },
    });
    return response.data;
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

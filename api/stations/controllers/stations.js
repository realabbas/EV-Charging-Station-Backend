"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "KM") {
      dist = dist * 1.609344;
    }
    if (unit == "MI") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

module.exports = {
  async nearbyStation(ctx) {
    const { latitude, longitude, radius, unit } = ctx.request.body;

    // query by area first then add the calculate distance function

    const station = await strapi.query("stations").find({});

    // Empty array for result

    let data;

    // Calculate function

    data = station.filter((index, key) => {
      let geo = distance(
        index.latitude,
        index.longitude,
        latitude,
        longitude,
        unit
      );
      return geo > radius ? (index.distance = geo) : null;
    });

    ctx.send({ resultSize: data.length, data });
  },
  async lockStation(ctx) {
    const { station_id, user_id } = ctx.request.body;

    // updateData

    const updateData = {
      status: "LOCKED",
      user_id,
    };

    // query

    const query = await strapi
      .query("stations")
      .update({ id: station_id }, updateData);

    ctx.send({ data: query });
  },
  async unlockStation(ctx) {
    const { station_id } = ctx.request.body;

    // updateData

    const updateData = {
      status: "AVAILABLE",
      user_id: "",
    };

    // query

    const query = await strapi
      .query("stations")
      .update({ id: station_id }, updateData);

    ctx.send({ data: query });
  },
};

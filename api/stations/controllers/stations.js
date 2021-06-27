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
  async addConnector(ctx) {
    const { station_id } = ctx.request.body;

    const data = await strapi
      .query("stations")
      .findOne({ id: station_id });

    console.log("Data", data)

    let temp = data.connectors;

    console.log("Body CONNECTOR", ctx.request.body.connector)

    temp.push(ctx.request.body.connector)

    console.log("TEMP", temp)

    // updateData

    const updateData = {
      connectors: temp
    };

    // query

    const query = await strapi
      .query("stations")
      .update({ id: station_id }, updateData);

    ctx.send({ status: 1 });
  },
  async availableSlots(ctx) {

    const { connector_id, date } = ctx.request.body

    const query = await strapi
      .query("bookings")
      .find({ connector_id });

    let booked_slots = [];

    const current_time = new Date().toISOString()
    const booked_from = "2021-06-19T05:00:00.000Z";
    const booked_to = "2021-06-19T06:00:00.000Z";

    console.log(new Date(booked_from).toLocaleTimeString(undefined, { timeZone: 'Asia/Kolkata' }))

    query.map((i, j) => {
      new Date().toDateString() === date ? (booked_slots.push(`${new Date(i.booked_from).toLocaleTimeString(undefined, { timeZone: 'Asia/Kolkata' })} - ${new Date(i.booked_to).toLocaleTimeString(undefined, { timeZone: 'Asia/Kolkata' })}`)) : null
    })

    // C = A.filter(function (val) {
    //   return B.indexOf(val) == -1;
    // });

    ctx.send({ bookings: booked_slots.length, booked_slots });
  },
};

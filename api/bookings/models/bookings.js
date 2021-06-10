"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  // lifecycles: {
  //   async afterCreate(result, data) {
  //     try{
  //       const user = await strapi
  //       .query("user", "users-permissions")
  //       .findOne({ id: data.user_id });
  //     const station = await strapi
  //       .query("stations")
  //       .findOne({ id: data.station_id });

  //     strapi.services.sms.send(
  //       user.phone,
  //       `Your Booking is confirmed with booking id ${result.id} from ${result.booked_from} to ${result.booked_to} at ${station.name}`
  //     );
  //     }
  //     catch(err){
  //       console.log("Error happened", err)
  //     }
  //   },
  // },
};

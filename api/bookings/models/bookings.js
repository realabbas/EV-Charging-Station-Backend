'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
 const twilio = {
    id: "AC436947d80991ee7cae6d4a52978f3c61",
    token: "c339e4f4c8d0c107e2ac7e2bade9f677",
    phone: "+16178588313",
  };
  const smsClient = require("twilio")(twilio.id, twilio.token);

module.exports = {
    lifecycles:{
        async afterCreate(result, data){
            const user = await strapi.query("user", "users-permissions").findOne({ id: data.user_id });
            const station = await strapi.query("stations").findOne({ id: data.station_id });

            // console.log("After cycle triggered",result)
            await smsClient.messages.create({
                to: user.phone,
                from: twilio.phone,
                body: `Your Booking is confirmed with booking id ${result.id} from ${result.booked_from} to ${result.booked_to} in ${station.name}`,
              });
        }
    }
};

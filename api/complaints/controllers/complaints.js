"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async userComplaints(ctx) {

    const { id } = ctx.state.user;

    // console.log("ID", id, typeof id)

    const data = await strapi.query("complaints").find({ user_id: id });

    ctx.send({ data, size: data.length });
  },
};

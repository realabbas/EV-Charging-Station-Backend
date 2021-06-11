"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  async userComplaints(ctx) {

    const { id } = ctx.state.user;

    // console.log("ID", id, typeof id)

    const data = await strapi.query("complaints").find({ user_id: id });

    ctx.send({ data, size: data.length });
  },
  async create(ctx) {

    const body = ctx.request.body
    body.user_id = ctx.state.user.id

    const data = await strapi.query("complaints").find({ user_id: body.user_id });

    let active = 0;
    data.map((i, j) => {
      i.status === "UNRESOLVED" ? active += 1 : null
    })
    console.log("Active beneath map function", active)
    if(active<=1){
      console.log("Active inside first condition", active)
      const entity = await strapi.services.complaints.create(body);
      return sanitizeEntity(entity, { model: strapi.models.complaints });
    }
    else{
      console.log("Active inside second condition", active)

      ctx.send({ message: "You have 2 active complaints" })
    }
    console.log("Active at end", active)

  },
};
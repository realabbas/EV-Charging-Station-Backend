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
    const entity = await strapi.services.complaints.create(body);

    return sanitizeEntity(entity, { model: strapi.models.complaints });
  },
};
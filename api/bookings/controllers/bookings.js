'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async create(ctx) {

        const body = ctx.request.body
        body.user_id = ctx.state.user.id
        const entity = await strapi.services.bookings.create(body);

        return sanitizeEntity(entity, { model: strapi.models.complaints });
    },
    async userBookingList(ctx) {

        const user_id = ctx.state.user.id;
        // query
        console.log("13", user_id)
        const query = await strapi
            .query("bookings")
            .find({ user_id: user_id });

        ctx.send({ data: query, size: query.length });
    },
    async allBookings(ctx) {

        const query = await strapi
            .query("bookings")
            .find({});

        ctx.send({ data: query, size: query.length });
    },
};

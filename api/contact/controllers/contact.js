'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {

        const query = await strapi
            .query("contact")
            .find({});

        ctx.send({ data: query, size: query.length });
    }
};

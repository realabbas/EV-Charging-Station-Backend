'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
var sha256 = require('js-sha256');

module.exports = {
    async callback(ctx) {
        console.log("POST Call", ctx.request.body)
        ctx.send({ data: ctx.request.body });
    },
    async createPaymentOrder(ctx) {
        const body = ctx.request.body
        let order = await strapi.services.payments.createOrder(body)

        const entity = await strapi.services.payments.create({
            user_id: ctx.state.user.id,
            order_id: order.id
        });
        sanitizeEntity(entity, { model: strapi.models.payments });
        ctx.send({ data: order });
    },
    async verifyPayment(ctx) {

        let updateData = {
            razorpay_payment_id: ctx.request.body.razorpay_payment_id,
            razorpay_order_id: ctx.request.body.razorpay_order_id,
            razorpay_signature: ctx.request.body.razorpay_signature,
        }

        const razorpay_signature = ctx.request.body.razorpay_signature
        const razorpay_payment_id = ctx.request.body.razorpay_payment_id
        const secret = "XiN8fwyJCKwM2oObdeZrw4jm"
        const order_id = ctx.request.body.order_id

        // Verifying Signature
        const generated_signature = sha256.hmac(secret, order_id + "|" + razorpay_payment_id);
        let booking_query;
        if (generated_signature == razorpay_signature) {

            console.log("Success")
            updateData.status = "SUCCESS"

            // Create a Booking Entry`
            let body = ctx.request.body.booking
            body.user_id = ctx.state.user.id
            booking_query = await strapi.services.bookings.create(body);
            updateData.booking_id = booking_query.id
            sanitizeEntity(booking_query, { model: strapi.models.bookings });

        } else {
            console.log("Failed")
            updateData.status = "FAILED"
        }

        // Create a Payment entry
        const payment_entry = await strapi
            .query("payments")
            .update({ order_id: order_id }, updateData);

        console.log("payment_entry", payment_entry)

        const find_payment = await strapi
            .query("payments")
            .findOne({ order_id: order_id });

        console.log("find_payment", find_payment)

        // Update Payment ID in booking entry
        await strapi
            .query("bookings")
            .update({ id: updateData.booking_id }, {
                payment_id: find_payment.id
            });

        ctx.send({ data: updateData.status })
    }
};

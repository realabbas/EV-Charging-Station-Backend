/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const axios = require('axios');


module.exports = {
    createOrder: async(body) => {
        const data = JSON.stringify(body);
        const config = {
            method: 'post',
            url: 'https://api.razorpay.com/v1/orders',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic cnpwX3Rlc3RfTVVLRkpCQUhHbUxmSDU6WGlOOGZ3eUpDS3dNMm9PYmRlWnJ3NGpt'
            },
            data: data
        };

        const response = await axios(config)
        console.log("CREATE ORDER PRIVATE API", response.data)
        return response.data
    },

};

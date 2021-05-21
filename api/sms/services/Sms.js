const twilio = {
  id: "AC436947d80991ee7cae6d4a52978f3c61",
  token: "c339e4f4c8d0c107e2ac7e2bade9f677",
  phone: "+16178588313",
};
const smsClient = require("twilio")(twilio.id, twilio.token);

module.exports = {
  send: (to, template) => {
    return smsClient.messages.create({
      to,
      from: twilio.phone,
      body: template,
    });
  },
};

// Usage

// strapi.services.sms.send('+919140888233',"CEO Ali Abbas");
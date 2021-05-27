const twilio = {
  id: "AC436947d80991ee7cae6d4a52978f3c61",
  token: "c339e4f4c8d0c107e2ac7e2bade9f677",
  phone: "+16178588313",
};
const smsClient = require("twilio")(twilio.id, twilio.token);

const axios = require('axios');
const config =(to, token)=> {
    return { 
      method: 'get',
      url: `http://hindit.biz/api/pushsms?entityid=1201160672190426707&templateid=1207161795080341079&user=Divyansh&authkey=92bmqjEf8v62&sender=EDENSH&mobile=${to}&text=Your%20one%20time%20password%20for%20eden%20smart%20homes%20verification%20is%20${token}&rpt=1%0A`,
      headers: { 
        'x-api-key': '39Ry7Vgo629os6vssExN1qRhAiBx7ms3mLWrIDO7'
      }
    }
};
    

module.exports = {
  sendFromTwilio: (to, template) => {
    return smsClient.messages.create({
      to,
      from: twilio.phone,
      body: template,
    });
  },
  send:(to, token, template)=>{
    return axios(config(to, token))
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
    
  }
};

// Usage

// strapi.services.sms.send('+919140888233',"CEO Ali Abbas");
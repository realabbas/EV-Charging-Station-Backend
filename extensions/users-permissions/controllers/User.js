const twilio = {
  id: "AC436947d80991ee7cae6d4a52978f3c61",
  token: "c339e4f4c8d0c107e2ac7e2bade9f677",
  phone: "+16178588313",
};
const _ = require("lodash");
const smsClient = require("twilio")(twilio.id, twilio.token);
const { sanitizeEntity } = require("strapi-utils");

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

module.exports = {
  async signup(ctx) {
    const { phone } = ctx.request.body;

    if (!phone) return ctx.badRequest("missing.phone");
    // if (!username) return ctx.badRequest("missing.username");

    const userWithThisNumber = await strapi
      .query("user", "users-permissions")
      .findOne({ phone });

    if (userWithThisNumber) {
      return ctx.badRequest(null, [
        {
          message: [
            {
              id: "Auth.form.error.phone.taken",
              message: "Phone already taken.",
              field: ["phone"],
            },
          ],
        },
      ]);
    }
    // return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }]);

    const token = Math.floor(Math.random() * 90000) + 10000;

    const user = {
      phone,
      provider: "local",
      token,
    };

    const advanced = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "users-permissions",
        key: "advanced",
      })
      .get();

    const defaultRole = await strapi
      .query("role", "users-permissions")
      .findOne({ type: advanced.default_role }, []);

    user.role = defaultRole.id;

    try {
      const data = await strapi.plugins["users-permissions"].services.user.add(
        user
      );
      console.log("entered here");
      await smsClient.messages.create({
        to: phone,
        from: twilio.phone,
        body: `Your verification code is ${token}`,
      });
      ctx.created(sanitizeUser(data));
    } catch (error) {
      ctx.badRequest(null, [{ messages: [{ error }] }]);
    }
  },
  async login(ctx) {
    const { phone } = ctx.request.body;

    if (!phone) return ctx.badRequest("missing.phone");
    // if (!username) return ctx.badRequest("missing.username");

    const userWithThisNumber = await strapi
      .query("user", "users-permissions")
      .findOne({ phone });

    if (!userWithThisNumber) {
      return ctx.badRequest(null, [
        {
          message: [
            {
              id: "Auth.form.error.phone.taken",
              message: "Phone Number doesnt exist.",
              field: ["phone"],
            },
          ],
        },
      ]);
    }
    // return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }]);

    const token = Math.floor(Math.random() * 90000) + 10000;

    const user = {
      phone,
      provider: "local",
      token,
    };

    const advanced = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "users-permissions",
        key: "advanced",
      })
      .get();

    const defaultRole = await strapi
      .query("role", "users-permissions")
      .findOne({ type: advanced.default_role }, []);

    user.role = defaultRole.id;

    try {
      // const data = await strapi.plugins["users-permissions"].services.user.add(
      //   user
      // );
      await strapi
        .query("user", "users-permissions")
        .update({ phone }, { token });

      await smsClient.messages.create({
        to: phone,
        from: twilio.phone,
        body: `Your verification code is ${token}`,
      });
      // ctx.created(sanitizeUser(data));
      ctx.send({ message: "OTP Sent from Twilio", status: 200 });
    } catch (error) {
      ctx.badRequest(null, [{ messages: [{ error }] }]);
    }
  },
  async verifyAccount(ctx) {
    const { phone, token } = ctx.request.body;

    if (!phone) return ctx.badRequest("missing.phone");
    if (!token) return ctx.badRequest("missing.token");

    const verifyUserCode = await strapi
      .query("user", "users-permissions")
      .findOne({ phone, token });

    if (!verifyUserCode) {
      return ctx.send({ message:"Invalid OTP" });
      // return ctx.badRequest(null, [
      //   {
      //     messages: [
      //       {
      //         id: "Auth.form.error.code.invalid",
      //         message: "Invalid Code or Number",
      //         field: ["phone"],
      //       },
      //     ],
      //   },
      // ]);
    }

    let updateData = {
      token: "",
      confirmed: true,
    };
    // console.log("ID",{id})
    const user_data = await strapi
      .query("user", "users-permissions")
      .findOne({ phone, token });
    // const { user: userService, jwt: jwtService } = strapi.plugins['users-permissions'].services;
    // const user = await userService.fetch({ phone }, []);

    // await strapi.plugins["users-permissions"].services.user.edit(
    //   user_data.id,
    //   updateData
    // );
    await strapi
      .query("user", "users-permissions")
      .update({ phone }, updateData);

    console.log("DATA", user_data);

    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user_data.id,
    });

    console.log(ctx.state.user);

    // ctx.send({ jwt, user: sanitizeUser(data),  });
    ctx.send({ jwt, user: user_data });
  },
  async profile(ctx) {
    console.log("PROFILE Called", ctx.state);

    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    ctx.body = sanitizeUser(user);
    ctx.send({ user: sanitizeUser(user) });
  },
  async status(ctx) {
    ctx.send({ status: 200 });
  },
  async sendEmail(ctx) {
    const { to, subject, text } = ctx.request.body;

    await strapi.plugins["email"].services.email.send({
      to,
      from: "bot@devlab.works",
      subject,
      text,
    });
    ctx.send({ message: "Email Sent from SendGrid", status: 200 });
  },
  async profileUpdate(ctx) {
    const user = ctx.state.user;

    const { data } = ctx.request.body;

    const updatedData = await strapi
      .query("user", "users-permissions")
      .update({ id: user.id }, data);

    ctx.send({ message: "Updated", status: 200, updatedData });
  },
  async passwordless(ctx) {
    const { phone } = ctx.request.body;

    if (!phone) return ctx.badRequest("missing.phone");

    const userWithThisNumber = await strapi
      .query("user", "users-permissions")
      .findOne({ phone });

    if (userWithThisNumber) {
      console.log("USER_ALREADY_REGISTERED");
      const token = Math.floor(Math.random() * 90000) + 10000;

      const user = {
        phone,
        provider: "local",
        token,
      };

      const advanced = await strapi
        .store({
          environment: "",
          type: "plugin",
          name: "users-permissions",
          key: "advanced",
        })
        .get();

      const defaultRole = await strapi
        .query("role", "users-permissions")
        .findOne({ type: advanced.default_role }, []);

      user.role = defaultRole.id;

      try {

        await strapi
          .query("user", "users-permissions")
          .update({ phone }, { token });
        strapi.services.sms.send(phone, token,`EDEN-EV: Your verification code is ${token}`);
        ctx.send({ message: "OTP Sent", status: 200 });
      } catch (error) {
        ctx.badRequest(null, [{ messages: [{ error }] }]);
      }
    } else {
      console.log("USER_TO_BE_REGISTERED");

      const token = Math.floor(Math.random() * 90000) + 10000;

      const user = {
        phone,
        provider: "local",
        token,
      };

      const advanced = await strapi
        .store({
          environment: "",
          type: "plugin",
          name: "users-permissions",
          key: "advanced",
        })
        .get();

      const defaultRole = await strapi
        .query("role", "users-permissions")
        .findOne({ type: advanced.default_role }, []);

      user.role = defaultRole.id;

      try {
        const data = await strapi.plugins[
          "users-permissions"
        ].services.user.add(user);
        console.log("entered here");
        // await smsClient.messages.create({
        //   to: phone,
        //   from: twilio.phone,
        //   body: `Your verification code is ${token}`,
        // });
        strapi.services.sms.send(phone, token,`EDEN-EV: Your verification code is ${token}`);
        ctx.created(sanitizeUser(data));
      } catch (error) {
        ctx.badRequest(null, [{ messages: [{ error }] }]);
      }
    }
  },
  async logout(ctx) {
    const user = ctx.state.user;

    const params = _.assign({}, ctx.request.body, ctx.request.query);

    let token = "";

    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const parts = ctx.request.header.authorization.split(" ");

      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw new Error(
          "Invalid authorization header format. Format is Authorization: Bearer [token]"
        );
      }
    } else if (params.token) {
      token = params.token;
    } else {
      throw new Error("No authorization header was found");
    }

    const data = await strapi.query("jwt-credentials").findOne({ jwt: token });
    if (!data) {
      await strapi.query("jwt-credentials").create({ jwt: token });
    }

    ctx.send({ message: "Logout Successfully", status: 200 });
  },
};

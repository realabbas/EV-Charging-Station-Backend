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
const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  async create(ctx) {
    const { phone, username } = ctx.request.body;

    if (!phone) return ctx.badRequest("missing.phone");
    if (!username) return ctx.badRequest("missing.username");

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
      username,
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
    const { phone, username } = ctx.request.body;

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
      username,
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
      return ctx.badRequest(null, [
        {
          messages: [
            {
              id: "Auth.form.error.code.invalid",
              message: "Invalid Code or Number",
              field: ["phone"],
            },
          ],
        },
      ]);
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
  async checks(ctx) {
    ctx.send({ check: true });
  },
  // async login(ctx) {
  //   const provider = ctx.params.provider || 'local';
  //   const params = ctx.request.body;

  //   const store = await strapi.store({
  //     environment: '',
  //     type: 'plugin',
  //     name: 'users-permissions',
  //   });

  //   if (provider === 'local') {
  //     if (!_.get(await store.get({ key: 'grant' }), 'email.enabled')) {
  //       return ctx.badRequest(null, 'This provider is disabled.');
  //     }

  //     // The identifier is required.
  //     if (!params.identifier) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.email.provide',
  //           message: 'Please provide your username or your e-mail.',
  //         })
  //       );
  //     }

  //     // The password is required.
  //     if (!params.password) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.password.provide',
  //           message: 'Please provide your password.',
  //         })
  //       );
  //     }

  //     const query = { provider };

  //     // Check if the provided identifier is an email or not.
  //     const isEmail = emailRegExp.test(params.identifier);

  //     // Set the identifier to the appropriate query field.
  //     if (isEmail) {
  //       query.email = params.identifier.toLowerCase();
  //     } else {
  //       query.username = params.identifier;
  //     }

  //     // Check if the user exists.
  //     const user = await strapi.query('user', 'users-permissions').findOne(query);

  //     if (!user) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.invalid',
  //           message: 'Identifier or password invalid.',
  //         })
  //       );
  //     }

  //     if (
  //       _.get(await store.get({ key: 'advanced' }), 'email_confirmation') &&
  //       user.confirmed !== true
  //     ) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.confirmed',
  //           message: 'Your account email is not confirmed',
  //         })
  //       );
  //     }

  //     if (user.blocked === true) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.blocked',
  //           message: 'Your account has been blocked by an administrator',
  //         })
  //       );
  //     }

  //     // The user never authenticated with the `local` provider.
  //     if (!user.password) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.password.local',
  //           message:
  //             'This user never set a local password, please login with the provider used during account creation.',
  //         })
  //       );
  //     }

  //     const validPassword = await strapi.plugins[
  //       'users-permissions'
  //     ].services.user.validatePassword(params.password, user.password);

  //     if (!validPassword) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'Auth.form.error.invalid',
  //           message: 'Identifier or password invalid.',
  //         })
  //       );
  //     } else {
  //       ctx.send({
  //         jwt: strapi.plugins['users-permissions'].services.jwt.issue({
  //           id: user.id,
  //         }),
  //         user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
  //           model: strapi.query('user', 'users-permissions').model,
  //         }),
  //         x: user.id
  //       });
  //     }
  //   } else {
  //     if (!_.get(await store.get({ key: 'grant' }), [provider, 'enabled'])) {
  //       return ctx.badRequest(
  //         null,
  //         formatError({
  //           id: 'provider.disabled',
  //           message: 'This provider is disabled.',
  //         })
  //       );
  //     }

  //     // Connect the user with the third-party provider.
  //     let user, error;
  //     try {
  //       [user, error] = await strapi.plugins['users-permissions'].services.providers.connect(
  //         provider,
  //         ctx.query
  //       );
  //     } catch ([user, error]) {
  //       return ctx.badRequest(null, error === 'array' ? error[0] : error);
  //     }

  //     if (!user) {
  //       return ctx.badRequest(null, error === 'array' ? error[0] : error);
  //     }
  //     console.log("USER.ID", user.id)
  //     ctx.send({
  //       jwt: strapi.plugins['users-permissions'].services.jwt.issue({
  //         id: user.id,
  //       }),
  //       user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
  //         model: strapi.query('user', 'users-permissions').model,
  //       }),
  //     });
  //   }
  // },
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
};

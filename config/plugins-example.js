module.exports = ({ env }) => ({
    upload: {
      provider: "aws-s3",
      providerOptions: {
        accessKeyId: "ACCESS_KEY_ID",
        secretAccessKey: "SECRET_ACCESS_KEY",
        region: "ap-south-1",
        params: {
          Bucket: "BUCKET_ID",
        },
      },
    },
    email: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: "APIKEY",
      },
      settings: {
        defaultFrom: "bot@devlab.works",
        defaultReplyTo: "admin@devlab.works",
        testAddress: "irizviali@gmail.com",
      },
    },
  });
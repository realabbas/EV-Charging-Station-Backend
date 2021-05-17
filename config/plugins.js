module.exports = ({ env }) => ({
    upload: {
      provider: "aws-s3",
      providerOptions: {
        accessKeyId: "AKIA5RJ23HROBSXHBKPE",
        secretAccessKey: "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",
        region: "ap-south-1",
        params: {
          Bucket: "streamflix",
        },
      },
    },
    email: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: "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",
      },
      settings: {
        defaultFrom: "bot@devlab.works",
        defaultReplyTo: "admin@devlab.works",
        testAddress: "irizviali@gmail.com",
      },
    },
  });
/// <reference path="./.sst/platform/config.d.ts" />
const { nodeExternalsPlugin } = require('esbuild-node-externals');

export default $config({
  app(input) {
    return {
      name: "Claus",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const frontend = new sst.aws.Nextjs("FrontendClaus", {
      path: './frontend',
      environment: {
        NEXT_PUBLIC_URL_API_STT_SST:`http://localhost:3004/transcript`
      }
    });

    return {
      frontend: frontend.url
    }
  },
});
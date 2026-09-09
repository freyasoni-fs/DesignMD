import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/puppeteer-core/**/*',
      './node_modules/@sparticuz/chromium/**/*'
    ],
  },
};

export default nextConfig;

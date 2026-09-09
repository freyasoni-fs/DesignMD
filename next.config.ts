import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/puppeteer-core/**/*',
      './node_modules/@sparticuz/chromium-min/**/*'
    ],
  },
};

export default nextConfig;

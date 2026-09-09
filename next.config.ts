import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium-min"],
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/playwright-core/**/*',
      './node_modules/@sparticuz/chromium-min/**/*'
    ],
  },
};

export default nextConfig;

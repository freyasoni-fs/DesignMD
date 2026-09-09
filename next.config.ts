import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/playwright-core/**/*',
        './node_modules/@sparticuz/chromium/**/*'
      ],
    },
  },
};

export default nextConfig;

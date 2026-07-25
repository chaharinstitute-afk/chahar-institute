import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shared hosting (Hostinger) has a limited MySQL connection budget. Next.js
  // defaults to spinning up dozens of parallel workers during static
  // generation, each opening its own Prisma connection pool — that flood of
  // simultaneous connections gets refused ("Can't reach database server")
  // even though the DB is reachable. Serializing generation avoids it.
  experimental: {
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1000,
  },
};

export default nextConfig;

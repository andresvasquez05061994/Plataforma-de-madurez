/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/report': ['./src/lib/report-template.html'],
      '/api/send-email': ['./src/lib/report-template.html'],
    },
  },
};

export default nextConfig;

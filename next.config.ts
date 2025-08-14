/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    domains: ['cdn.dummyjson.com'],
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === "production" ? "/patna" : "",
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["fs", "path", "cheerio", "pdf-parse", "pdfjs-dist"],

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore type errors for development
  },

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'js', 'jsx'],
}

export default nextConfig

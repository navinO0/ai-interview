/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // NOTE: Do NOT use output: 'standalone' for Netlify.
    // Netlify's Next.js plugin (@netlify/plugin-nextjs) handles SSR automatically.
    // 'standalone' is for self-hosted Docker/Node deployments.
}

module.exports = nextConfig

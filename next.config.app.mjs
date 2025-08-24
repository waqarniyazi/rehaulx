/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_MODE: 'app'
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/repurpose',
      },
    ]
  },
}

export default nextConfig

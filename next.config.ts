/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, xr-spatial-tracking=*'
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig
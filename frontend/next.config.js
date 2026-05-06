/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000', // Match your FastAPI port
                pathname: '/backend-ymmo/assets/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/backend-ymmo/assets/**',
            }
        ],
    },
};

module.exports = nextConfig;
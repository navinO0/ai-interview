export const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    enableSocket: process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true',
};

export default config;

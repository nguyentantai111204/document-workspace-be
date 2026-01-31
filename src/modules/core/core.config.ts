export default () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    database: {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        name: process.env.DB_NAME ?? 'mydb',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? 'default-secret',
        expiresIn: process.env.JWT_EXPIRES ?? '15m',
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD ?? '',
        db: parseInt(process.env.REDIS_DB ?? '0', 10),
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },
});
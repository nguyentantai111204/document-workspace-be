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
});
import mysql from 'mysql2/promise';
const getEnvVars = () => {
    return {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: parseInt(process.env.DB_PORT, 10),
    };
};
export const createDbConnection = async () => {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = getEnvVars();
    console.log('Attempting to connect to the database with the following details:');
    console.log(`Host: ${DB_HOST}, User: ${DB_USER}, Database: ${DB_NAME}, Port: ${DB_PORT}`);
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            port: DB_PORT,
        });
        console.log('Database connection established successfully.');
        return connection;
    }
    catch (error) {
        console.log('Failed to connect to the database:', error);
        throw error;
    }
};
//# sourceMappingURL=dbConnection.js.map
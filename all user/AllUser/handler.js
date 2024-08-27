const mysql = require("mysql2/promise");
const AWS = require("aws-sdk");

module.exports.getAllUsers = async (event) => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    const [results] = await connection.execute(
      'SELECT * FROM users WHERE status="working"'
    );

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Database query failed",
        details: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

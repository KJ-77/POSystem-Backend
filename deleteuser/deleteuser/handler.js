const mysql = require("mysql2/promise");

module.exports.deleteUser = async (event) => {
  const userId = event.pathParameters.id;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [result] = await connection.execute(
      "UPDATE  users SET status ='deleted' WHERE ID =?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting user:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    await connection.end();
  }
};

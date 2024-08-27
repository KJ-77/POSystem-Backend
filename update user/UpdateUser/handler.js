const mysql = require("mysql2/promise");

module.exports.updateUser = async (event) => {
  const userId = event.pathParameters.id;
  const { FULLNAME, email } = JSON.parse(event.body);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [result] = await connection.query(
      "UPDATE users SET FULLNAME = ?, email = ? WHERE ID = ?",
      [FULLNAME, email, userId]
    );
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User updated successfully" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating user" }),
    };
  } finally {
    await connection.end();
  }
};

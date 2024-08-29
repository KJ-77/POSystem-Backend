import { CreateUserDTO, UpdateUserDTO } from "./dto";
import { createConnection } from "../utils/db";

export const createUserservice = async (userData: CreateUserDTO) => {
  let connection;
  try {
    connection = await createConnection();

    const [result]: any = await connection.query(
      "INSERT INTO users (ID,FULLNAME, email,position) VALUES (?, ? ,?,?)",
      [userData.ID, userData.FULLNAME, userData.email, userData.position]
    );
    if (result.affectedRows === 0) {
      throw new Error("error adding user");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
export const getAllUsersservice = async () => {
  try {
    const connection = await createConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE status="working"'
    );
    return users;
  } catch (error) {
    throw new Error("Error executing query");
  }
};

export const getUserByIdservice = async (id: string) => {
  const connection = await createConnection();
  const [user]: any = await connection.execute(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );

  return user.length > 0 ? user[0] : null;
};

export const deleteUserservice = async (userId: string): Promise<void> => {
  let connection;
  try {
    connection = await createConnection();
    const [result]: any = await connection.execute(
      "UPDATE  users SET status ='deleted' WHERE ID =?",
      [userId]
    );
    if (result.affectedRows === 0) {
      throw new Error("error adding....");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const updateUserservice = async (
  userId: string,
  userData: UpdateUserDTO
): Promise<void> => {
  let connection;
  try {
    connection = await createConnection();

    const setClause = Object.keys(userData)
      .map((key) => `${key} = ?`)
      .join(", ");

    if (setClause.length === 0) {
      throw new Error("No updates provided");
    }
    const query = `UPDATE users SET ${setClause} WHERE ID = ?`;
    const values = [...Object.values(userData), userId];
    await connection.query(query, values);

    const [result]: any = await connection.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error("error udating....");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

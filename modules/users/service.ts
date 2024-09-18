import { CreateUserDTO, UpdateUserDTO } from "./dtos/dto";
import { createConnection } from "../../config/db";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminCreateUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { int } from "aws-sdk/clients/datapipeline";

const cognito = new CognitoIdentityServiceProvider();

const generateRandomPassword = (length = 10): string => {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()-_=+[]{}|;:',.<>?";

  const allChars = lower + upper + numbers + special;

  let password =
    lower[Math.floor(Math.random() * lower.length)] +
    upper[Math.floor(Math.random() * upper.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
};

export const createCognitoUser = async (userDetails: CreateUserDTO) => {
  const password = generateRandomPassword();

  const createUserParams = {
    UserPoolId: "us-east-1_7np4XcTfB",
    Username: userDetails.email,
    UserAttributes: [
      {
        Name: "email",
        Value: userDetails.email,
      },
      {
        Name: "name",
        Value: userDetails.FULLNAME,
      },
    ],
    TemporaryPassword: password,
  };
  try {
    const result = await cognito.adminCreateUser(createUserParams).promise();
    const username = result.User?.Username;

    if (!username) {
      throw new Error("Failed to retrieve username from Cognito response.");
    }

    console.log(`Created user with username: ${username}`);

    const addUserToGroupParams = {
      UserPoolId: "us-east-1_7np4XcTfB",
      Username: userDetails.email,
      GroupName: userDetails.position,
    };

    try {
      await cognito.adminAddUserToGroup(addUserToGroupParams).promise();
      console.log(`User added to group !`);
    } catch (error: any) {
      console.error(`Error adding user to group :`, error);
      if (error.code === "NoSuchEntityException") {
        throw new Error(`The group does not exist.`);
      } else if (error.code === "InvalidParameterException") {
        throw new Error(`Invalid group name:`);
      } else {
        throw new Error(`Error adding user to group: ${error.message}`);
      }
    }

    /* await cognito.adminGetUser({
      UserPoolId: 'us-east-1_7np4XcTfB',
      Username: userDetails.email,
    }).promise();*/

    return username;
  } catch (error: any) {
    console.error("Error creating or managing user:", error);
    throw new Error(`Cognito error: ${error.message}`);
  }
};

export const createUserservice = async (
  userData: CreateUserDTO,
  id: string
) => {
  let connection;
  try {
    connection = await createConnection();

    const [result]: any = await connection.query(
      "INSERT INTO users (ID,FULLNAME, email,position,status) VALUES (?, ? ,?,?,?)",
      [id, userData.FULLNAME, userData.email, userData.position, "Not verified"]
    );
    if (result.affectedRows === 0) {
      throw new Error("error adding user");
    }
  } catch (error: any) {
    console.error("Error creating user in database:", error);
    throw new Error(`Database error: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const confirmUserService = async (id: string) => {
  let connection;
  try {
    connection = await createConnection();

    await connection.query("UPDATE users SET status = 'working' where id = ?", [
      id,
    ]);
  } catch (error: any) {
    console.error("Error updating user in database:", error);
    throw new Error(`Database error: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const getAllUsersservice = async () => {
  let connection
  try {
     connection = await createConnection();
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE status IN ('working', 'Not verified')"
    );
    return users;
  } catch (error) {
    throw new Error("Error executing query");
  }finally {
    if (connection) {
      await connection.end();
    }
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

export const deleteCognitoUser = async (id: string) => {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

  try {
    /*const listUsersCommand = new ListUsersCommand({
    UserPoolId: "us-east-1_7np4XcTfB",
    Filter: `sub = "${id}"`,
  });

  const listUsersResponse = await client.send(listUsersCommand);
  if (listUsersResponse.Users && listUsersResponse.Users.length > 0) {
    const username = listUsersResponse.Users[0].Username;*/

    const deleteUserCommand = new AdminDeleteUserCommand({
      UserPoolId: "us-east-1_7np4XcTfB",
      Username: id,
    });
    await client.send(deleteUserCommand);
    console.log(`User with sub ${id} deleted successfully.`);
  } catch (error) {
    throw error;
  }
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
      throw new Error("error deleting....");
    }
    const [orderResult]: any = await connection.query(
      `
      UPDATE POSystemdb.orders
      SET order_status = 'Rejected'
      WHERE worker_id = ? AND order_status = 'Pending';
      `,
      [userId]
    );
    if (orderResult.affectedRows === 0) {
      throw new Error("Error updating order status");
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


export const updateEmailAndUsernameBySubService = async (
  sub: string,
  newUsername?: string,
  newEmail?: string
): Promise<void> => {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

  try {
    /* const listUsersCommand = new ListUsersCommand({
      UserPoolId: "us-east-1_7np4XcTfB",
      Filter: `sub = "${sub}"`,
    });

    const listUsersResponse = await client.send(listUsersCommand);
    if (!listUsersResponse.Users || listUsersResponse.Users.length === 0) {
      throw new Error(`User with sub ${sub} not found.`);
    }

    const currentUsername = listUsersResponse.Users[0].Username;*/

    const userAttributes = [];
    if (newEmail) {
      userAttributes.push({ Name: "email", Value: newEmail });
    }
    if (newUsername) {
      userAttributes.push({ Name: "name", Value: newUsername });
    }
    const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: "us-east-1_7np4XcTfB",
      Username: sub,
      UserAttributes: userAttributes,
    });

    await client.send(updateAttributesCommand);
  } catch (error: any) {
    if (error.name === "UsernameExistsException") {
      throw new Error(
        "Email already in use. Please provide a different email."
      );
    } else {
      throw error;
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

import { CreateUserDTO, UpdateUserDTO } from "./dtos/dto";
import { createConnection } from "../../config/db";
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { CognitoIdentityProviderClient, ListUsersCommand, AdminDeleteUserCommand,AdminGetUserCommand,AdminUpdateUserAttributesCommand} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityServiceProvider();


const generateRandomPassword = (length = 10): string => {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()-_=+[]{}|;:',.<>?";
  
  const allChars = lower + upper + numbers + special;
  

  let password = lower[Math.floor(Math.random() * lower.length)] +
                 upper[Math.floor(Math.random() * upper.length)] +
                 numbers[Math.floor(Math.random() * numbers.length)] +
                 special[Math.floor(Math.random() * special.length)];
  
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  password = password.split('').sort(() => 0.5 - Math.random()).join('');
  
  return password;
};

export const createCognitoUser = async (userDetails: CreateUserDTO) => {
  const password = generateRandomPassword();

  const createUserParams = {
    UserPoolId: 'us-east-1_7np4XcTfB',
    Username: userDetails.email,
    UserAttributes: [
      {
        Name: 'email',
        Value: userDetails.email
      },
      {
        Name: 'name',
        Value: userDetails.FULLNAME
      }
    ],
    TemporaryPassword: password,
  };
try{
  await cognito.adminCreateUser(createUserParams).promise();

  const addUserToGroupParams = {
    UserPoolId: 'us-east-1_7np4XcTfB',
    Username: userDetails.email,
    GroupName:  userDetails.position,
  };

  await cognito.adminAddUserToGroup(addUserToGroupParams).promise();
  const user = await cognito.adminGetUser({
    UserPoolId: 'us-east-1_7np4XcTfB',
    Username: userDetails.email,
  }).promise();
  const subAttribute = user.UserAttributes?.find(attr => attr.Name === 'sub');
  if (subAttribute) {
    return subAttribute.Value!;
  } else {
    throw new Error('User ID not found.');
  }
}
 catch (error: any) {
  console.error('Error creating or managing user:', error);
  throw error;
}
};


export const createUserservice = async (userData: CreateUserDTO , id : string) => {
  let connection;
  try {
    connection = await createConnection();

    const [result]: any = await connection.query(
      "INSERT INTO users (ID,FULLNAME, email,position,status) VALUES (?, ? ,?,?,?)",
      [id, userData.FULLNAME, userData.email, userData.position,"Not verified"]
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





export const deleteCognitoUser = async (id: string) => {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

try{
  const listUsersCommand = new ListUsersCommand({
    UserPoolId: "us-east-1_7np4XcTfB",
    Filter: `sub = "${id}"`,
  });

  const listUsersResponse = await client.send(listUsersCommand);
  if (listUsersResponse.Users && listUsersResponse.Users.length > 0) {
    const username = listUsersResponse.Users[0].Username;

    const deleteUserCommand = new AdminDeleteUserCommand({
      UserPoolId: "us-east-1_7np4XcTfB",
      Username: username,
    });
    await client.send(deleteUserCommand);
    console.log(`User with sub ${id} deleted successfully.`);
}else {
  console.error(`No user found with sub ${id}.`);
}
}
catch (error) {
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



export const updateEmailAndUsernameBySubService = async (  sub: string,newUsername?: string ,newEmail?: string): Promise<void> => {
  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

  try {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: "us-east-1_7np4XcTfB",
      Filter: `sub = "${sub}"`,
    });

    const listUsersResponse = await client.send(listUsersCommand);
    if (!listUsersResponse.Users || listUsersResponse.Users.length === 0) {
      throw new Error(`User with sub ${sub} not found.`);
    }

    const currentUsername = listUsersResponse.Users[0].Username;

    const userAttributes = [];
    if (newEmail) {
      userAttributes.push({ Name: 'email', Value: newEmail });
      userAttributes.push({ Name: 'email_verified', Value: 'false' });
    }
    if (newUsername) {
      userAttributes.push({ Name: 'name', Value: newUsername });
    }
    const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: "us-east-1_7np4XcTfB",
      Username: currentUsername,
      UserAttributes: userAttributes,
    });

    await client.send(updateAttributesCommand);

    console.log(`User updated successfully.`);
  } catch (error) {
    console.error("Error updating email and username by sub:", error);
    throw error;
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
    const query = `UPDATE users SET ${setClause}, status = 'Not Verified' WHERE ID = ?`;
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

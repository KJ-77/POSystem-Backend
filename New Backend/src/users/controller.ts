import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createUserservice,getAllUsersservice,getUserByIdservice, deleteUserservice, updateUserservice} from "./service";
import { CreateUserDTO, UpdateUserDTO } from "./dto";


export const createUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body: CreateUserDTO = JSON.parse(event.body || "{}");
    await createUserservice(body);
    return {
      statusCode: 200,
      body: JSON.stringify({message: "User created successfully"}),
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const getAllUsers = async (): Promise<APIGatewayProxyResult> => {
  try {
    const users = await getAllUsersservice();
    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const deleteUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.id!;
     const user = await getUserByIdservice(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }
    await deleteUserservice(userId);
    return {
      statusCode: 200,
      body: JSON.stringify({message: "User deleted successfully!!!"}),
    };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export const updateUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.id!;
    const userData: UpdateUserDTO = JSON.parse(event.body || '{}');
    const user = await getUserByIdservice(userId);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };}
    await updateUserservice(userId, userData);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User updated successfully' }),
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
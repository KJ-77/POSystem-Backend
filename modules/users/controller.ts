import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createUserservice,getAllUsersservice,getUserByIdservice, deleteUserservice, deleteCognitoUser,updateUserservice,createCognitoUser,updateEmailAndUsernameBySubService, confirmUserService} from "./service";
import { CreateUserDTO, UpdateUserDTO } from "./dtos/dto";
import { createUserValidate } from './validationSchema';
import middy from "@middy/core"
import validationMiddleware from '../lib/validationMiddleware';
import checkAuthToken from "../middleware/authtoken";

const headers ={
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  'Content-Type': 'application/json'
}

export const createUserc = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body: CreateUserDTO = JSON.parse(event.body || "{}");

    const id =  await createCognitoUser(body);

     await createUserservice(body , id! );
     
    return {
      statusCode: 200,
      headers ,
      body: JSON.stringify({message: "User created successfully"}),
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "UsernameExistsException") {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "User already exists" }),
        headers,
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers,
    };
  }
};

export const confirmUser = middy(
  async (event: any): Promise<APIGatewayProxyResult> => {
    try {
      const decodedToken = event.decodedToken;
      const user = await confirmUserService(decodedToken.sub);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify("user confirmed successfully"),
        
      };
    } catch (error) {
      console.error("Error handling confirm user request:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Error confirming user by ID" }),
        
      };
    }
  }
);
confirmUser.use(checkAuthToken);

export const getAllUsers = async (): Promise<APIGatewayProxyResult> => {
  try {
    const users = await getAllUsersservice();
    return {
      statusCode: 200,
      headers ,
      body: JSON.stringify(users),
    };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return {
      statusCode: 500,
      headers,
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
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }
    await deleteCognitoUser(userId);
    await deleteUserservice(userId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: "User deleted successfully!!!"}),
    };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return {
      statusCode: 500,
      headers,
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
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };}
      if (!userData.FULLNAME && !userData.email) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "At least one of newEmail or newUsername is required" }),
        };
      }
    await updateEmailAndUsernameBySubService(userId,userData.FULLNAME,userData.email)
    await updateUserservice(userId, userData);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'User updated successfully' }),
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

//exports.createUser = middy(createUserc).use(validationMiddleware(createUserValidate));

export const createUser = middy(createUserc).use(checkAuthToken).use(validationMiddleware(createUserValidate));




//export const createUser = middy().use(validationMiddleware(createUserValidate)).handler(createUserc);

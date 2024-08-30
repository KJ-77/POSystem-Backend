import { createUserservice, getAllUsersservice, getUserByIdservice, deleteUserservice, updateUserservice } from "./service";
import { createUserValidate } from '../middleware/validationSchema';
import middy from "@middy/core";
import validationMiddleware from '../middleware/validationUser';
export const createUserc = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        await createUserservice(body);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User created successfully" }),
        };
    }
    catch (error) {
        console.error("Error creating user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
export const getAllUsers = async () => {
    try {
        const users = await getAllUsersservice();
        return {
            statusCode: 200,
            body: JSON.stringify(users),
        };
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
export const deleteUser = async (event) => {
    try {
        const userId = event.pathParameters?.id;
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
            body: JSON.stringify({ message: "User deleted successfully!!!" }),
        };
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
export const updateUser = async (event) => {
    try {
        const userId = event.pathParameters?.id;
        const userData = JSON.parse(event.body || '{}');
        const user = await getUserByIdservice(userId);
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "User not found" }),
            };
        }
        await updateUserservice(userId, userData);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User updated successfully' }),
        };
    }
    catch (error) {
        console.error('Error updating user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
export const createUser = middy(createUserc).use(validationMiddleware(createUserValidate));
//# sourceMappingURL=controller.js.map
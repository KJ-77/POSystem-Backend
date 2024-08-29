"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.getAllUsers = exports.createUser = void 0;
const service_1 = require("./service");
const createUser = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        await (0, service_1.createUserservice)(body);
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
exports.createUser = createUser;
const getAllUsers = async () => {
    try {
        const users = await (0, service_1.getAllUsersservice)();
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
exports.getAllUsers = getAllUsers;
const deleteUser = async (event) => {
    try {
        const userId = event.pathParameters?.id;
        const user = await (0, service_1.getUserByIdservice)(userId);
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "User not found" }),
            };
        }
        await (0, service_1.deleteUserservice)(userId);
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
exports.deleteUser = deleteUser;
const updateUser = async (event) => {
    try {
        const userId = event.pathParameters?.id;
        const userData = JSON.parse(event.body || '{}');
        const user = await (0, service_1.getUserByIdservice)(userId);
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "User not found" }),
            };
        }
        await (0, service_1.updateUserservice)(userId, userData);
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
exports.updateUser = updateUser;

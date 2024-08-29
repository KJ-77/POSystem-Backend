"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.createUser = void 0;
const service_1 = require("./users/service");
const userService = new service_1.UserService();
const createUser = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const result = await userService.createUser(body);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
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
        const users = await userService.getAllUsers();
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

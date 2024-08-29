"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserservice = exports.deleteUserservice = exports.getUserByIdservice = exports.getAllUsersservice = exports.createUserservice = void 0;
const db_1 = require("../utils/db");
const createUserservice = async (userData) => {
    let connection;
    try {
        connection = await (0, db_1.createConnection)();
        const [result] = await connection.query("INSERT INTO users (ID,FULLNAME, email,position) VALUES (?, ? ,?,?)", [userData.ID, userData.FULLNAME, userData.email, userData.position]);
        if (result.affectedRows === 0) {
            throw new Error("error adding user");
        }
    }
    catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.createUserservice = createUserservice;
const getAllUsersservice = async () => {
    try {
        const connection = await (0, db_1.createConnection)();
        const [users] = await connection.execute('SELECT * FROM users WHERE status="working"');
        return users;
    }
    catch (error) {
        throw new Error("Error executing query");
    }
};
exports.getAllUsersservice = getAllUsersservice;
const getUserByIdservice = async (id) => {
    const connection = await (0, db_1.createConnection)();
    const [user] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);
    return user.length > 0 ? user[0] : null;
};
exports.getUserByIdservice = getUserByIdservice;
const deleteUserservice = async (userId) => {
    let connection;
    try {
        connection = await (0, db_1.createConnection)();
        const [result] = await connection.execute("UPDATE  users SET status ='deleted' WHERE ID =?", [userId]);
        if (result.affectedRows === 0) {
            throw new Error("error adding....");
        }
    }
    catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.deleteUserservice = deleteUserservice;
const updateUserservice = async (userId, userData) => {
    let connection;
    try {
        connection = await (0, db_1.createConnection)();
        const setClause = Object.keys(userData)
            .map((key) => `${key} = ?`)
            .join(", ");
        if (setClause.length === 0) {
            throw new Error("No updates provided");
        }
        const query = `UPDATE users SET ${setClause} WHERE ID = ?`;
        const values = [...Object.values(userData), userId];
        await connection.query(query, values);
        const [result] = await connection.query(query, values);
        if (result.affectedRows === 0) {
            throw new Error("error udating....");
        }
    }
    catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.updateUserservice = updateUserservice;

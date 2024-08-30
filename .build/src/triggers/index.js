import AWS from 'aws-sdk';
import mysql from 'mysql2/promise';
export const handler = async (event) => {
    const cognitoISP = new AWS.CognitoIdentityServiceProvider();
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const fullName = event.request.userAttributes.name;
    console.log("User attributes received from Cognito:", { userId, email, fullName });
    let userGroup = null;
    try {
        const groupParams = {
            UserPoolId: event.userPoolId,
            Username: userId
        };
        const groupData = await cognitoISP.adminListGroupsForUser(groupParams).promise();
        if (groupData.Groups && groupData.Groups.length > 0) {
            userGroup = groupData.Groups[0].GroupName;
            console.log('User group:', userGroup);
        }
        else {
            console.log('No group assigned to the user.');
        }
    }
    catch (error) {
        console.error('Error fetching user group:', error);
    }
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const query = `
            INSERT INTO users (ID,FULLNAME, email, position)
            VALUES (?, ?, ?, ?)
        `;
        await connection.execute(query, [userId, fullName, email, userGroup]);
        console.log('User data inserted successfully.');
    }
    catch (error) {
        console.error('Error inserting user data into the database:', error);
        throw new Error('Failed to insert user data.');
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
    return event;
};
//# sourceMappingURL=index.js.map
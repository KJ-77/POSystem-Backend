import { MiddlewareObj } from '@middy/core';
import jwt from 'jsonwebtoken'; // or any JWT library you are using

const checkAuthToken: MiddlewareObj<any, any> = {
  before: async (handler) => {
    const token = handler.event.headers?.Authorization || "";
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    try {
      const decodedToken = jwt.decode(token);
      handler.event.decodedToken = decodedToken;
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }
  }
};

export default checkAuthToken;

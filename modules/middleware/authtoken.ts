import { MiddlewareObj } from '@middy/core';
import jwt from 'jsonwebtoken'; // or any JWT library you are using

const checkAuthToken: MiddlewareObj<any, any> = {
  before: async (handler) => {
    const token = handler.event.headers?.Authorization || "";
    if (!token) {
      throw new Error('Unauthorized');
    }

    try {
      const decodedToken = jwt.decode(token);
      handler.event.decodedToken = decodedToken; 
    } catch (error) {
      console.error("Failed to decode token:", error);
      throw new Error('Invalid token');
    }
  }
};

export default checkAuthToken;

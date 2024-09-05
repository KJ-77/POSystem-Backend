import {
  getAllOrders,
  getOrderByWorkerId,
  getOrderById,
  createOrder,
  AIProcessing,
  generateRandomOrderNumber,
  updateorderservice,
  sendemail,
} from "./order.services";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import validationMiddleware from "../middleware/validation";
import orderSchema from "./order.schema";
import { v4 as uuidv4 } from "uuid";
//import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendEmail } from "./order.services";
import axios from "axios";
import AWS from "aws-sdk";
import { getUserByIdservice } from "../users/service";
import jwt from "jsonwebtoken";
import checkAuthToken from '../middleware/authtoken';

const ses = new AWS.SESV2();

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

export const getAllOrdersHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const orders = await getAllOrders();
    return {
      statusCode: 200,
      body: JSON.stringify(orders),
      headers,
    };
  } catch (error) {
    console.error("Error handling get orders request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving orders" }),
      headers,
    };
  }
};

export const getOrderByWorkerIdHandler = middy(async (
  event: any
): Promise<APIGatewayProxyResult> =>  {
    try {
      const decodedToken = event.decodedToken; 
      const order = await getOrderByWorkerId(decodedToken.sub);
  
      if (!order) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "Order not found" }),
        };
      }
  
      return {
        statusCode: 200,
        body: JSON.stringify(order),
      };
  } catch (error) {
    console.error("Error handling get order by ID request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving order by ID" }),
    };
  }
});
getOrderByWorkerIdHandler.use(checkAuthToken);


export const getOrderByIdHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const orderId = event.pathParameters?.id || "";
    
    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Order ID is required" }),
        headers,
      };
    }

    const order = await getOrderById(orderId);
    if (order.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Order not found" }),
        headers,
      };
    }
    const orderData = order[0]; 
    return {
      statusCode: 200,
      body: JSON.stringify(orderData),
      headers,
    };
  } catch (error) {
    console.error("Error handling get order by ID request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving order by ID" }),
      headers,
    };
  }
};

export const createOrderHandler = middy(async (
  event: any
): Promise<APIGatewayProxyResult> => {
  try {
    const decodedToken = event.decodedToken; 
    const orderId = uuidv4();
    const userId = decodedToken.sub;
    /*
    console.log("//////////////////////////////////////////")
    console.log(userId)
    console.log("//////////////////////////////////////////")*/
    const orderData = JSON.parse(event.body || "{}");
    const newOrder = await createOrder(
      orderId,
      userId,
      orderData.order_name,
      orderData.order_desc,
      orderData.link,
      orderData.quantity,
      orderData.unit_price
    );

    /*await AIProcessing(
      userId,
      orderData.link,
      orderData.unit_price,
      orderData.order_desc
    );*/

    AIProcessing(
      orderId,
      orderData.link,
      orderData.unit_price,
      orderData.order_desc
    ).catch((error) => {
      console.error("Error in AIProcessing:", error.message);
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(newOrder),
    };
  } catch (error) {
    console.error("Error handling create order request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error creating order" }),
      headers,
    };
  }
});
createOrderHandler.use(checkAuthToken);


export const updateOrderHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const orderID = event.pathParameters?.id!;
    const orderData = JSON.parse(event.body || "{}");
    await updateorderservice(orderID, orderData.status, orderData.reason);
    await sendemail(orderID).catch((error) => {
      console.error("Error in sending email:", error.message);
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(orderID),
    };
  } catch (error) {
    console.error("Error handling create order request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error updating order" }),
      headers,
    };
  }
};

/*
export const sendemailcontroller = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const orderId = event.queryStringParameters?.orderId;

  if (!orderId) {
      return {
          statusCode: 400,
          body: JSON.stringify({ message: 'orderId is required' }),
      };
  }

  try {
    await sendemail(orderId);
      return {
          statusCode: 200,
          body: JSON.stringify('Email sent successfully!'),
      };
  } catch (error) {
      console.error("Error sending email:", error);
      return {
          statusCode: 500,
          body: JSON.stringify('Failed to send email.'),
      };
  }
};*/

export const handler = middy()
  .use(validationMiddleware(orderSchema))
  .handler(createOrderHandler);

// export const createOrderHandlerWithMiddleware = middy(createOrderHandler).use(validateOrder());
// export const getOrderByIdHandlerWithMiddleware= middy(getOrderById).use(ensureIdMiddleware());

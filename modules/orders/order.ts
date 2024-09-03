import {
  getAllOrders,
  getOrderById,
  createOrder,
  AIProcessing,
} from "./order.services";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import validationMiddleware from "../middleware/validation";
import orderSchema from "./order.schema";
import { v4 as uuidv4 } from "uuid";

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

export const getOrderByIdHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const orderId = event.pathParameters?.id || "";
    const order = await getOrderById(orderId);
    if (!order) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Order not found" }),
        headers,
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(order),
      headers,
    };
  } catch (error) {
    console.error("Error handling get order by ID request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving order by ID" }),
    };
  }
};

export const createOrderHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const orderId = uuidv4();
    const userId = event.pathParameters?.id!;
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
};

export const handler = middy()
  .use(validationMiddleware(orderSchema))
  .handler(createOrderHandler);

// export const createOrderHandlerWithMiddleware = middy(createOrderHandler).use(validateOrder());
// export const getOrderByIdHandlerWithMiddleware= middy(getOrderById).use(ensureIdMiddleware());

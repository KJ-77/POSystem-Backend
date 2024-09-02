import { getAllOrders, getOrderById, createOrder} from './order.services';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from '@middy/core';
import {validateOrder,ensureIdMiddleware} from './middleware';

const headers ={
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  'Content-Type': 'application/json'
}

export const getAllOrdersHandler  = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const orders = await getAllOrders();
    return {
      statusCode: 200,
      body: JSON.stringify(orders),
      headers
    };
  } catch (error) {
    console.error("Error handling get orders request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving orders" }),
      headers
    };
  }
};

export const getOrderByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const orderId = event.pathParameters?.id || '';
    const order = await getOrderById(orderId);
    if (!order) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Order not found" }),
        headers
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(order),
      headers
    };
  } catch (error) {
    console.error("Error handling get order by ID request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error retrieving order by ID" }),
    };
  }
};

export const createOrderHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const orderData = JSON.parse(event.body || '{}'); //extract the details from the incoming request body to pass to the createOrder function.
    const newOrder = await createOrder( //need this to provide feedback to the client about the newly created order.
      orderData.order_name, 
      orderData.order_desc,
      orderData.link,
      orderData.price_diff,
      orderData.order_status,
      orderData.worker_id,
      orderData.order_date,
      orderData.quantity,
      orderData.unit_price
    );
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
      headers
    };
  }
};
// export const createOrderHandlerWithMiddleware = middy(createOrderHandler).use(validateOrder());
// export const getOrderByIdHandlerWithMiddleware= middy(getOrderById).use(ensureIdMiddleware());
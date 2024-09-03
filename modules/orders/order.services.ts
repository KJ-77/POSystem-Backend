import { createConnection } from "../../config/db";
import { FieldPacket } from "mysql2";
import { Order, User } from "./types/order.interface";
import axios from 'axios';
export const getAllOrders = async () => {
  try {
    const connection = await createConnection();
    const [orders]: [Order[], FieldPacket[]] = await connection.query(`
      SELECT * FROM POSystemdb.orders
    `);
    const orderPromises = orders.map(async (order: Order) => {
      const [userResult]: [User[], FieldPacket[]] = await connection.query(
        `
        SELECT FULLNAME FROM POSystemdb.users WHERE id = ?
      `,
        [order.worker_id]
      );
      return {
        ...order,
        user_fullname: userResult[0]?.FULLNAME || "Unknown User",
      };
    });
    const ordersWithUserNames = await Promise.all(orderPromises);
    return ordersWithUserNames;
  } catch (error) {
    console.error("Error retrieving orders:", error);
    throw new Error("Error retrieving orders");
  }
};

export const getOrderById = async (workerId: string) => {
  const connection = await createConnection();
  const [orders]: any = await connection.execute(
    "SELECT * FROM orders WHERE worker_id = ?",
    [workerId]
  );

  return orders.length > 0 ? orders : [];
};


export const createOrder = async (
  orderId: string,
  worker_id: string,
  order_name: string,
  order_desc: string,
  link: string,
  quantity: number,
  unit_price: string
) => {
  const connection = await createConnection();
  try {
       const connection = await createConnection();
    console.log("Received order creation request with the details ");
    const unitPriceNumber = parseFloat(unit_price);
    if (isNaN(unitPriceNumber)) {
      throw new Error("Invalid unit_price format");
    }
    console.log(`Converted unit_price to number: ${unitPriceNumber}`);
 
    const []: [any, FieldPacket[]] = await connection.query(
      `
      INSERT INTO POSystemdb.orders (ID,worker_id,
        order_name, order_desc, link, quantity, unit_price,order_status
      ) VALUES (?,?, ?, ?, ?, ?, ? ,"inprogress")
    `,
      [orderId,worker_id, order_name, order_desc, link, quantity, unit_price]
    );
    
    return {
      message: "order added sucessfully",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating order:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
    throw new Error("Error creating order");
  }
  finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const AIProcessing = async (
  id: string,
  url: string,
  price: number,
  description: string
) => {
  try {
    const apiUrl =
      "http://last-1199026659.us-west-2.elb.amazonaws.com/product/cv";

    const response = await axios.post(apiUrl, {
      url,
      description,
      price,
    }).catch((error) => {
      console.error("Error in Axios request:", error.message);
      throw new Error("Failed to get a response from AI API");
    });

    if (!response.data.result) {
      throw new Error("no result from AI API");
    }

    const connection = await createConnection().catch((error) => {
      console.error("Error creating database connection:", error.message);
      throw new Error("Failed to connect to the database");
    });
//console.log("balash tabe3 3al dab")
    try {
      const query = `
        UPDATE orders
        SET score = ?, analysis = ?,order_status = "Pending"
        WHERE ID = ?`;

      await connection.execute(query, [
        response.data.result.score,
        response.data.result.analysis,
        id,
      ]);
    } catch (error :any) {
      console.error("Error executing query:", error.message);
      throw new Error("Failed to update the order");
    } finally {
      if (connection) {
        await connection.end();
      }
    }

  } catch (error : any) {
    console.error("Error in AIProcessing:", error.message);
    throw new Error(error.message);
  }
};



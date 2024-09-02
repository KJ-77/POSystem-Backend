import { createConnection } from "../../config/db";
import { FieldPacket } from "mysql2";
import { Order, User } from "./types/order.interface";

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
  order_name: string,
  order_desc: string,
  link: string,
  price_diff: boolean,
  order_status: string,
  worker_id: number,
  order_date: string,
  quantity: number,
  unit_price: string
) => {
  try {
    console.log("Received order creation request with the details ");
    const unitPriceNumber = parseFloat(unit_price);
    if (isNaN(unitPriceNumber)) {
      throw new Error("Invalid unit_price format");
    }
    console.log(`Converted unit_price to number: ${unitPriceNumber}`);
    const connection = await createConnection();
    const []: [any, FieldPacket[]] = await connection.query(
      `
      INSERT INTO POSystemdb.orders (
        order_name, order_desc, link, price_diff, order_status,
        worker_id, order_date, quantity, unit_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        order_name,
        order_desc,
        link,
        price_diff,
        order_status,
        worker_id,
        order_date,
        quantity,
        unit_price,
      ]
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
};
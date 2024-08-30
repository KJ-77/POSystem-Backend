import { createConnection } from '../utils/db';
export const getAllOrders = async () => {
    try {
        const connection = await createConnection();
        const [orders] = await connection.query(`
      SELECT * FROM POSystemdb.orders
    `);
        const orderPromises = orders.map(async (order) => {
            const [userResult] = await connection.query(`
        SELECT FULLNAME FROM POSystemdb.users WHERE id = ?
      `, [order.worker_id]);
            return {
                ...order,
                user_fullname: userResult[0]?.FULLNAME || 'Unknown User',
            };
        });
        const ordersWithUserNames = await Promise.all(orderPromises);
        return ordersWithUserNames;
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        throw new Error("Error retrieving orders");
    }
};
export const getOrderById = async (orderId) => {
    try {
        const connection = await createConnection();
        const [orderResults] = await connection.query(`
      SELECT * FROM POSystemdb.orders WHERE ID = ?
    `, [orderId]);
        if (orderResults.length === 0) {
            throw new Error('Order not found');
        }
        const order = orderResults[0];
        const [userResult] = await connection.query(`
      SELECT FULLNAME FROM POSystemdb.users WHERE id = ?
    `, [order.worker_id]);
        return {
            ...order,
            user_fullname: userResult[0]?.FULLNAME || 'Unknown User',
        };
    }
    catch (error) {
        console.error("Error retrieving order by ID:", error);
        throw new Error("Error retrieving order by ID");
    }
};
export const createOrder = async (order_name, order_desc, link, price_diff, order_status, worker_id, order_date, quantity, unit_price) => {
    try {
        console.log("Received order creation request with the details ");
        const unitPriceNumber = parseFloat(unit_price);
        if (isNaN(unitPriceNumber)) {
            throw new Error("Invalid unit_price format");
        }
        console.log(`Converted unit_price to number: ${unitPriceNumber}`);
        const connection = await createConnection();
        const [] = await connection.query(`
      INSERT INTO POSystemdb.orders (
        order_name, order_desc, link, price_diff, order_status,
        worker_id, order_date, quantity, unit_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            order_name,
            order_desc,
            link,
            price_diff,
            order_status,
            worker_id,
            order_date,
            quantity,
            unit_price
        ]);
        return {
            message: "order added sucessfully"
        };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error creating order:", error.message);
        }
        else {
            console.error("Unknown error occurred");
        }
        throw new Error("Error creating order");
    }
};
//# sourceMappingURL=order.services.js.map
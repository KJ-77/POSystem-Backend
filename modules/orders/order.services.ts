import { createConnection } from "../../config/db";
import { FieldPacket } from "mysql2";
import { Order, User } from "./types/order.interface";
import axios from "axios";
import { SESV2 } from "aws-sdk";
import { getUserByIdservice } from "../users/service";

const ses = new SESV2();
const headers = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};
interface SendEmailParams {
  FromEmailAddress: string;
  Destination: {
    ToAddresses: string[];
  };
  Content: {
    Template: {
      TemplateName: string;
      TemplateData: string;
    };
  };
  ReplyToAddresses: string[];
}

export const getAllOrders = async () => {
  let connection : any;
  try {
    connection = await createConnection();
    const [orders]: [Order[], FieldPacket[]] = await connection.query(`
      SELECT * 
      FROM POSystemdb.orders 
      WHERE order_status != 'inprogress';
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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const getOrderByWorkerId = async (workerId: string) => {
  const connection = await createConnection();
  const [orders]: any = await connection.execute(
    "SELECT * FROM orders WHERE worker_id = ?",
    [workerId]
  );

  return orders.length > 0 ? orders : [];
};
export const getOrderById = async (Id: string) => {
  const connection = await createConnection();
  const [orders]: any = await connection.execute(
    "SELECT * FROM orders WHERE ID = ?",
    [Id]
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
    // const connection = await createConnection();
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
      [orderId, worker_id, order_name, order_desc, link, quantity, unit_price]
    );

    return {
      message: "order added sucessfully",
      headers
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating order:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
    throw new Error("Error creating order");
  } finally {
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
      "http://scraper-elb-1471634376.us-east-1.elb.amazonaws.com/product/cv";

    const response = await axios
      .post(apiUrl, {
        url,
        description,
        price,
      })
      .catch((error) => {
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
    } catch (error: any) {
      console.error("Error executing query:", error.message);
      throw new Error("Failed to update the order");
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } catch (error: any) {
    console.error("Error in AIProcessing:", error.message);
    throw new Error(error.message);
  }
};

/*

order_status

reason
*/

export const updateorderservice = async (
  orderID: string,
  status: string,
  reason: string
) => {
  console.log(status);
  const connection = await createConnection();
  try {
    if (status === "Accepted") {
      await connection.query(
        `
    UPDATE POSystemdb.orders
SET order_status = '${status}'
WHERE id = '${orderID}';
      `
      );
    } else if (status === "Rejected") {
      await connection.query(
        `
    UPDATE POSystemdb.orders
SET order_status = '${status}', reason = '${reason}'
WHERE id = '${orderID}';
      `
      );
    }

    return {
      message: "order updated sucessfully",
    };
  } catch (error: any) {
    throw new Error("Error updating order");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const generateRandomOrderNumber = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
  return `PO${randomNumber}`;
};

export const sendEmail = async (
  params: SendEmailParams
): Promise<SESV2.SendEmailResponse> => {
  try {
    const result = await ses.sendEmail(params).promise();
    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

export const sendemail = async (orderId: string) => {
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "orderId is required" }),
    };
  }

  try {
    // Fetch the order data from your API
    const responseA = await getOrderById(orderId);
    const orderData = responseA[0];
    console.log(orderData);
    //axios.get(`http://localhost:3000/getorderbyId/${orderId}`);
    const userData = await getUserByIdservice(orderData.worker_id);
    //const response2 = await axios.get(`http://localhost:3000/getUserid/${workerid}`);
    console.log(userData);

    if (orderData.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Order not found" }),
      };
    }

    // Prepare the data to inject into the email template
    const testData = {
      StreetAddress: "1234 Elm Street",
      City: "Springfield",
      State: "IL",
      ZIP: "62701",
      PhoneNumber: "555-123-4567",
      ContactEmail: "contact@zeroandone.com",
      Date: new Date().toISOString().split("T")[0], // Generate the current date in YYYY-MM-DD format
      OrderNumber: generateRandomOrderNumber(), // Generate a random order number
      ID: orderData.ID,
      order_desc: orderData.order_desc,
      quantity: orderData.quantity,
      unit_price: orderData.unit_price,
      Total: orderData.total_price,
      TotalPrice: orderData.total_price, //
      reason: orderData.reason,
      order_name: orderData.order_name,
    };
    //console.log(testData.OrderNumber)
    //console.log(testData.Date)
    //console.log(orderData.reason)
    // Determine the template based on order status

    const templateName =
      orderData.order_status === "Accepted"
        ? "AcceptanceOrderTemplateFinal2"
        : "RejectedOrderTemplateFinal";

    const params = {
      FromEmailAddress: "zaynab-wehbe@hotmail.com",
      Destination: {
        ToAddresses: [userData.email],
      },
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(testData),
        },
      },
      ReplyToAddresses: ["zaynab-wehbe@hotmail.com"],
    };

    await sendEmail(params);
    return {
      statusCode: 200,
      body: JSON.stringify("Email sent successfully!"),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify("Failed to send email."),
    };
  }
};

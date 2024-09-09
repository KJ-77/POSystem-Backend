import axios from "axios";
import { createConnection } from "../../config/db";

export const handler = async (event: any) => {
  const { id, url, price, description } = event;

  try {
    const apiUrl = "http://scraper-elb-1471634376.us-east-1.elb.amazonaws.com/product/cv";

    const response = await axios.post(apiUrl, {
      url,
      description,
      price,
    }).catch((error) => {
      console.error("Error in Axios request:", error.message);
      throw new Error("Failed to get a response from AI API");
    });

    if (!response.data.result) {
      throw new Error("No result from AI API");
    }

    // Establish a database connection
    const connection = await createConnection().catch((error) => {
      console.error("Error creating database connection:", error.message);
      throw new Error("Failed to connect to the database");
    });

    try {
      const query = `
        UPDATE orders
        SET score = ?, analysis = ?, order_status = "Pending"
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

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "AI Processing complete" }),
    };
  } catch (error: any) {
    console.error("Error in AIProcessing Lambda:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

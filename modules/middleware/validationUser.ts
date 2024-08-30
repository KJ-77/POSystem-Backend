import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as yup from "yup";
import { MiddlewareObj } from "@middy/core";

const validationMiddleware = (
  schema: yup.ObjectSchema<any>
): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    before: async (request) => {
      try {
        const body = JSON.parse(request.event.body || "{}");
        await schema.validate(body, { abortEarly: false });
      } catch (error: any) {
        request.response = {
          statusCode: 400,
          body: JSON.stringify({ error: error.errors }),
        };
      }
    },
  };
};

export default validationMiddleware;



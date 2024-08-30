import { orderSchema } from './order.schema';
export const validateOrder = () => {
    return {
        before: async (handler) => {
            try {
                const orderData = JSON.parse(handler.event.body || '{}');
                await orderSchema.validate(orderData, { abortEarly: false });
            }
            catch (error) {
                handler.response = {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'Invalid order data',
                    }),
                    headers: { 'Content-Type': 'application/json' },
                };
                handler.done();
            }
        },
    };
};
export const ensureIdMiddleware = () => {
    return {
        before: async (handler) => {
            const { pathParameters } = handler.event;
            const orderId = pathParameters?.id;
            if (!orderId) {
                handler.response = {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'Order ID is required in path parameters',
                    }),
                    headers: { 'Content-Type': 'application/json' },
                };
                handler.done();
            }
        },
    };
};
//# sourceMappingURL=middleware.js.map
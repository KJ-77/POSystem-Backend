const validationMiddleware = (schema) => {
    return {
        before: async (request) => {
            try {
                const body = JSON.parse(request.event.body || "{}");
                await schema.validate(body, { abortEarly: false });
            }
            catch (error) {
                request.response = {
                    statusCode: 400,
                    body: JSON.stringify({ error: error.errors }),
                };
            }
        },
    };
};
export default validationMiddleware;
//# sourceMappingURL=validationUser.js.map
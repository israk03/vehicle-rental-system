import app from "./app";
import config from "./config";

const port = config.port;

// For Vercel serverless - export the app
export default app;

// For local development only
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}.`);
    });
}

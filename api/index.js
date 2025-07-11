import serverless from "serverless-http";
import app from "../backend/app.js"; // you’ll create this next
export default serverless(app);

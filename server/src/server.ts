import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/item.router";
import { notFoundRoute } from "./middleware/notFoundRoute";

const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use(express.json());

app.use("/api", router);
app.use(notFoundRoute);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

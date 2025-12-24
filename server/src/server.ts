import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes/item.router";
import { notFoundRoute } from "./middleware/notFoundRoute";

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for development
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
    app.use(
        cors({
            origin: "http://localhost:5173",
        })
    );
}

app.use(express.json());

// Serve static files from the client build directory in production
if (!isDev) {
    const clientPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientPath));
}

// API routes
app.use("/api", router);

// Serve index.html for all non-API routes (SPA routing)
if (!isDev) {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
} else {
    app.use(notFoundRoute);
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

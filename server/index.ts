import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initWebSocket, getConnectionStats } from "./websocket.js";
import { startScheduler, getSchedulerStatus } from "./scheduler.js";
import { cacheStats } from "./cache.js";
import { getQueueStats } from "./rateLimiter.js";
import { getBreakerStatus } from "./circuitBreaker.js";

// Route imports
import satellitesRouter from "./routes/satellites.js";
import openskyRouter from "./routes/opensky.js";
import adsbRouter from "./routes/adsb.js";
import earthquakesRouter from "./routes/earthquakes.js";
import firesRouter from "./routes/fires.js";
import gdeltRouter from "./routes/gdelt.js";
import conflictsRouter from "./routes/conflicts.js";
import cctvRouter from "./routes/cctv.js";
import maritimeRouter from "./routes/maritime.js";
import newsRouter from "./routes/news.js";
import trafficRouter from "./routes/traffic.js";
import weatherRouter from "./routes/weather.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/satellites", satellitesRouter);
app.use("/api/flights", openskyRouter);
app.use("/api/military", adsbRouter);
app.use("/api/earthquakes", earthquakesRouter);
app.use("/api/fires", firesRouter);
app.use("/api/gdelt", gdeltRouter);
app.use("/api/conflicts", conflictsRouter);
app.use("/api/cctv", cctvRouter);
app.use("/api/maritime", maritimeRouter);
app.use("/api/events", maritimeRouter); // EONET events via maritime router
app.use("/api/news", newsRouter);
app.use("/api/roads", trafficRouter);
app.use("/api/weather", weatherRouter);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({
        status: "operational",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        cache: cacheStats(),
        queues: getQueueStats(),
        breakers: getBreakerStatus(),
        websocket: getConnectionStats(),
        scheduler: getSchedulerStatus(),
    });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Server Error]", err.message);
    res.status(500).json({ error: "Internal server error", code: 500 });
});

// Start server
const server = createServer(app);
initWebSocket(server);
startScheduler();

server.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   PALANTIR Backend Server v1.0.0         ║`);
    console.log(`  ║   Port: ${PORT}                              ║`);
    console.log(`  ║   Status: OPERATIONAL                    ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
});

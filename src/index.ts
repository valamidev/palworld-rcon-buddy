import * as express from "express";
import * as bodyParser from "body-parser";
import { sendCommand, serverInfo } from "./palworld/serverApi";

const app = express();
app.use(bodyParser.json());

const serverOptions = {
  ipAddress: process.env.PALWORLD_SERVER_IP_ADDRESS || "127.0.0.1",
  port: process.env.PALWORLD_RCON_PORT
    ? Number(process.env.PALWORLD_RCON_PORT)
    : 25575,
  password: process.env.PALWORLD_RCON_PASSWORD || "",
};

let infoCache = {
  data: null,
  timestamp: Date.now(),
};

const CACHE_DURATION = process.env.INFO_CACHE_DURATION_MS
  ? Number(process.env.INFO_CACHE_DURATION_MS)
  : 5000; // 5 second by default

app.get("/info", async (req, res) => {
  try {
    if (infoCache.data && Date.now() - infoCache.timestamp < CACHE_DURATION) {
      return res.json(infoCache.data);
    }

    const info = await serverInfo(serverOptions);

    infoCache = {
      data: info,
      timestamp: Date.now(),
    };

    res.json(info);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/command", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.split(" ")[1];

    if (process.env.BEARER_TOKEN && !bearerToken) {
      return res.status(401).json({ message: "Missing Bearer token" });
    }

    if (process.env.BEARER_TOKEN && bearerToken !== process.env.BEARER_TOKEN) {
      return res.status(401).json({ message: "Invalid Bearer token" });
    }

    const command = req.body.command;

    if (!command) {
      return res
        .status(400)
        .json({ message: "Missing command in request body" });
    }

    const commandResponse = await sendCommand(serverOptions, command);

    res.json({ result: commandResponse });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Palworld Buddy Running on port ${PORT}`));

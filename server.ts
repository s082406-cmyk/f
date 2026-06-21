/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface AdSenseConfig {
  publisherId: string;
  headerSlotId: string;
  sidebarSlotId: string;
  inArticleSlotId: string;
  footerSlotId: string;
  autoAdsEnabled: boolean;
  adsTxtContent: string;
  isLiveMode: boolean;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const DEFAULT_CONFIG: AdSenseConfig = {
  publisherId: "pub-3940256099942544", // Default AdSense test merchant (Google's designated demo pub ID)
  headerSlotId: "1234567890",
  sidebarSlotId: "1234567891",
  inArticleSlotId: "1234567892",
  footerSlotId: "1234567893",
  autoAdsEnabled: true,
  adsTxtContent: `# Google AdSense ads.txt - REPLACE WITH YOUR CUSTOM SETTINGS BELOW
google.com, pub-3940256099942544, DIRECT, f08c47fec0942fa0
`,
  isLiveMode: false // Start in beautiful Visual Simulation Mode by default
};

const CONFIG_FILE_PATH = path.join(process.cwd(), "ads-config-store.json");
const MESSAGES_FILE_PATH = path.join(process.cwd(), "ads-messages-store.json");

// Helper to safely load configuration
function loadConfig(): AdSenseConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.warn("Could not read AdSense config file, using default values:", error);
  }
  return DEFAULT_CONFIG;
}

// Helper to safely save configuration
function saveConfig(config: AdSenseConfig): boolean {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Could not write AdSense config to file:", error);
    return false;
  }
}

// Helper to safely load messages
function loadMessages(): ContactMessage[] {
  try {
    if (fs.existsSync(MESSAGES_FILE_PATH)) {
      const data = fs.readFileSync(MESSAGES_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Could not read messages file, using default empty list:", error);
  }
  return [];
}

// Helper to safely save a message
function saveMessage(msg: ContactMessage): boolean {
  try {
    const list = loadMessages();
    list.push(msg);
    fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Could not write message to file:", error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware
  app.use(express.json());

  // 1. DYNAMIC ADS.TXT ROUTE (ROOT LEVEL) - Critical for AdSense Ownership Verification!
  app.get("/ads.txt", (req, res) => {
    const config = loadConfig();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(config.adsTxtContent);
  });

  // 2. API GET SYSTEM CONFIG
  app.get("/api/ads-config", (req, res) => {
    res.json(loadConfig());
  });

  // 3. API UPDATE SYSTEM CONFIG
  app.post("/api/ads-config", (req, res) => {
    const newConfig = req.body as AdSenseConfig;
    if (!newConfig || typeof newConfig !== "object") {
      res.status(400).json({ error: "Invalid configuration object." });
      return;
    }
    const success = saveConfig(newConfig);
    if (success) {
      res.json({ success: true, message: "AdSense settings updated successfully.", config: loadConfig() });
    } else {
      res.status(500).json({ error: "Failed to persist configuration to disk." });
    }
  });

  // 4. API SUBMIT CONTACT FORM
  app.post("/api/contact-submissions", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

    const newMessage: ContactMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      name,
      email,
      subject: subject || "No Subject",
      message,
      createdAt: new Date().toISOString()
    };

    const success = saveMessage(newMessage);
    if (success) {
      res.json({ success: true, message: "Thank you! Your feedback has been logged.", data: newMessage });
    } else {
      res.status(500).json({ error: "Failed to log feedback to disk." });
    }
  });

  // 5. API RETRIEVE CONTACT SUBMISSIONS (For Admin reference)
  app.get("/api/contact-submissions", (req, res) => {
    res.json(loadMessages());
  });

  // 6. CLEAR LOGS ROUTE
  app.post("/api/contact-submissions/clear", (req, res) => {
    try {
      fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to clear." });
    }
  });

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully at: http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite server:", err);
});

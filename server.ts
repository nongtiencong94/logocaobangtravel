import express from "express";
import path from "path";
import https from "https";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy endpoint to bypass CORS errors for the watermark logo image.
  app.get("/api/proxy-logo", (req, res) => {
    const logoUrl = "https://horizons-cdn.hostinger.com/0a91f8d8-634a-4253-a3fb-74370f9ae8c2/632ea3ea104e50d1b13375ec433b64c2.png";
    
    https.get(logoUrl, (response) => {
      // Forward the Content-Type header (usually image/png)
      const contentType = response.headers["content-type"] || "image/png";
      res.setHeader("Content-Type", contentType);
      // Set appropriate cache control to prevent repetitive network requests
      res.setHeader("Cache-Control", "public, max-age=86400");
      // Add CORS header so client-side canvas drawing doesn't trigger security exceptions
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      response.pipe(res);
    }).on("error", (err) => {
      console.error("Error proxying watermark logo:", err);
      res.status(500).send("Error fetching logo");
    });
  });

  // Serve static assets and manage Vite runtime inside the Express pipeline
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

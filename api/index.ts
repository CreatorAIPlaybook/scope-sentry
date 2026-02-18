export default async function handler(req: any, res: any) {
  try {
    const mod = await import("../server/index.js");
    const app = mod.default;
    if (!app) {
      throw new Error("No default export from server module");
    }
    return app(req, res);
  } catch (err) {
    console.error("Failed to load server module:", err);
    if (res && typeof res.status === "function") {
      return res.status(500).json({
        error: "Failed to load server module",
        path: "../server/index.js",
      });
    }
    throw err;
  }
}
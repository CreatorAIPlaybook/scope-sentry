import app from '../server/index.js'; // Adjust path if needed

export default function handler(req, res) {
  return app(req, res);
}
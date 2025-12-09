// test signed commit 3

import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    version: "2.1.0-dev",
    message: "Readr API is running",
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ Readr API listening on http://localhost:${PORT}`);
});

import { createServer } from "node:http";
import next from "next";
import { CronEngine } from "./lib/cron-engine";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      await handle(req, res);
    });

    server.listen(port, hostname, async () => {
      // Boot scheduler only after server startup.
      await CronEngine.getInstance().loadAll();
      console.log(`Server ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

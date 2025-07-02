const fifoPath = "/tmp/pchm.ts";
await Bun.spawn(["rm", "-f", fifoPath]).exited;
await Bun.spawn(["mkfifo", fifoPath]).exited;

const fifoFile = Bun.file(fifoPath);
const stream = fifoFile.stream();

Bun.serve({
  port: 20240,

  routes: {
    "/pchmts": () => {
      return new Response(stream, {
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },

    "/": async () => {
      return new Response(await Bun.file("ui/build/index.html").bytes(), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },

    "/*": async (req) => {
      const url = new URL(req.url);
      const file = Bun.file(`ui/build${url.pathname}`);

      return new Response(await file.bytes(), {
        headers: {
          "Content-Type": file.type,
        },
      });
    },
  },
});

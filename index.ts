const fifoPath = "/tmp/pchm.ts";

await Bun.spawn(["rm", "-f", fifoPath]).exited;
await Bun.spawn(["mkfifo", fifoPath]).exited;

Bun.serve({
  port: 20240,
  routes: {
    "/stream": () => {
      const file = Bun.file("/tmp/pchm.ts");

      return new Response(file.stream(), {
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  },
});

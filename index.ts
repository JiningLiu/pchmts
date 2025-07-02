const fifoPath = "/tmp/pchm.ts";

await Bun.spawn(["rm", "-f", fifoPath]).exited;
await Bun.spawn(["mkfifo", fifoPath]).exited;

Bun.serve({
  port: 20240,
  routes: {
    "/stream": () => {
      const catProc = Bun.spawn(["cat", fifoPath], {
        stdout: "pipe",
        stderr: "inherit",
      });

      return new Response(catProc.stdout, {
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  },
});

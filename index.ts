const pchmtsMkfifoProc = Bun.spawn(["mkfifo", "/tmp/pchm.ts"]);
await pchmtsMkfifoProc.exited;

Bun.serve({
  port: 80,
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

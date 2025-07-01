Bun.serve({
  port: 80,
  routes: {
    "/stream": () => {
      const file = Bun.file("pchm.ts");
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

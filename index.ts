Bun.serve({
  port: 20240,

  routes: {
    "/pchmts": () => {
      Bun.spawnSync(["pkill", "-f", '"cat /tmp/pchm.ts"']);
      const file = Bun.file("/tmp/pchm.ts");

      return new Response(file.stream(), {
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

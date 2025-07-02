let clientExists = false;

Bun.serve({
  port: 20240,

  routes: {
    "/pchmts": () => {
      if (clientExists) {
        return new Response("Client already exists", { status: 400 });
      }

      clientExists = true;

      const proc = Bun.spawn(
        [
          "bash",
          "-c",
          `libcamera-vid -t 0 --codec yuv420 --width 1920 --height 1080 --framerate 30 -o - | \
         ffmpeg -f rawvideo -pixel_format yuv420p -video_size 1920x1080 -framerate 30 -i - \
         -c:v libx264 -preset ultrafast -tune zerolatency -f mpegts -`,
        ],
        {
          stdout: "pipe",
          stderr: "pipe",
        }
      );

      proc.stderr?.pipeTo(
        new WritableStream({
          write(chunk) {
            Bun.stderr.write(chunk);
          },
        })
      );

      const response = new Response(proc.stdout, {
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });

      response.body
        ?.getReader()
        .closed.then(() => {
          clientExists = false;
          proc.kill();
        })
        .catch(() => {
          clientExists = false;
          proc.kill();
        });

      return response;
    },

    "/": async () => {
      return new Response(await Bun.file("ui/build/index.html").bytes(), {
        headers: { "Content-Type": "text/html" },
      });
    },

    "/*": async (req) => {
      const url = new URL(req.url);
      const file = Bun.file(`ui/build${url.pathname}`);

      return new Response(await file.bytes(), {
        headers: { "Content-Type": file.type },
      });
    },
  },
});

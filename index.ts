let procExists = false;

Bun.serve({
  port: 20240,

  routes: {
    "/pchmts": async () => {
      await killProc();

      const command = `
        libcamera-vid -t 0 --codec yuv420 --width 1920 --height 1080 --framerate 30 -o - | \
        ffmpeg -f rawvideo -pixel_format yuv420p -video_size 1920x1080 -framerate 30 -i - \
        -vf "vflip" \
        -c:v libx264 -preset ultrafast -tune zerolatency -f mpegts -
      `;

      const proc = Bun.spawn(["bash", "-c", command], {
        stdout: "pipe",
        stderr: "pipe",
      });

      procExists = true;

      if (proc.stderr) {
        proc.stderr.pipeTo(
          new WritableStream({
            write(chunk) {
              const text = new TextDecoder().decode(chunk);
              console.log(text);
            },
          })
        );
      }

      const stream = new ReadableStream({
        start(controller) {
          const reader = proc.stdout?.getReader();
          if (!reader) {
            controller.error(new Error("No stdout from process"));
            return;
          }

          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  console.log("Stream ended normally");
                  controller.close();
                  break;
                }
                controller.enqueue(value);
              }
            } catch (error) {
              console.error("Stream read error:", error);
              controller.error(error);
            } finally {
              reader.releaseLock();
              await killProc();
            }
          };

          pump();
        },
        async cancel() {
          console.log("Stream cancelled, cleaning up...");
          await killProc();
        },
      });

      const response = new Response(stream, {
        headers: {
          "Content-Type": "video/mp2t",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      });

      return response;
    },

    "/": async () => {
      return new Response(await Bun.file("ui/build/index.html").bytes(), {
        headers: { "Content-Type": "text/html" },
      });
    },

    "/*": async (req: Bun.BunRequest) => {
      const url = new URL(req.url);
      const file = Bun.file(`ui/build${url.pathname}`);

      console.log(file.type);

      return new Response(await file.bytes(), {
        headers: { "Content-Type": file.type },
      });
    },
  },
});

async function killProc() {
  if (procExists) {
    await Bun.spawn(["bash", "-c", "pkill", "-f", "libcamera-vid"]).exited;
  }
}

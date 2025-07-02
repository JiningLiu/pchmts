let clientExists = false;
let currentProc: any = null;

Bun.serve({
  port: 20240,

  routes: {
    "/pchmts": () => {
      if (clientExists) {
        return new Response("Client already exists", { status: 400 });
      }

      clientExists = true;

      // More robust command with error handling
      const command = `
        set -e
        libcamera-vid -t 0 --codec yuv420 --width 1920 --height 1080 --framerate 30 -o - | \
        ffmpeg -f rawvideo -pixel_format yuv420p -video_size 1920x1080 -framerate 30 -i - \
        -c:v libx264 -preset ultrafast -tune zerolatency -f mpegts - 2>/dev/null || \
        (echo "Pipeline failed, trying alternative..." >&2; exit 1)
      `;

      const proc = Bun.spawn(["bash", "-c", command], {
        stdout: "pipe",
        stderr: "pipe",
      });

      currentProc = proc;

      // Pipe stderr to console for debugging
      if (proc.stderr) {
        proc.stderr.pipeTo(
          new WritableStream({
            write(chunk) {
              const text = new TextDecoder().decode(chunk);
              console.log("Pipeline stderr:", text);
            },
          })
        );
      }

      // Create a more robust stream with error handling
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
              // Clean up when stream ends
              clientExists = false;
              if (currentProc) {
                currentProc.kill("SIGTERM");
                currentProc = null;
              }
            }
          };

          pump();
        },
        cancel() {
          console.log("Stream cancelled, cleaning up...");
          clientExists = false;
          if (currentProc) {
            currentProc.kill("SIGTERM");
            currentProc = null;
          }
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

    "/status": () => {
      return new Response(
        JSON.stringify({
          clientExists,
          processRunning: currentProc !== null,
          pid: currentProc?.pid || null,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    },

    "/stop": () => {
      if (currentProc) {
        currentProc.kill("SIGTERM");
        currentProc = null;
      }
      clientExists = false;
      return new Response("Stream stopped", { status: 200 });
    },

    "/test": () => {
      return new Response("Server is running", { status: 200 });
    },

    "/camera-test": async () => {
      try {
        const proc = Bun.spawn(["libcamera-vid", "--help"], {
          stdout: "pipe",
          stderr: "pipe",
        });

        const output = await new Response(proc.stdout).text();
        return new Response(
          JSON.stringify({
            success: true,
            libcameraAvailable: true,
            output: output.substring(0, 200) + "...",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            libcameraAvailable: false,
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
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

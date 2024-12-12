import { useEffect, useRef, memo } from "react";
import { useThemeMode } from "hooks/ThemeMode";

interface AnimatedBackgroundProps {
  onError?: () => void;
}

export const AnimatedBackground = memo(
  ({ onError }: AnimatedBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { mode } = useThemeMode();

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        onError?.();
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      try {
        const ctx = canvas.getContext("2d", {
          alpha: true,
          desynchronized: true,
        });

        if (!ctx) {
          console.error("无法获取 canvas context");
          onError?.();
          return;
        }

        const context = ctx;

        const getRandomHSLColor = () => {
          const hue = Math.random() * 360;
          const saturation = 90 + Math.random() * 10;
          const lightness =
            mode === "dark"
              ? 50 + Math.random() * 15 // 暗色模式：50-65%
              : 60 + Math.random() * 15; // 亮色模式：60-75%
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };

        const ballColor = getRandomHSLColor();
        let ballRadius = 100;
        let x = canvas.width / 2;
        let y = canvas.height - 200;
        let dx = 0.2;
        let dy = -0.2;

        function drawBall() {
          context.beginPath();
          context.arc(x, y, ballRadius, 0, Math.PI * 2);
          context.fillStyle = ballColor;
          context.fill();
          context.closePath();
        }

        const fps = 30;
        const interval = 1000 / fps;
        let then = Date.now();

        const draw = () => {
          const now = Date.now();
          const delta = now - then;

          if (delta > interval) {
            then = now - (delta % interval);

            context.clearRect(0, 0, canvas.width, canvas.height);
            drawBall();

            if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
              dx = -dx;
            }
            if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
              dy = -dy;
            }

            x += dx;
            y += dy;
          }

          animationFrameId = requestAnimationFrame(draw);
        };

        let animationFrameId: number;
        draw();

        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        };
      } catch (error) {
        console.error("Canvas 初始化失败:", error);
        onError?.();
        return;
      }
    }, [mode, onError]);

    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-70"
          style={{
            filter: "blur(100px)",
            position: "absolute",
            top: 0,
            left: 0,
            willChange: "transform",
          }}
        />
      </div>
    );
  },
);

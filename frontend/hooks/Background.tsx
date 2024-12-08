import { useEffect, useRef, memo } from 'react';
import { useThemeMode } from 'hooks/ThemeMode';

interface AnimatedBackgroundProps {
  onError?: () => void;
}

export const AnimatedBackground = memo(({ onError }: AnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useThemeMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      onError?.();
      return;
    }

    try {
      const ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true
      });
      
      if (!ctx) {
        console.error('无法获取 canvas context');
        onError?.();
        return;
      }

      // 添加非空断言
      const context = ctx!;

      // 添加必要的变量定义
      const getRandomHSLColor = () => {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = mode === 'dark' ? 40 + Math.random() * 20 : 60 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      };

      const ballColor = getRandomHSLColor();
      let ballRadius = 100;
      let x = canvas.width / 2;
      let y = canvas.height - 200;
      let dx = 0.2;
      let dy = -0.2;

      // 添加 drawBall 函数
      function drawBall() {
        context.beginPath();
        context.arc(x, y, ballRadius, 0, Math.PI * 2);
        context.fillStyle = ballColor;
        context.fill();
        context.closePath();
      }

      // 设置 canvas 尺寸
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // 性能优化：降低动画帧率
      const fps = 30;
      const interval = 1000 / fps;
      let then = Date.now();

      const draw = () => {
        const now = Date.now();
        const delta = now - then;

        if (delta > interval) {
          // 更新时间戳
          then = now - (delta % interval);

          // 绘制逻辑...
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

        // 使用 requestAnimationFrame 代替 setInterval
        animationFrameId = requestAnimationFrame(draw);
      };

      let animationFrameId: number;
      draw();

      // 清理函数
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    } catch (error) {
      console.error('Canvas 初始化失败:', error);
      onError?.();
      return;
    }
  }, [mode, onError]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-50"
        style={{ 
          filter: 'blur(150px)',
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform'
        }}
      />
    </div>
  );
}); 
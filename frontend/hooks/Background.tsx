import { useEffect, useRef } from 'react';
import { useThemeMode } from 'hooks/ThemeMode';

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useThemeMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    const canvasElement = canvas!;

    // 生成随机HSL颜色
    const getRandomHSLColor = () => {
      const hue = Math.random() * 360;
      const saturation = 70 + Math.random() * 30;
      const lightness = mode === 'dark' 
        ? 40 + Math.random() * 20
        : 60 + Math.random() * 20;
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const ballColor = getRandomHSLColor();
    let ballRadius = 100;
    let x = canvas.width / 2;
    let y = canvas.height - 200;
    let dx = 0.2;
    let dy = -0.2;

    // 设置canvas尺寸为窗口大小
    const resizeCanvas = () => {
      // 保存调整前的相对位置
      const relativeX = x / canvas.width;
      const relativeY = y / canvas.height;
      
      // 更新canvas尺寸
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // 根据新尺寸更新球的位置
      x = canvas.width * relativeX;
      y = canvas.height * relativeY;
      
      // 立即重绘
      drawBall();
    };

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = ballColor;
      ctx.fill();
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      drawBall();

      if (x + dx > canvasElement.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
      }
      if (y + dy > canvasElement.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
      }

      x += dx;
      y += dy;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const interval = setInterval(draw, 10);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: 'blur(150px)' }}
      />
    </div>
  );
}; 
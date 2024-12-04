import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface Particle {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalColor: THREE.Color;
  delay: number;
}

const createErrorParticles = (width: number, height: number) => {
  const particles: Particle[] = [];
  const positionArray: number[] = [];
  const colorArray: number[] = [];
  
  const errorColor = new THREE.Color(0.8, 0, 0); // 更深的红色

  // X 形状的两条线
  const lines = [
    // 左上到右下的线
    { start: [-1, 1], end: [1, -1] },
    // 右上到左下的线
    { start: [1, 1], end: [-1, -1] }
  ];

  // 每条线上的粒子数量
  const particlesPerLine = 50;

  lines.forEach(line => {
    for (let i = 0; i < particlesPerLine; i++) {
      const t = i / (particlesPerLine - 1);
      const x = line.start[0] + (line.end[0] - line.start[0]) * t;
      const y = line.start[1] + (line.end[1] - line.start[1]) * t;

      // 添加一些随机偏移
      const randomOffset = 0.1;
      const randomX = x + (Math.random() - 0.5) * randomOffset;
      const randomY = y + (Math.random() - 0.5) * randomOffset;

      // 缩放到适合容器的大小
      const scaledX = randomX * (width * 0.3);
      const scaledY = randomY * (height * 0.3);

      particles.push({
        x: scaledX,
        y: scaledY,
        z: 0,
        originalX: scaledX,
        originalY: scaledY,
        originalColor: errorColor,
        delay: 0
      });

      // 随机初始位置
      positionArray.push(
        (Math.random() - 0.5) * width * 2,
        (Math.random() - 0.5) * height * 2,
        (Math.random() - 0.5) * 100
      );

      // 随机初始颜色
      colorArray.push(errorColor.r, errorColor.g, errorColor.b);
    }
  });

  return { particles, positionArray, colorArray };
};

// 添加笑脸粒子生成函数
const createSmileParticles = (width: number, height: number) => {
  const particles: Particle[] = [];
  const positionArray: number[] = [];
  const colorArray: number[] = [];
  
  // 调整笑脸参数
  const radius = Math.min(width, height) * 0.35; // 脸部大小
  const particlesCount = 400; // 轮廓粒子数量
  
  // 修改颜色为更深的金色
  const particleColor = new THREE.Color(0.8, 0.6, 0); // 更深的金色

  // 创建圆形脸部轮廓
  for (let i = 0; i < particlesCount / 2; i++) {
    const angle = (i / (particlesCount / 2)) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    particles.push({
      x, y, z: 0,
      originalX: x,
      originalY: y,
      originalColor: particleColor,
      delay: 0
    });

    positionArray.push(
      (Math.random() - 0.5) * width * 2,
      (Math.random() - 0.5) * height * 2,
      (Math.random() - 0.5) * 100
    );
    colorArray.push(particleColor.r, particleColor.g, particleColor.b);
  }

  // 眼睛参数
  const eyeOffset = radius * 0.2; // 眼睛水平间距
  const eyeY = radius * 0.2; // 眼睛垂直位置
  const eyeSize = radius * 0.08; // 眼睛大小
  
  // 创建实心眼睛
  [-1, 1].forEach(side => {
    // 创建密集的点来填充眼睛
    for (let i = 0; i < 30; i++) {
      const r = Math.random() * eyeSize; // 随机半径
      const angle = Math.random() * Math.PI * 2; // 随机角度
      const x = side * eyeOffset + Math.cos(angle) * r;
      const y = eyeY + Math.sin(angle) * r;

      particles.push({
        x, y, z: 0,
        originalX: x,
        originalY: y,
        originalColor: particleColor,
        delay: 0
      });

      positionArray.push(
        (Math.random() - 0.5) * width * 2,
        (Math.random() - 0.5) * height * 2,
        (Math.random() - 0.5) * 100
      );
      colorArray.push(particleColor.r, particleColor.g, particleColor.b);
    }
  });

  // 嘴巴参数
  const smileWidth = radius * 0.5; // 嘴巴宽度
  const smileY = -radius * 0.3; // 将嘴巴位置向下移动更多
  const smilePoints = 40; // 嘴巴粒子数量

  // 创建微笑
  for (let i = 0; i < smilePoints; i++) {
    const t = i / (smilePoints - 1);
    const x = (t * 2 - 1) * smileWidth;
    
    // 简单的抛物线，向上弯曲的笑脸
    const y = smileY + (Math.pow(x / smileWidth, 2) * radius * 0.2);

    particles.push({
      x, y, z: 0,
      originalX: x,
      originalY: y,
      originalColor: particleColor,
      delay: 0
    });

    positionArray.push(
      (Math.random() - 0.5) * width * 2,
      (Math.random() - 0.5) * height * 2,
      (Math.random() - 0.5) * 100
    );
    colorArray.push(particleColor.r, particleColor.g, particleColor.b);
  }

  return { particles, positionArray, colorArray };
};

// 在文件开头添加新的 helper 函数
const easeOutCubic = (t: number) => {
  return 1 - Math.pow(1 - t, 3);
};

const customEase = (t: number) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const ParticleImage = ({ src, onLoad, onError }: { 
  src?: string;
  onLoad?: () => void;
  onError?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationFrameRef = useRef<number>();

  // 添加 resize 处理函数
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const camera = cameraRef.current;
    camera.left = width / -2.1;
    camera.right = width / 2.1;
    camera.top = height / 2.1;
    camera.bottom = height / -2.1;
    camera.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log('Current src:', src);

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.OrthographicCamera(
      width / -1.5,  // 扩大视野范围，从 -2 改为 -1.5
      width / 1.5,   // 扩大视野范围，从 2 改为 1.5
      height / 1.5,  // 扩大视野范围
      height / -1.5, // 扩大视野范围
      1,
      1000
    );
    camera.position.z = 100;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    });

    // 检查是否应该显示笑脸
    if (src === '') {
      console.log('Showing smile animation');
      const { particles, positionArray, colorArray } = createSmileParticles(width, height);
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const positionAttribute = geometry.attributes.position;
      
      particles.forEach((particle, i) => {
        const i3 = i * 3;
        gsap.to(positionAttribute.array, {
          duration: 1,
          delay: Math.random() * 0.3,
          [i3]: particle.originalX,
          [i3 + 1]: particle.originalY,
          [i3 + 2]: 0,
          ease: "back.out(1.7)",
          onUpdate: () => {
            positionAttribute.needsUpdate = true;
          }
        });
      });

      // 启动动画循环
      const animate = () => {
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

      return;
    }

    // 创建错误动画函数
    const showErrorAnimation = () => {
      if (!scene) return;
      
      const { particles, positionArray, colorArray } = createErrorParticles(width, height);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

      const points = new THREE.Points(geometry, material);
      scene.clear(); // 清除现有内容
      scene.add(points);

      const positionAttribute = geometry.attributes.position;
      
      particles.forEach((particle, i) => {
        const i3 = i * 3;
        gsap.to(positionAttribute.array, {
          duration: 0.6,
          delay: Math.random() * 0.2,
          [i3]: particle.originalX,
          [i3 + 1]: particle.originalY,
          [i3 + 2]: 0,
          ease: "back.out(1.7)",
          onUpdate: () => {
            positionAttribute.needsUpdate = true;
          }
        });
      });

      onError?.();
    };

    // 加载图片
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      showErrorAnimation();
    }, 5000); // 5秒超时

    img.onload = () => {
      clearTimeout(timeoutId);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = width;
        canvas.height = height;
        
        // 计算图片绘制尺寸和位置，确保不会超出容器
        const imgAspect = img.width / img.height;
        const containerAspect = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imgAspect > containerAspect) {
          // 图片较宽，以容器宽度为准，确保高度不超出
          drawWidth = width;
          drawHeight = width / imgAspect;
          offsetY = (height - drawHeight) / 2;
        } else {
          // 图片较高，以容器高度为准，确保宽度不超出
          drawHeight = height;
          drawWidth = height * imgAspect;
          offsetX = (width - drawWidth) / 2;
        }
        
        // 绘制图片
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        const imageData = ctx.getImageData(0, 0, width, height);
        
        const particles: Particle[] = [];
        const positionArray = [];
        const colorArray = [];
        const samplingGap = Math.ceil(Math.max(width, height) / 100); // 动态采样间隔，确保粒子数量适中

        // 采样图片像素
        for (let y = 0; y < height; y += samplingGap) {
          for (let x = 0; x < width; x += samplingGap) {
            const i = (y * width + x) * 4;
            const r = imageData.data[i] / 255;
            const g = imageData.data[i + 1] / 255;
            const b = imageData.data[i + 2] / 255;
            const a = imageData.data[i + 3] / 255;

            if (a > 0.3) {
              // 计算距离中心的距离，用于动画延迟
              const distanceToCenter = Math.sqrt(
                Math.pow(x - width/2, 2) + 
                Math.pow(y - height/2, 2)
              );
              const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
              const normalizedDistance = distanceToCenter / maxDistance;
              
              const px = x - width / 2;
              const py = height / 2 - y;
              
              particles.push({
                x: px,
                y: py,
                z: 0,
                originalX: px,
                originalY: py,
                originalColor: new THREE.Color(r, g, b),
                delay: normalizedDistance * 0.3 // 基于距离的延迟
              });

              // 随机初始位置（根据距离调整范围）
              const spread = 1 - normalizedDistance * 0.5; // 距离越远，初始扩散越小
              positionArray.push(
                (Math.random() - 0.5) * width * spread,
                (Math.random() - 0.5) * height * spread,
                (Math.random() - 0.5) * 50 * spread
              );

              colorArray.push(r, g, b);
            }
          }
        }

        scene.clear();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // 动画
        const positionAttribute = geometry.attributes.position;
        const colorAttribute = geometry.attributes.color;

        let completedAnimations = 0;
        const totalAnimations = particles.length * 2; // 位置和颜色动画

        const checkComplete = () => {
          completedAnimations++;
          if (completedAnimations === totalAnimations) {
            onLoad?.(); // 所有画完成后调用 onLoad
          }
        };

        particles.forEach((particle, i) => {
          const i3 = i * 3;
          
          // 位置动画
          gsap.to(positionAttribute.array, {
            duration: 1.2 + Math.random() * 0.3, // 减少随机性范围
            delay: particle.delay, // 使用基于距离的延迟
            [i3]: particle.originalX,
            [i3 + 1]: particle.originalY,
            [i3 + 2]: 0,
            ease: customEase,
            onUpdate: () => {
              positionAttribute.needsUpdate = true;
            },
            onComplete: checkComplete
          });

          // 颜色动画
          gsap.to(colorAttribute.array, {
            duration: 1,
            delay: particle.delay + 0.2, // 稍微延迟颜色变化
            [i3]: particle.originalColor.r,
            [i3 + 1]: particle.originalColor.g,
            [i3 + 2]: particle.originalColor.b,
            ease: "power2.inOut",
            onUpdate: () => {
              colorAttribute.needsUpdate = true;
            },
            onComplete: checkComplete
          });
        });

        // 修改动画序列部分
        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" }
        });

        const imgElement = document.querySelector(`img[src="${src}"]`) as HTMLImageElement;
        if (imgElement) {
          // 设置初始状态
          gsap.set(imgElement, { opacity: 0 });
          
          timeline
            .to(imgElement, {
              opacity: 1,
              duration: 0.8,
              delay: 1.6
            })
            .to(material, {
              opacity: 0,
              duration: 0.8
            }, "-=0.6"); // 提前开始消失
        }
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      showErrorAnimation();
    };

    img.src = src || '';

    // 动画循环
    const animate = () => {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 添加 resize 监听
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // 添加窗口 resize 监听
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }
      // 清除所有 GSAP 动画
      gsap.killTweensOf(geometry.attributes.position?.array);
      
      // 移除 resize 监听
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [src, onError, handleResize]);

  return <div ref={containerRef} className="w-full h-full" />;
}; 

// 图片加载组件
export const ImageLoader = ({ src, alt, className }: { 
  src?: string; 
  alt: string; 
  className: string; 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-[100px] md:w-[140px] h-[100px] md:h-[140px] shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(10,37,77)] via-[rgb(8,27,57)] to-[rgb(2,8,23)] rounded-lg overflow-hidden">
        <ParticleImage 
          src={src} 
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
      {!hasError && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <img 
            src={src} 
            alt={alt}
            className={`
              w-full h-full object-cover
              transition-opacity duration-1000
              ${className}
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
            style={{ 
              visibility: isLoading ? 'hidden' : 'visible',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
      )}
    </div>
  );
};
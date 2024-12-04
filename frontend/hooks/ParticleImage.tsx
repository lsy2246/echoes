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
      const size = Math.min(width, height);
      const scaleFactor = size * 0.3;
      const scaledX = randomX * scaleFactor;
      const scaledY = randomY * scaleFactor;

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
        (Math.random() - 0.5) * size * 2,
        (Math.random() - 0.5) * size * 2,
        (Math.random() - 0.5) * 50
      );

      // 随机初始颜色
      colorArray.push(errorColor.r, errorColor.g, errorColor.b);
    }
  });

  const size = Math.min(width, height);
  const scale = size / 200;
  const particleSize = Math.max(1.2, scale * 1.2);
  
  return { particles, positionArray, colorArray, particleSize };
};

// 修改 createSmileParticles 函数
const createSmileParticles = (width: number, height: number) => {
  const particles: Particle[] = [];
  const positionArray: number[] = [];
  const colorArray: number[] = [];
  
  // 根据容器大小动态调整参数
  const size = Math.min(width, height);
  const scale = size / 200; // 基准子
  
  // 调整笑脸参数
  const radius = size * 0.25; // 更合理的脸部大小比例
  const particlesCount = Math.floor(150 * scale); // 减少粒子数量
  const particleSize = Math.max(1.2, scale * 1.2); // 确保粒子大小适应屏幕
  
  const particleColor = new THREE.Color(0.8, 0.6, 0);

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
      (Math.random() - 0.5) * size * 4,
      (Math.random() - 0.5) * size * 4,
      (Math.random() - 0.5) * 150
    );
    colorArray.push(particleColor.r, particleColor.g, particleColor.b);
  }

  // 眼睛参数调整
  const eyeOffset = radius * 0.3; // 增加眼睛间距
  const eyeY = radius * 0.15; // 调整眼睛垂直位置
  const eyeSize = radius * 0.12; // 增加眼睛大小
  
  // 眼睛粒子数量也要根据比例调整
  const eyeParticles = Math.floor(20 * scale);
  
  [-1, 1].forEach(side => {
    for (let i = 0; i < eyeParticles; i++) {
      const r = Math.random() * eyeSize;
      const angle = Math.random() * Math.PI * 2;
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
        (Math.random() - 0.5) * size * 4,
        (Math.random() - 0.5) * size * 4,
        (Math.random() - 0.5) * 150
      );
      colorArray.push(particleColor.r, particleColor.g, particleColor.b);
    }
  });

  // 嘴巴参数调整
  const smileWidth = radius * 0.6; // 增加嘴巴宽度
  const smileY = -radius * 0.25; // 调整嘴巴位置
  const smilePoints = Math.floor(30 * scale); // 根据大小调整嘴巴粒子数量

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
      (Math.random() - 0.5) * size * 4,
      (Math.random() - 0.5) * size * 4,
      (Math.random() - 0.5) * 150
    );
    colorArray.push(particleColor.r, particleColor.g, particleColor.b);
  }

  return { particles, positionArray, colorArray, particleSize };
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

interface ParticleImageProps {
  src?: string;
  onLoad?: () => void;
  onError?: () => void;
  performanceMode?: boolean; // 新增性能模式开关
}

export const ParticleImage = ({ 
  src, 
  onLoad, 
  onError,
  performanceMode = false // 默认关闭
}: ParticleImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationFrameRef = useRef<number>();

  const width = containerRef.current?.offsetWidth || 0;
  const height = containerRef.current?.offsetHeight || 0;
  const size = Math.min(width, height);
  const scale = size / 200; // 基准因子

  // 在性能模式下使用更保守的参数
  const particleCount = performanceMode ? 
    Math.floor(100 * scale) : 
    Math.floor(200 * scale);
    
  // 添 resize 处理函数
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const camera = cameraRef.current;
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);

    // 重新生成粒子
    if (src === '') {
      // 清除现有的 GSAP 动画
      gsap.killTweensOf('*');
      
      // 重新生成笑脸
      const { particles, positionArray, colorArray, particleSize } = createSmileParticles(width, height);
      
      const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

      sceneRef.current.clear();
      const points = new THREE.Points(geometry, material);
      sceneRef.current.add(points);

      // 修改这部分，添加动画而不是直接设置位置
      const positionAttribute = geometry.attributes.position;
      
      particles.forEach((particle, i) => {
        const i3 = i * 3;
        const distanceToCenter = Math.sqrt(
          Math.pow(particle.originalX, 2) + 
          Math.pow(particle.originalY, 2)
        );
        const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
        const normalizedDistance = distanceToCenter / maxDistance;
        
        gsap.to(positionAttribute.array, {
          duration: 0.8,
          delay: normalizedDistance * 0.6,
          [i3]: particle.originalX,
          [i3 + 1]: particle.originalY,
          [i3 + 2]: 0,
          ease: "sine.inOut",
          onUpdate: () => {
            positionAttribute.needsUpdate = true;
          }
        });
      });
    }
  }, [src]);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log('Current src:', src);

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 500;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // 检查是否应该显示笑脸
    if (src === '') {
      console.log('Showing smile animation');
      const { particles, positionArray, colorArray, particleSize } = createSmileParticles(width, height);
      
      const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // 修改动画效果
      const positionAttribute = geometry.attributes.position;
      
      // 计算到中心的距离用于延迟
      particles.forEach((particle, i) => {
        const i3 = i * 3;
        const distanceToCenter = Math.sqrt(
          Math.pow(particle.originalX, 2) + 
          Math.pow(particle.originalY, 2)
        );
        const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
        const normalizedDistance = distanceToCenter / maxDistance;
        
        gsap.to(positionAttribute.array, {
          duration: 0.8,
          delay: normalizedDistance * 0.6,
          [i3]: particle.originalX,
          [i3 + 1]: particle.originalY,
          [i3 + 2]: 0,
          ease: "sine.inOut",
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

      // 添加 resize 监听
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          handleResize();
        }
      });
      resizeObserver.observe(containerRef.current);

      // 添加窗口 resize 监听
      window.addEventListener('resize', handleResize);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (renderer && containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
          renderer.dispose();
        }
        gsap.killTweensOf('*');
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
        window.removeEventListener('resize', handleResize);
      };
    }

    // 创建错误动画函数
    const showErrorAnimation = () => {
      if (!scene) return;
      
      const { particles, positionArray, colorArray, particleSize } = createErrorParticles(width, height);
      
      const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

      const points = new THREE.Points(geometry, material);
      scene.clear();
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
        
        // 绘制片
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        const imageData = ctx.getImageData(0, 0, width, height);
        
        const particles: Particle[] = [];
        const positionArray = [];
        const colorArray = [];
        const samplingGap = Math.ceil(Math.max(width, height) / 80); // 减少采样密度

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
        const size = Math.min(width, height);
        const scale = size / 200;
        const particleSize = Math.max(1.2, scale * 1.2);

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
          size: particleSize,
          vertexColors: true,
          transparent: true,
          opacity: 1,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false
        });


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

        return { particles, positionArray, colorArray, particleSize };
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
      gsap.killTweensOf('*');
      
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
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import throttle from 'lodash/throttle';

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
  
  const errorColor = new THREE.Color(0.8, 0, 0);
  const size = Math.min(width, height);
  const scaleFactor = size * 0.3;
  const particlesPerLine = 50;

  // X 形状的两条线
  const lines = [
    // 左上到右下的线
    { start: [-1, 1], end: [1, -1] },
    // 右上到左下的线
    { start: [1, 1], end: [-1, -1] }
  ];

  lines.forEach(line => {
    for (let i = 0; i < particlesPerLine; i++) {
      const t = i / (particlesPerLine - 1);
      const x = line.start[0] + (line.end[0] - line.start[0]) * t;
      const y = line.start[1] + (line.end[1] - line.start[1]) * t;

      // 添加一些随机偏移
      const randomOffset = 0.1;
      const randomX = x + (Math.random() - 0.5) * randomOffset;
      const randomY = y + (Math.random() - 0.5) * randomOffset;

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

      // 修改初始位置生成方式
      const angle = Math.random() * Math.PI * 2;
      const distance = size * 2;
      positionArray.push(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        0
      );

      // 初始颜色设置为最终颜色的一半亮度
      colorArray.push(errorColor.r * 0.5, errorColor.g * 0.5, errorColor.b * 0.5);
    }
  });

  const particleSize = Math.max(1.2, (size / 200) * 1.2);
  
  return { particles, positionArray, colorArray, particleSize };
};

// 修改 createSmileParticles 函数
const createSmileParticles = (width: number, height: number) => {
  const particles: Particle[] = [];
  const positionArray: number[] = [];
  const colorArray: number[] = [];
  
  const size = Math.min(width, height);
  const scale = size / 200;
  const radius = size * 0.35;
  const particleSize = Math.max(1.2, scale * 1.2);
  const particleColor = new THREE.Color(0.8, 0.6, 0);

  // 预先计算所有需要的粒子位置
  const allPoints: { x: number; y: number }[] = [];

  // 计算脸部轮廓的点
  const outlinePoints = Math.floor(60 * scale);
  for (let i = 0; i < outlinePoints; i++) {
    const angle = (i / outlinePoints) * Math.PI * 2;
    allPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }

  // 修改眼睛的生成方式
  const eyeOffset = radius * 0.3;
  const eyeY = radius * 0.15;
  const eyeSize = radius * 0.1; // 稍微减小眼睛尺寸
  const eyePoints = Math.floor(20 * scale);

  [-1, 1].forEach(side => {
    // 使用同心圆的方式生成眼睛
    const eyeCenterX = side * eyeOffset;
    const rings = 3; // 同心圆的数量
    
    for (let ring = 0; ring < rings; ring++) {
      const ringRadius = eyeSize * (1 - ring / rings); // 从外到内递减半径
      const pointsInRing = Math.floor(eyePoints / rings);
      
      for (let i = 0; i < pointsInRing; i++) {
        const angle = (i / pointsInRing) * Math.PI * 2;
        allPoints.push({
          x: eyeCenterX + Math.cos(angle) * ringRadius,
          y: eyeY + Math.sin(angle) * ringRadius
        });
      }
    }
    
    // 添加中心点
    allPoints.push({
      x: eyeCenterX,
      y: eyeY
    });
  });

  // 计算嘴巴的点
  const smileWidth = radius * 0.6;
  const smileY = -radius * 0.35;
  const smilePoints = Math.floor(25 * scale);

  for (let i = 0; i < smilePoints; i++) {
    const t = i / (smilePoints - 1);
    const x = (t * 2 - 1) * smileWidth;
    const y = smileY + Math.pow(x / smileWidth, 2) * radius * 0.2;
    allPoints.push({ x, y });
  }

  // 为所有点创建粒子
  allPoints.forEach(point => {
    particles.push({
      x: point.x,
      y: point.y,
      z: 0,
      originalX: point.x,
      originalY: point.y,
      originalColor: particleColor,
      delay: 0
    });

    // 生成初始位置（从外围圆形区域开始）
    const initAngle = Math.random() * Math.PI * 2;
    const distance = size * 2;
    positionArray.push(
      Math.cos(initAngle) * distance,
      Math.sin(initAngle) * distance,
      0
    );
    
    // 初始颜色设置为最终颜色的一半亮度
    colorArray.push(
      particleColor.r * 0.5,
      particleColor.g * 0.5,
      particleColor.b * 0.5
    );
  });

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

// 在文件开头添加新的 LoaderStatus 接口
interface LoaderStatus {
  isLoading: boolean;
  hasError: boolean;
  timeoutError: boolean;
}

// 修改 ParticleImage 组件的 props 接口
interface ParticleImageProps {
  src?: string;
  status?: LoaderStatus;
  onLoad?: () => void;
  onAnimationComplete?: () => void;
}

// 修改 BG_CONFIG，添加尺寸配置
const BG_CONFIG = {
  colors: {
    from: 'rgb(10,37,77)',
    via: 'rgb(8,27,57)', 
    to: 'rgb(2,8,23)'
  },
  className: 'bg-gradient-to-br from-[rgb(248,250,252)] via-[rgb(241,245,249)] to-[rgb(236,241,247)] dark:from-[rgb(10,37,77)] dark:via-[rgb(8,27,57)] dark:to-[rgb(2,8,23)]'
};

export const ParticleImage = ({ 
  src, 
  status,
  onLoad,
  onAnimationComplete 
}: ParticleImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationFrameRef = useRef<number>();

  // 将 resize 处理逻辑移到组件顶层
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    // 更新相机视图
    const camera = cameraRef.current;
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();

    // 更新渲染器大小
    rendererRef.current.setSize(width, height);

    // 只有当尺寸变化超阈值时才重生成粒子
    const currentSize = Math.min(width, height);
    const previousSize = sceneRef.current.userData.previousSize || currentSize;
    const sizeChange = Math.abs(currentSize - previousSize) / previousSize;

    if (sizeChange > 0.2 && src === '') {
      sceneRef.current.userData.previousSize = currentSize;
      updateParticles(width, height);
    }
  }, [src]);

  // 将粒子更新逻辑抽取为单独的函数
  const updateParticles = useCallback((width: number, height: number) => {
    if (!sceneRef.current) return;

    gsap.killTweensOf('*');
    
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
  }, []);

  // 主要的 useEffect
  useEffect(() => {
    if (!containerRef.current) return;

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

    // 检查是否应该显示笑
    if (src === '') {
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
      
      // 算到中心的距离用于延迟
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

      // 设置 resize 监听
      const throttledResize = throttle(handleResize, 200, {
        leading: true,
        trailing: true
      });

      const resizeObserver = new ResizeObserver(throttledResize);
      resizeObserver.observe(containerRef.current);
      window.addEventListener('resize', throttledResize);

      return () => {
        throttledResize.cancel();
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
        window.removeEventListener('resize', throttledResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }
        gsap.killTweensOf('*');
      };
    }

    // 建错误动函数
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
    };

    // 加载图
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
        // 计算目标尺寸和裁剪区域
        const targetAspect = width / height;
        const imgAspect = img.width / img.height;
        
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let sourceX = 0;
        let sourceY = 0;
        
        // 裁源图片，确保比例匹配目标容器
        if (imgAspect > targetAspect) {
          // 图片较宽，需要裁剪两边
          sourceWidth = img.height * targetAspect;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          // 图片较高，需要裁剪下
          sourceHeight = img.width / targetAspect;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // 设置画布尺寸为目标显示尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 直接绘制裁剪后的图片到目标尺寸
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,  // 源图片的裁剪区域
          0, 0, width, height  // 目标区域（填满画布）
        );
        
        const imageData = ctx.getImageData(0, 0, width, height);
        
        const particles: Particle[] = [];
        const positionArray = [];
        const colorArray = [];
        const samplingGap = Math.ceil(Math.max(width, height) / 80);

        // 采样已裁剪的图片像素
        for (let y = 0; y < height; y += samplingGap) {
          for (let x = 0; x < width; x += samplingGap) {
            const i = (y * width + x) * 4;
            const r = imageData.data[i] / 255;
            const g = imageData.data[i + 1] / 255;
            const b = imageData.data[i + 2] / 255;
            const a = imageData.data[i + 3] / 255;

            if (a > 0.3) {
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
                delay: normalizedDistance * 0.3
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

        // 画
        const positionAttribute = geometry.attributes.position;
        const colorAttribute = geometry.attributes.color;

        let completedAnimations = 0;
        const totalAnimations = particles.length * 2; // 位置和颜色动画

        const checkComplete = () => {
          completedAnimations++;
          if (completedAnimations === totalAnimations) {
            onLoad?.();
            onAnimationComplete?.();
          }
        };

        particles.forEach((particle, i) => {
          const i3 = i * 3;
          
          // 位置动画
          gsap.to(positionAttribute.array, {
            duration: 1.2 + Math.random() * 0.3,
            delay: particle.delay,
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
            delay: particle.delay + 0.2,
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

    // 画循环
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
      // 清所有 GSAP 动画
      gsap.killTweensOf('*');
      
      // 移除 resize 监听
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [src, handleResize, onLoad, onAnimationComplete]);

  return <div ref={containerRef} className="w-full h-full" />;
}; 

// 图片加载组件
export const ImageLoader = ({ 
  src, 
  alt,
  className 
}: { 
  src?: string; 
  alt: string; 
  className: string; 
}) => {
  const [status, setStatus] = useState<LoaderStatus>({
    isLoading: true,
    hasError: false,
    timeoutError: false
  });
  const [showImage, setShowImage] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadingRef = useRef(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理图片预加载
  const preloadImage = useCallback(() => {
    if (!src || loadingRef.current) return;
    
    loadingRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus({
      isLoading: true,
      hasError: false,
      timeoutError: false
    });
    setShowImage(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 在图片加载成功后，立即创建和缓存一个适应容器大小的图片
      if (containerRef.current) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const containerWidth = containerRef.current.offsetWidth;
          const containerHeight = containerRef.current.offsetHeight;
          
          canvas.width = containerWidth;
          canvas.height = containerHeight;
          
          // 保持比例绘制图片
          const targetAspect = containerWidth / containerHeight;
          const imgAspect = img.width / img.height;
          
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          let sourceX = 0;
          let sourceY = 0;
          
          if (imgAspect > targetAspect) {
            sourceWidth = img.height * targetAspect;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            sourceHeight = img.width / targetAspect;
            sourceY = (img.height - sourceHeight) / 2;
          }
          
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, containerWidth, containerHeight
          );
          
          // 创建新的图片对象，使用调整后的canvas数据
          const adjustedImage = new Image();
          adjustedImage.src = canvas.toDataURL();
          imageRef.current = adjustedImage;
        }
      } else {
        imageRef.current = img;
      }

      loadingRef.current = false;
      setStatus({
        isLoading: false,
        hasError: false,
        timeoutError: false
      });
    };

    img.onerror = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      loadingRef.current = false;
      setStatus({
        isLoading: false,
        hasError: true,
        timeoutError: false
      });
    };

    // 确保src存在再设置
    if (src) {
      img.src = src;
    }
  }, [src]);

  useEffect(() => {
    preloadImage();

    return () => {
      loadingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, preloadImage]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div className={`absolute inset-0 ${BG_CONFIG.className} rounded-lg overflow-hidden`}>
        <ParticleImage 
          src={src} 
          status={status}
          onLoad={() => {
            // 确保图片已经准备好
            if (imageRef.current) {
              setTimeout(() => {
                setShowImage(true);
              }, 800);
            }
          }}
          onAnimationComplete={() => {
            if (imageRef.current) {
              setShowImage(true);
            }
          }}
        />
      </div>
      {!status.hasError && !status.timeoutError && imageRef.current && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <img 
            src={imageRef.current.src}
            alt={alt}
            className={`
              w-full h-full object-cover
              transition-opacity duration-1000
              ${className}
              ${showImage ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ 
              visibility: showImage ? 'visible' : 'hidden',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
      )}
    </div>
  );
};
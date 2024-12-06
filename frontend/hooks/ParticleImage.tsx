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

const particleLoadQueue = new Set<string>();
let lastAnimationTime = 0;
const ANIMATION_THRESHOLD = 300; // 300ms的阈值
const MIN_DELAY = 100; // 最小延迟时间

const createErrorParticles = (width: number, height: number) => {
  const particles: Particle[] = [];
  const positionArray: number[] = [];
  const colorArray: number[] = [];
  
  const errorColor = new THREE.Color(0.8, 0, 0);
  const size = Math.min(width, height);
  const scaleFactor = size * 0.35;
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
  const radius = size * 0.4;
  const particleSize = Math.max(1.2, scale * 1.2);
  const particleColor = new THREE.Color(0.8, 0.6, 0);

  // 预先计算所有需要的粒子位置
  const allPoints: { x: number; y: number }[] = [];

  // 计算脸部轮廓的点
  const outlinePoints = Math.floor(60 * scale);
  const offsetX = radius * 0.05;  // 添加水平偏移
  const offsetY = radius * 0.05;  // 添加垂直偏移

  for (let i = 0; i < outlinePoints; i++) {
    const angle = (i / outlinePoints) * Math.PI * 2;
    allPoints.push({
      x: Math.cos(angle) * radius + offsetX,
      y: Math.sin(angle) * radius + offsetY
    });
  }

  // 改眼睛的生成方式
  const eyeOffset = radius * 0.3;
  const eyeY = radius * 0.15 + offsetY;
  const eyeSize = radius * 0.1; // 稍微减小眼睛尺寸
  const eyePoints = Math.floor(20 * scale);

  [-1, 1].forEach(side => {
    // 使用同心圆的方式生成眼睛
    const eyeCenterX = side * eyeOffset + offsetX;
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
  const smileY = -radius * 0.35 + offsetY;
  const smilePoints = Math.floor(25 * scale);

  for (let i = 0; i < smilePoints; i++) {
    const t = i / (smilePoints - 1);
    const x = (t * 2 - 1) * smileWidth + offsetX;
    const y = smileY + Math.pow(x / smileWidth, 2) * radius * 0.2 + offsetY;
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

// 修改采样率和粒子大小计算函数
const getOptimalImageParams = (width: number, height: number) => {
  const totalPixels = width * height;
  const pixelRatio = window.devicePixelRatio || 1;
  const isMobile = window.innerWidth <= 768;
  
  // 移动端使用更大的采样间隔来减少���数量
  let samplingGap = isMobile 
    ? Math.ceil(Math.max(width, height) / 60)  // 移动端降低采样密度
    : Math.ceil(Math.max(width, height) / 120); // 桌面端保持较高采密度
    
  // 限制最小采样间隔，避免粒子过多
  samplingGap = Math.max(samplingGap, isMobile ? 4 : 2);
  
  // 计算粒子大小
  const size = Math.min(width, height);
  const scale = size / 200;
  // 移动端适当增大粒子以保持视觉效果
  const particleSize = isMobile
    ? Math.max(2, scale * 2.2)
    : Math.max(1.5, scale * (1.8 / pixelRatio));
  
  return { 
    samplingGap, 
    particleSize,
    // 移动端使用较短的动画时间减少性能开销
    animationDuration: isMobile ? 0.6 : 0.8,
    // 移动端减少延迟时间，使动画更快完成
    delayMultiplier: isMobile ? 0.3 : 0.6
  };
};

// 添加资源清理函数
const cleanupResources = (scene: THREE.Scene) => {
  scene.traverse((object) => {
    if (object instanceof THREE.Points) {
      const geometry = object.geometry;
      const material = object.material as THREE.PointsMaterial;
      
      // 清空几何体缓冲区
      if (geometry.attributes.position) {
        geometry.attributes.position.array = new Float32Array(0);
      }
      if (geometry.attributes.color) {
        geometry.attributes.color.array = new Float32Array(0);
      }
      
      geometry.dispose();
      material.dispose();
      
      // 移除所有属性
      geometry.deleteAttribute('position');
      geometry.deleteAttribute('color');
    }
  });
  scene.clear();
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
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const isAnimatingRef = useRef(false); // 添加动画状态控制

  // 添加一个 ref 来追踪组件的挂载状态
  const isMountedRef = useRef(true);

  // 修改动画控制函数
  const startAnimation = useCallback((
    positionAttribute: THREE.BufferAttribute,
    particles: Particle[],
    width: number,
    height: number
  ) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const { animationDuration, delayMultiplier } = getOptimalImageParams(width, height);
    const animations: gsap.core.Tween[] = [];
    
    // 获取当前场景中的 Points 对象
    const points = sceneRef.current?.children[0] as THREE.Points;
    if (!points) return;
    
    const material = points.material as THREE.PointsMaterial;

    // 添加材质透明度动画
    const materialTween = gsap.to(material, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    animations.push(materialTween);

    particles.forEach((particle, i) => {
      const i3 = i * 3;
      const distanceToCenter = Math.sqrt(
        Math.pow(particle.originalX, 2) + 
        Math.pow(particle.originalY, 2)
      );
      const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
      const normalizedDistance = distanceToCenter / maxDistance;
      
      const tween = gsap.to(positionAttribute.array, {
        duration: animationDuration,
        delay: normalizedDistance * delayMultiplier,
        [i3]: particle.originalX,
        [i3 + 1]: particle.originalY,
        [i3 + 2]: 0,
        ease: "power2.inOut",
        onUpdate: () => {
          positionAttribute.needsUpdate = true;
        }
      });
      animations.push(tween);
    });

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    const maxDelay = Math.max(...animations.map(tween => tween.delay() || 0));
    
    // 在动画即将结束时开始淡出粒子
    const fadeOutDelay = (maxDelay + animationDuration) * 1000 - 200;
    
    setTimeout(() => {
      gsap.to(material, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }, fadeOutDelay);

    // 确保在粒子完全消失后才触发完成回调
    animationTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        isAnimatingRef.current = false;
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }, fadeOutDelay + 300);
  }, [onAnimationComplete]);

  // 修改清理函数
  const cleanup = useCallback(() => {
    if (!isMountedRef.current) return;

    // 清理动画状态
    isAnimatingRef.current = false;
    
    // 清理超时
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // 取消动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // 清理 GSAP 动画
    gsap.killTweensOf('*');

    // 清理场景资源
    if (sceneRef.current) {
      cleanupResources(sceneRef.current);
    }

    // 修改渲染器清理逻辑
    if (rendererRef.current) {
      const renderer = rendererRef.current;
      const domElement = renderer.domElement;
      
      // 使用 requestAnimationFrame 确保在一帧进�� DOM 操作
      requestAnimationFrame(() => {
        if (isMountedRef.current && containerRef.current?.contains(domElement)) {
          try {
            containerRef.current.removeChild(domElement);
          } catch (e) {
            console.warn('清理渲染器DOM元素失败:', e);
          }
        }
        
        renderer.dispose();
        renderer.forceContextLoss();
      });
      
      rendererRef.current = undefined;
    }
  }, []);

  // 修改 useEffect 的清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 修改 updateParticles 函数
  const updateParticles = useCallback((width: number, height: number) => {
    if (!sceneRef.current || isAnimatingRef.current || !isMountedRef.current) return;

    cleanup();
    
    if (!isMountedRef.current) return;

    const { particles, positionArray, colorArray, particleSize } = createSmileParticles(width, height);
    
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

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

    const points = new THREE.Points(geometry, material);
    sceneRef.current.add(points);

    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    startAnimation(positionAttribute, particles, width, height);
  }, [cleanup, startAnimation]);

  // 将 resize 处理逻辑移到组件顶层
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current || 
        !sceneRef.current || !isMountedRef.current) return;

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

    // 只在尺寸显著变化时重新生成粒子
    const currentSize = Math.min(width, height);
    const previousSize = sceneRef.current.userData.previousSize || currentSize;
    const sizeChange = Math.abs(currentSize - previousSize) / previousSize;

    if (sizeChange > 0.2 && src === '') {
      if (sceneRef.current) {
        cleanupResources(sceneRef.current);
      }
      sceneRef.current.userData.previousSize = currentSize;
      updateParticles(width, height);
    }
  }, [src, updateParticles]);

  // 主要的 useEffect
  useEffect(() => {
    isMountedRef.current = true;
    
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
      antialias: window.innerWidth > 768,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(
      window.devicePixelRatio,
      window.innerWidth <= 768 ? 2 : 3
    ));
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    
    // 确保容器仍然存在再添加渲染器
    if (containerRef.current && isMountedRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

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

    // 建错误函数
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
        // 增加一个小的边距以确保完全覆盖
        const padding = 2; // 添加2像素的内边距
        canvas.width = width + padding * 2;
        canvas.height = height + padding * 2;
        
        const targetAspect = width / height;
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

        // 绘制时考虑padding
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          padding, padding, width, height
        );

        // 采样时也要考虑padding
        const imageData = ctx.getImageData(padding, padding, width, height);
        
        const particles: Particle[] = [];
        const positionArray = [];
        const colorArray = [];
        const samplingGap = Math.ceil(Math.max(width, height) / 80);

        // 采样裁剪的图片像素
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
              const spread = 1 - normalizedDistance * 0.5; // 距离越远，始扩散越小
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
        const totalAnimations = particles.length * 2; // 置和颜色动画

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

          // 色动画
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
  }, [cleanup, src, handleResize, onLoad, onAnimationComplete]);

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
  const [animationComplete, setAnimationComplete] = useState(false);

  // 处理图片预加载
  const preloadImage = useCallback(() => {
    if (!src || loadingRef.current) return;
    
    loadingRef.current = true;

    // 清理之前的资源
    if (imageRef.current) {
      imageRef.current.src = '';
      imageRef.current = null;
    }

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

    // 确保src存在再设���
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

  // 添加一个新的状来控制粒子动画
  const [canShowParticles, setCanShowParticles] = useState(false);

  useEffect(() => {
    if (!src) return;

    // 重置状
    setShowImage(false);
    setAnimationComplete(false);
    setCanShowParticles(false);

    const now = Date.now();
    const timeSinceLastAnimation = now - lastAnimationTime;

    if (particleLoadQueue.size === 0) {
      particleLoadQueue.add(src);
      setCanShowParticles(true);
      lastAnimationTime = now;
      return;
    }

    const delay = Math.max(
      MIN_DELAY,
      Math.min(ANIMATION_THRESHOLD, timeSinceLastAnimation)
    );

    const timer = setTimeout(() => {
      particleLoadQueue.add(src);
      setCanShowParticles(true);
      lastAnimationTime = Date.now();
    }, delay);

    return () => {
      clearTimeout(timer);
      particleLoadQueue.delete(src);
    };
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className={`absolute inset-0 ${BG_CONFIG.className} rounded-lg overflow-hidden`}>
        {(!src || (!animationComplete && canShowParticles)) && (
          <ParticleImage 
            src={src} 
            status={status}
            onLoad={() => {
              if (imageRef.current) {
                // 保持为空
              }
            }}
            onAnimationComplete={() => {
              if (imageRef.current && src) {
                // 先显示图片，保持透明
                setShowImage(true);
                
                // 等待一帧确保图片已经渲染
                requestAnimationFrame(() => {
                  // 标记动画完成，触发粒子消失
                  setAnimationComplete(true);
                  particleLoadQueue.delete(src);
                  
                  // 给图一个短暂延迟再开始淡入
                  setTimeout(() => {
                    const img = document.querySelector(`img[src="${imageRef.current?.src}"]`) as HTMLImageElement;
                    if (img) {
                      img.style.opacity = '1';
                    }
                  }, 50);
                });
              }
            }}
          />
        )}
      </div>
      {!status.hasError && !status.timeoutError && imageRef.current && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <img 
            src={imageRef.current.src}
            alt={alt}
            className={`
              w-full h-full object-cover
              ${className}
            `}
            style={{ 
              opacity: 0,
              visibility: showImage ? 'visible' : 'hidden',
              objectFit: 'cover',
              objectPosition: 'center',
              willChange: 'opacity, transform',
              transition: 'opacity 0.5s ease-in-out',
              transform: 'scale(1.015)', // 增加缩放比例到 1.015
              transformOrigin: 'center bottom', // 从底部中心开始缩放
            }}
          />
        </div>
      )}
    </div>
  );
};
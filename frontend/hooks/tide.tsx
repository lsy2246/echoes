"use client";
import React, { useEffect, useRef } from "react";

const Tide: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensionsRef = useRef({ width: 1000, height: 800 });
  const pathCountRef = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      dimensionsRef.current = {
        width: rect.width,
        height: rect.height,
      };

      if (svgRef.current) {
        svgRef.current.setAttribute(
          "viewBox",
          `0 0 ${dimensionsRef.current.width} ${dimensionsRef.current.height}`,
        );
      }
    };

    const createLine = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      width: number,
      alpha: number = 0.3,
      animationDelay: number = 0,
    ) => {
      if (!svgRef.current || pathCountRef.current > 500) return;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const controlX = midX + (Math.random() - 0.5) * 2;
      const controlY = midY + (Math.random() - 0.5) * 2;

      const d = `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;

      path.setAttribute("d", d);
      path.setAttribute("stroke", "var(--accent-9)");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("fill", "none");

      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.opacity = "0";
      path.style.transition = `
        stroke-dashoffset 0.8s ease-out ${animationDelay}s,
        opacity 0.8s ease-out ${animationDelay}s
      `;

      svgRef.current.appendChild(path);
      pathCountRef.current += 1;

      setTimeout(() => {
        path.style.strokeDashoffset = "0";
        path.style.opacity = "0.6";
      }, 10);
    };

    const createRoot = (
      startX: number,
      startY: number,
      baseAngle: number,
      length: number,
      width: number,
      depth: number,
      animationDelay: number = 0,
    ) => {
      if (depth <= 0 || !svgRef.current || pathCountRef.current > 600) return;

      const endX = startX + Math.cos(baseAngle) * length;
      const endY = startY - Math.sin(baseAngle) * length;

      if (
        endX < 0 ||
        endX > dimensionsRef.current.width ||
        endY < 0 ||
        endY > dimensionsRef.current.height
      )
        return;

      createLine(startX, startY, endX, endY, width, 0.6, animationDelay);

      const growthDelay = 0.3;
      const newDelay = animationDelay + growthDelay;

      setTimeout(() => {
        if (depth > 0) {
          createRoot(
            endX,
            endY,
            baseAngle + (Math.random() * 0.08 - 0.04),
            length * 0.99,
            width * 0.99,
            depth - 1,
            newDelay,
          );
        }

        const branchProbability = depth > 20 ? 0.3 : 0.2;

        if (depth > 5 && depth < 35 && Math.random() < branchProbability) {
          const direction = Math.random() > 0.5 ? 1 : -1;
          const branchAngle =
            baseAngle +
            direction * (Math.PI / 6 + (Math.random() * Math.PI) / 12);

          setTimeout(() => {
            createRoot(
              endX,
              endY,
              branchAngle,
              length * 0.85,
              width * 0.85,
              Math.floor(depth * 0.8),
              newDelay + 0.2,
            );
          }, 150);
        }
      }, growthDelay * 1000);
    };

    const startGrowth = () => {
      if (!svgRef.current) return;
      svgRef.current.innerHTML = "";
      pathCountRef.current = 0;
      updateDimensions();

      const { width, height } = dimensionsRef.current;

      const edge = Math.floor(Math.random() * 4);
      let startX, startY, baseAngle;

      const margin = 50;
      const randomPos = Math.random();

      switch (edge) {
        case 0:
          startX = margin + (width - 2 * margin) * randomPos;
          startY = 0;
          baseAngle = Math.PI / 2;
          break;
        case 1:
          startX = width;
          startY = margin + (height - 2 * margin) * randomPos;
          baseAngle = Math.PI;
          break;
        case 2:
          startX = margin + (width - 2 * margin) * randomPos;
          startY = height;
          baseAngle = -Math.PI / 2;
          break;
        default:
          startX = 0;
          startY = margin + (height - 2 * margin) * randomPos;
          baseAngle = 0;
          break;
      }

      const angleVariation = Math.random() * 0.4 - 0.2;

      const minDepth = 25;
      const maxDepth = 45;
      const depth =
        minDepth + Math.floor(Math.random() * (maxDepth - minDepth));

      const initialLength = 15 + Math.random() * 5;
      const initialWidth = 0.8 + Math.random() * 0.4;

      createRoot(
        startX,
        startY,
        baseAngle + angleVariation,
        initialLength,
        initialWidth,
        depth,
        0,
      );
    };

    if (typeof window !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
        startGrowth();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      setTimeout(startGrowth, 100);

      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default Tide;

import React, { useState, useEffect } from "react";
import { Template } from "interface/template";

export default new Template({}, ({ args }) => {
  const [text, setText] = useState("");
  const fullText = "404 - 页面不见了 :(";
  const typingSpeed = 100;

  useEffect(() => {
    let currentIndex = 0;
    const typingEffect = setInterval(() => {
      if (currentIndex < fullText.length) {
        setText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingEffect);
      }
    }, typingSpeed);

    return () => clearInterval(typingEffect);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--background] transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[--foreground] mb-4">
          {text}
          <span className="animate-pulse">|</span>
        </h1>
        <p className="text-[--muted-foreground] text-xl">
          抱歉，您访问的页面已经离家出走了
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-6 py-3 bg-[--primary] hover:bg-[--primary-foreground] text-[--primary-foreground] hover:text-[--primary] rounded-lg transition-colors duration-300"
        >
          返回首页
        </button>
      </div>
    </div>
  );
});

import React, { useState, useEffect } from "react";

const ErrorPage = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-custom-bg-light dark:bg-custom-bg-dark transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-custom-title-light dark:text-custom-title-dark mb-4">
          {text}
          <span className="animate-pulse">|</span>
        </h1>
        <p className="text-custom-p-light dark:text-custom-p-dark text-xl">
          抱歉，您访问的页面已经离家出走了
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;

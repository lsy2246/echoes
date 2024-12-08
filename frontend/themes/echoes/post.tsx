import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Template } from "interface/template";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Container,
  Heading,
  Text,
  Flex,
  Box,
  Button,
  ScrollArea,
} from "@radix-ui/themes";
import { CalendarIcon, CodeIcon } from "@radix-ui/react-icons";
import type {  PostDisplay } from "interface/fields";
import type { MetaFunction } from "@remix-run/node";
import { getColorScheme } from "themes/echoes/utils/colorScheme";
import MarkdownIt from 'markdown-it';
import { ComponentPropsWithoutRef } from 'react';
import remarkGfm from 'remark-gfm';
import type { Components } from "react-markdown";
import { toast } from "hooks/Notification";

// 示例文章数据
const mockPost: PostDisplay = {
  id: 1,
  title: "Markdown 完全指南：从基础到高级排版",
  content: `
# Markdown 完全指南：从基础到高级排版

这篇指南将介绍 Markdown 的基础语法和高级排版技巧。

## 1. 基础语法

### 1.1 文本格式化

普通文本不需要任何特殊标记。

**这是粗体文本**
*这是斜体文本*
***这是粗斜体文本***
~~这是删除线文本~~

### 1.2 列表

#### 无序列表：
- 第一项
  - 子项 1
  - 子项 2
- 第二项
- 第三项

#### 有序列表：
1. 第一步
   1. 子步骤 1
   2. 子步骤 2
2. 第二步
3. 第三步

#### 任务列表：
- [x] 已完成任务
- [ ] 未完成任务
- [x] 又一个已完成任务

### 1.3 代码展示

行内代码：\`const greeting = "Hello World";\`

代码块：
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

### 1.4 表格

| 功能 | 基础版 | 高级版 |
|:-----|:------:|-------:|
| 文本编辑 | ✓ | ✓ |
| 实时预览 | ✗ | ✓ |
| 导出格式 | 2种 | 5种 |

## 2. 高级排版

### 2.1 图文混排布局

#### 左图右文

<div class="flex items-center gap-6 my-8">
  <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400" 
       alt="写作工具" 
       class="w-1/3 rounded-lg shadow-lg" />
  <div class="flex-1">
    <h4 class="text-xl font-bold mb-2">高效写作工具</h4>
    <p>使用合适的写作工具可以极大提升写作效率。推荐使用支持即时预览的编辑器，这样可以实时查看排版效果。</p>
  </div>
</div>

#### 右图左文

<div class="flex items-center gap-6 my-8">
  <div class="flex-1">
    <h4 class="text-xl font-bold mb-2">版面设计原则</h4>
    <p>好的版面设计应该让内容清晰易读，层次分明。合理使用留白和分隔符可以让文章更有结构感。</p>
  </div>
  <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=400" 
       alt="设计工具" 
       class="w-1/3 rounded-lg shadow-lg" />
</div>

### 2.2 可折叠内容

<details class="my-4">
<summary class="cursor-pointer p-4 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors">
  🎯 如何选择合适的写作工具？
</summary>

选择写作工具时需要考虑以下几点：

1. **跨平台支持** - 确保在不同设备上都能访问
2. **实时预览** - Markdown 实时渲染很重要
3. **版本控制** - 最好能支持文章的版本管理
4. **导出功能** - 支持导出为多种格式
</details>

### 2.3 并排卡片

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="p-6 bg-gray-100 rounded-lg">
    <h4 class="text-lg font-bold mb-2">🚀 快速上手</h4>
    <p>通过简单的标记语法，快速创建格式化的文档，无需复杂的排版工具。</p>
  </div>
  <div class="p-6 bg-gray-100 rounded-lg">
    <h4 class="text-lg font-bold mb-2">⚡ 高效输出</h4>
    <p>专注于内容创作，让工具自动处理排版，提高写作效率。</p>
  </div>
</div>

### 2.4 高亮提示框

<div class="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg my-8">
  <h4 class="text-lg font-bold text-blue-700 mb-2">💡 小贴士</h4>
  <p class="text-blue-600">在写作时，可以先列出文章大纲，再逐步充实内容。这样可以保证文章结构清晰，内容完整。</p>
</div>

<div class="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg my-8">
  <h4 class="text-lg font-bold text-yellow-700 mb-2">⚠️ 注意事项</h4>
  <p class="text-yellow-600">写作时要注意文章的受众，使用他们能理解的语言和例子。</p>
</div>

### 2.5 时间线

<div class="relative pl-8 my-8 border-l-2 border-gray-200">
  <div class="mb-8 relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">1. 确定主题</div>
    <p>根据目标受众和写作目的，确定文章主题。</p>
  </div>
  
  <div class="mb-8 relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">2. 收集资料</div>
    <p>广泛搜集相关资料，为写作做充分准备。</p>
  </div>
  
  <div class="relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">3. 开始写作</div>
    <p>按照大纲逐步展开写作。</p>
  </div>
</div>

### 2.6 引用样式

> 📌 **最佳实践**
> 
> 好的文章需要有清晰的结构和流畅的表达。以下是一些建议：
> 
> 1. 开门见山，直入主题
> 2. 层次分明，逻辑清晰
> 3. 语言简洁，表达准确
> 
> *— 写作指南*

## 3. 特殊语法

### 3.1 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$

### 3.2 脚注

这里有一个脚注[^1]。

[^1]: 这是脚注的内容。

### 3.3 表情符号

:smile: :heart: :thumbsup: :star: :rocket:

## 4. 总结

本文展示了 Markdown 从基础到高级的各种用法：

1. 基础语法：文本格式化、列表、代码、表格等
2. 高级排版：图文混排、折叠面板、卡片布局等
3. 特殊语法：数学公式、脚注、表情符号等

> 💡 **提示**：部分高级排版功能可能需要特定的 Markdown 编辑器或渲染器支持。使用前请确认你的工具是否支持这些特性。
`,
  authorName: "Markdown 专家",
  publishedAt: new Date("2024-03-15"),
  coverImage: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=600",
  metaKeywords: "Markdown,基础语法,高级排版,布局设计",
  metaDescription: "从基础语法到高级排版，全面了解 Markdown 的各种用法和技巧。",
  status: "published",
  isEditor: true,
  createdAt: new Date("2024-03-15"),
  updatedAt: new Date("2024-03-15"),
  categories: [{ name: "教程" }],
  tags: [{ name: "Markdown" }, { name: "排版" }, { name: "写作" }],
};

// 添 meta 函数
export const meta: MetaFunction = () => {
  return [
    { title: mockPost.title },
    { name: "description", content: mockPost.metaDescription },
    { name: "keywords", content: mockPost.metaKeywords },
    // 添加 Open Graph 标
    { property: "og:title", content: mockPost.title },
    { property: "og:description", content: mockPost.metaDescription },
    { property: "og:image", content: mockPost.coverImage },
    { property: "og:type", content: "article" },
    // 添加 Twitter 卡片标签
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: mockPost.title },
    { name: "twitter:description", content: mockPost.metaDescription },
    { name: "twitter:image", content: mockPost.coverImage },
  ];
};


// 添加复制能的接口
interface CopyButtonProps {
  code: string;
}

// 修改 CopyButton 组件
const CopyButton: React.FC<CopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("复制成功", "代码已复制到剪贴板");
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('复制失败:', err);
      toast.error("复制失败", "请检查浏览器权限设置");
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopy}
      className="h-7 px-2 text-xs
        transition-all duration-300 ease-in-out
        [@media(hover:hover)]:hover:bg-[--gray-4]
        active:bg-[--gray-4] active:transition-none"
    >
      <span className="transition-opacity duration-300">
        {copied ? "已复制" : "复制"}
      </span>
    </Button>
  );
};

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 修改 generateSequentialId 函数的实现
const generateSequentialId = (() => {
  const idMap = new Map<string, number>();
  
  return (postId: string, reset = false) => {
    if (reset) {
      idMap.delete(postId);
      return '';
    }
    
    if (!idMap.has(postId)) {
      idMap.set(postId, 0);
    }
    
    const counter = idMap.get(postId)!;
    const id = `heading-${postId}-${counter}`;
    idMap.set(postId, counter + 1);
    return id;
  };
})();

export default new Template({}, ({ http, args }) => {
  const [toc, setToc] = useState<string[]>([]);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [showToc, setShowToc] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [headingIdsArrays, setHeadingIdsArrays] = useState<{[key: string]: string[]}>({});
  const headingIds = useRef<string[]>([]); // 保持原有的 ref
  const containerRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const md = new MarkdownIt();
    const tocArray: TocItem[] = [];
    
    // 重置计数器,传入文章ID
    generateSequentialId(mockPost.id.toString(), true);
    
    let isInCodeBlock = false;
    
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      isInCodeBlock = true;
      const result = self.renderToken(tokens, idx, options);
      isInCodeBlock = false;
      return result;
    };
    
    md.renderer.rules.heading_open = (tokens, idx) => {
      const token = tokens[idx];
      const level = parseInt(token.tag.slice(1));
      
      if (level <= 3 && !isInCodeBlock) {
        const content = tokens[idx + 1].content;
        // 生成ID时传入文章ID
        const id = generateSequentialId(mockPost.id.toString());
        
        token.attrSet('id', id);
        tocArray.push({
          id,
          text: content,
          level
        });
      }
      return md.renderer.renderToken(tokens, idx, md.options);
    };

    md.render(mockPost.content);
    
    const newIds = tocArray.map(item => item.id);
    headingIds.current = [...newIds];
    setHeadingIdsArrays(prev => ({
      ...prev,
      [mockPost.id]: [...newIds]
    }));
    
    setToc(newIds);
    setTocItems(tocArray);
    
    if (tocArray.length > 0) {
      setActiveId(tocArray[0].id);
    }
  }, [mockPost.content, mockPost.id]);

  const components = useMemo(() => ({
    h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'> & { node?: any }) => {
      if (headingIdsArrays[mockPost.id] && headingIds.current.length === 0) {
        headingIds.current = [...headingIdsArrays[mockPost.id]];
      }
      const headingId = headingIds.current.shift();
      return (
        <h1 id={headingId} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'> & { node?: any }) => {
      if (headingIdsArrays[mockPost.id] && headingIds.current.length === 0) {
        headingIds.current = [...headingIdsArrays[mockPost.id]];
      }
      const headingId = headingIds.current.shift();
      return (
        <h2 id={headingId} className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-5 sm:mt-6 mb-2 sm:mb-3" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'> & { node?: any }) => {
      if (headingIdsArrays[mockPost.id] && headingIds.current.length === 0) {
        headingIds.current = [...headingIdsArrays[mockPost.id]];
      }
      const headingId = headingIds.current.shift();
      return (
        <h3 id={headingId} className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mt-4 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
      <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 text-[--gray-11]" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-[--gray-11]" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="list-decimal pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-[--gray-11]" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
      <li className="text-sm sm:text-base md:text-lg leading-relaxed" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote className="border-l-4 border-[--gray-6] pl-4 sm:pl-6 py-2 my-3 sm:my-4 text-[--gray-11] italic" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1].toLowerCase() : "";

      return inline ? (
        <code className="px-1.5 py-0.5 rounded bg-[--gray-3] text-[--gray-12] text-[0.85em] sm:text-[0.9em]" {...props}>
          {children}
        </code>
      ) : (
        <div className="my-4 sm:my-6">
          <div className="flex justify-between items-center h-9 sm:h-10 px-4 sm:px-6 
            border-t border-x border-[--gray-6] 
            bg-[--gray-3] dark:bg-[--gray-3]
            rounded-t-lg
            mx-0"
          >
            <div className="text-sm text-[--gray-12] dark:text-[--gray-12] font-medium">{lang || "text"}</div>
            <CopyButton code={String(children)} />
          </div>
          
          <div className="border border-[--gray-6] rounded-b-lg bg-white dark:bg-[--gray-1] mx-0">
            <div className="overflow-x-auto">
              <div className="p-4 sm:p-6">
                <SyntaxHighlighter
                  language={lang || "text"}
                  style={{
                    ...oneLight,
                    'punctuation': {
                      color: 'var(--gray-12)'
                    },
                    'operator': {
                      color: 'var(--gray-12)'
                    },
                    'symbol': {
                      color: 'var(--gray-12)'
                    }
                  }}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "none",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                  codeTagProps={{
                    className: "dark:text-[--gray-12]",
                    style: {
                      color: "inherit"
                    }
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      );
    },
    // 修改表格相关组件的响应式设计
    table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
      <div className="w-full my-4 sm:my-6 -mx-4 sm:mx-0 overflow-hidden">
        <div className="scroll-container overflow-x-auto">
          <div className="min-w-[640px] sm:min-w-0">
            <div className="border border-[--gray-6] rounded-lg bg-white dark:bg-[--gray-1]">
              <table className="w-full border-collapse text-xs sm:text-sm" {...props}>
                {children}
              </table>
            </div>
          </div>
        </div>
      </div>
    ),
    
    th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
      <th 
        className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider
                  text-[--gray-12] break-words hyphens-auto
                  bg-[--gray-3] dark:bg-[--gray-3]
                  first:rounded-tl-lg last:rounded-tr-lg
                  border-b border-[--gray-6]"
        {...props}
      >
        {children}
      </th>
    ),
    
    td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
      <td 
        className="px-4 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[--gray-11] break-words hyphens-auto
                [&:first-child]:font-medium [&:first-child]:text-[--gray-12]" 
        {...props}
      >
        {children}
      </td>
    ),
  }), [mockPost.id, headingIdsArrays]);

  // 修改滚动监听逻辑
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isMounted) return;
        
        const container = document.querySelector("#main-content");
        const contentBox = document.querySelector(".prose");
        
        if (!container || !contentBox) return;

        // 找出所有进入可视区域的标题
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        
        if (intersectingEntries.length > 0) {
          // 获取所有可见标题的位置信息
          const visibleHeadings = intersectingEntries.map(entry => ({
            id: entry.target.id,
            top: entry.boundingClientRect.top
          }));
          
          // 选择靠近视口顶部的标题
          const closestHeading = visibleHeadings.reduce((prev, current) => {
            return Math.abs(current.top) < Math.abs(prev.top) ? current : prev;
          });
          
          setActiveId(closestHeading.id);
        }
      },
      {
        root: document.querySelector("#main-content"),
        rootMargin: '-20px 0px -80% 0px',
        threshold: [0, 1]
      }
    );

    if (isMounted) {
      tocItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.observe(element);
        }
      });
    }

    return () => {
      if (isMounted) {
        tocItems.forEach((item) => {
          const element = document.getElementById(item.id);
          if (element) {
            observer.unobserve(element);
          }
        });
      }
    };
  }, [tocItems, isMounted]);

  // 修改点击处理函数
  const handleTocClick = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    const element = document.getElementById(itemId);
    const container = document.querySelector("#main-content");
    const contentBox = document.querySelector(".prose"); // 获取实际内容容器

    if (element && container && contentBox) {
      isClickScrolling.current = true;
      
      // 计算元素相对于内容容器的偏移量
      const elementRect = element.getBoundingClientRect();
      const contentBoxRect = contentBox.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // 计算元素相对于内容容器的偏移量
      const relativeTop = elementRect.top - contentBoxRect.top;
      
      // 计算内容容器相对于滚动容器的偏移量
      const contentOffset = contentBoxRect.top - containerRect.top;
      
      // 计算最终滚动距离
      const scrollDistance = container.scrollTop + relativeTop + contentOffset;

      container.scrollTo({
        top: scrollDistance,
        behavior: "smooth",
      });
      
      // 滚动完成后重置标记
      const resetTimeout = setTimeout(() => {
        isClickScrolling.current = false;
      }, 100);

      return () => clearTimeout(resetTimeout);
    }
  }, []);

  // 修改移动端目录的渲染逻辑
  const mobileMenu = (
    <>
      {isMounted && (
        <Button
          className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg bg-[--accent-9] text-white"
          onClick={() => setShowToc(true)}
        >
          <CodeIcon className="w-5 h-5" />
        </Button>
      )}

      {isMounted && showToc && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
          onClick={() => setShowToc(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[--gray-1] shadow-xl
              transform transition-transform duration-300 ease-out
              translate-x-0 animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[--gray-6]">
              <Text size="2" weight="medium" className="text-[--gray-12]">
                目录
              </Text>
              <Button 
                variant="ghost" 
                onClick={() => setShowToc(false)}
                className="hover:bg-[--gray-4] active:bg-[--gray-5] transition-colors"
              >
                关闭
              </Button>
            </div>

            <ScrollArea
              type="hover"
              scrollbars="vertical"
              className="scroll-container h-[calc(100vh-64px)] p-4"
            >
              <div className="space-y-2">
                {tocItems.map((item, index) => {
                  if (item.level > 3) return null;
                  return (
                    <a
                      key={`${item.id}-${index}`}
                      href={`#${item.id}`}
                      className={`
                        block py-1.5 px-3 rounded transition-colors
                        ${
                          activeId === item.id
                            ? "text-[--accent-11] font-medium bg-[--accent-3]"
                            : "text-[--gray-11] hover:text-[--gray-12] hover:bg-[--gray-3]"
                        }
                        ${item.level === 2 ? "ml-4" : item.level === 3 ? "ml-8" : ""}
                        ${
                          item.level === 1
                            ? "text-sm font-medium"
                            : item.level === 2 
                              ? "text-[0.8125rem]" 
                              : `text-xs ${activeId === item.id ? "text-[--accent-11]" : "text-[--gray-10]"}`
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          const yOffset = -80;
                          element.scrollIntoView({ behavior: 'smooth' });
                          window.scrollBy(0, yOffset);
                          setActiveId(item.id);
                          setShowToc(false);
                        }
                      }}
                    >
                      {item.text}
                    </a>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Container 
      ref={containerRef}
      size={{initial: "2", sm: "3", md: "4"}}
      className="px-4 sm:px-6 md:px-8"
    >
      {isMounted && mobileMenu}
      
      <Flex 
        className="relative flex-col lg:flex-row" 
        gap={{initial: "4", lg: "8"}}
      >
        {/* 文章主体 */}
        <Box className="w-full lg:flex-1">
          <Box className="p-4 sm:p-6 md:p-8">
            {/* 头部 */}
            <Box className="mb-4 sm:mb-8">
              <Heading
                size={{initial: "6", sm: "7", md: "8"}}
                className="mb-4 sm:mb-6 leading-tight text-[--gray-12] font-bold tracking-tight"
              >
                {mockPost.title}
              </Heading>

              <Flex
                gap={{initial: "3", sm: "4", md: "6"}}
                className="items-center text-[--gray-11] flex-wrap"
              >
                {/* 作者名字 */}
                <Text
                  size="2"
                  weight="medium"
                >
                  {mockPost.authorName}
                </Text>

                {/* 分隔符 */}
                <Box className="w-px h-4 bg-[--gray-6]" />

                {/* 发布日期 */}
                <Flex
                  align="center"
                  gap="2"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <Text size="2">
                    {mockPost.publishedAt?.toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </Flex>

                {/* 分隔符 */}
                <Box className="w-px h-4 bg-[--gray-6]" />

                {/* 分类 */}
                <Flex gap="2">
                  {mockPost.categories?.map((category) => {
                    const color = getColorScheme(category.name);
                    return (
                      <Text
                        key={category.name}
                        size="2"
                        className={`px-3 py-0.5 ${color.bg} ${color.text} rounded-md 
                                    border ${color.border} font-medium ${color.hover}
                                    transition-colors cursor-pointer`}
                      >
                        {category.name}
                      </Text>
                    );
                  })}
                </Flex>

                {/* 分隔符 */}
                <Box className="w-px h-4 bg-[--gray-6]" />

                {/* 标签 */}
                <Flex gap="2">
                  {mockPost.tags?.map((tag) => {
                    const color = getColorScheme(tag.name);
                    return (
                      <Text
                        key={tag.name}
                        size="2"
                        className={`px-3 py-1 ${color.bg} ${color.text} rounded-md 
                                    border ${color.border} ${color.hover}
                                    transition-colors cursor-pointer flex items-center gap-2`}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${color.dot}`}
                          style={{
                            flexShrink: 0,
                            opacity: 0.8,
                          }}
                        />
                        {tag.name}
                      </Text>
                    );
                  })}
                </Flex>
              </Flex>
            </Box>

            {/* 面图片 */}
            {mockPost.coverImage && (
              <Box className="mb-16 rounded-xl overflow-hidden aspect-[2/1] shadow-lg">
                <img
                  src={mockPost.coverImage}
                  alt={mockPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </Box>
            )}

            {/* 内容区域 */}
            <Box className="prose dark:prose-invert max-w-none 
              [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_pre]:!border-0
              [&_.prism-code]:!bg-transparent [&_.prism-code]:!shadow-none
              [&_pre_.prism-code]:!bg-transparent [&_pre_.prism-code]:!shadow-none
              [&_code]:!bg-transparent [&_code]:!shadow-none
              [&_table]:!m-0
            ">
              <div ref={contentRef}>
                <ReactMarkdown 
                  components={components}
                  remarkPlugins={[remarkGfm]}
                >
                  {mockPost.content}
                </ReactMarkdown>
              </div>
            </Box>
          </Box>
        </Box>

        {/* 侧边目录 */}
        <Box className="hidden lg:block w-48 xl:w-56 relative">
          <Box className="sticky top-8">
            <Text
              size="2"
              weight="medium"
              className="mb-4 text-[--gray-11] flex items-center gap-2 text-sm"
            >
              <CodeIcon className="w-3 h-3" />
              目录
            </Text>
            <ScrollArea
              type="hover"
              scrollbars="vertical"
              className="scroll-container max-h-[calc(100vh-180px)]"
              style={{
                ["--scrollbar-size" as string]: "6px",
              }}
            >
              <Box className="space-y-1.5 pr-4">
                {tocItems.map((item, index) => {
                  if (item.level > 3) return null;
                  return (
                    <a
                      key={`${item.id}-${index}`}
                      href={`#${item.id}`}
                      className={`
                        block text-xs leading-relaxed transition-all
                        border-l-2 pl-3
                        ${
                          activeId === item.id
                            ? "text-[--accent-11] font-medium border-[--accent-9]"
                            : "text-[--gray-11] hover:text-[--gray-12] border-[--gray-6] hover:border-[--gray-8]"
                        }
                        ${item.level === 2 ? "ml-3" : item.level === 3 ? "ml-6" : ""}
                        ${
                          item.level === 2 
                            ? "text-[0.75rem]" 
                            : item.level === 3 
                              ? `text-[0.7rem] ${activeId === item.id ? "text-[--accent-11]" : "text-[--gray-10]"}`
                              : ""
                        }
                      `}
                      onClick={(e) => handleTocClick(e, item.id)}
                    >
                      {item.text}
                    </a>
                  );
                })}
              </Box>
            </ScrollArea>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
});

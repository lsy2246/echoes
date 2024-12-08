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

// 示例文章数据
const mockPost: PostDisplay = {
  id: 1,
  title: "现代前端开发完全指南",
  content: `
# 现代前端开发完全指南

前端开发已经成为软件开发中最重要的领域之一。本全面介绍现代前端开发的各个方面。

![Modern Frontend Development](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600)

## 1. 开发环境搭建

在开始前端开发之前，我们要搭建合适的开发环境。

### 1.1 必备工具安装

发环境需要安装以下工具：

\`\`\`bash
# 安装 Node.js
brew install node

# 安装包管理器
npm install -g pnpm

# 安装开发工具
pnpm install -g typescript vite
\`\`\`

### 1.2 编辑器配置

推荐使用 VS Code 作为开发工具，需要安装以下插件：

- ESLint
- Prettier
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense

![VS Code Setup](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600)

## 2. 项目架构设计

### 2.1 目录结构
### 2.1 目录结构
### 2.1 目录结构
### 2.1 目录结构
### 2.1 目录结构
### 2.1 目录结构
### 2.1 目录结构
### 2.1 目录结构

一个良好的项目结构对于项目的可维护性至关重要。

\`\`\`typescript
// 推荐的项目结构
interface ProjectStructure {
  src: {
    components: {
      common: string[];    // 通用组件
      features: string[];  // 功能组件
      layouts: string[];   // 布局组件
    };
    pages: string[];      // 页面组件
    hooks: string[];      // 定 hooks
    utils: string[];      // 工具函数
    types: string[];      // 类型定义
    styles: string[];     // 样式文件
  }
}
\`\`\`

### 2.2 状态管理

现代前端应用需要高效的状态管理方案：

![State Management](https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=600)

## 3. 性能优化

### 3.1 加载性能

关键的加载性能指标：

| 指标 | 目标值 | 优化方法 |
|------|--------|----------|
| FCP | < 2s | 路由懒加载 |
| TTI | < 3.5s | 代码分割 |
| LCP | < 2.5s | 图片优化 |

### 3.2 运行时性能

#### 3.2.1 虚拟列表

处理大数据列表时的示例代码：

\`\`\`typescript
interface VirtualListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (item: any) => React.ReactNode;
}

const VirtualList: React.FC<VirtualListProps> = ({
  items,
  height,
  itemHeight,
  renderItem
}) => {
  // 现码...
};
\`\`\`

#### 3.2.2 防抖与节流

\`\`\`typescript
// 防抖函数实现
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
\`\`\`

### 3.3 构建优化

![Build Optimization](https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=1200&h=600)

## 4. 测试略

### 4.1 单元测试

使用 Jest 进行单元测试：

\`typescript
describe('Utils', () => {
  test('debounce should work correctly', (done) => {
    let counter = 0;
    const increment = () => counter++;
    const debouncedIncrement = debounce(increment, 100);

    debouncedIncrement();
    debouncedIncrement();
    debouncedIncrement();

    expect(counter).toBe(0);

    setTimeout(() => {
      expect(counter).toBe(1);
      done();
    }, 150);
  });
});
\`\`\`

### 4.2 集成测试

使用 Cypress 进行端到端测试。

![Testing](https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600)

## 5. 部署与监控

### 5.1 CI/CD 配置

\`\`\`yaml
name: Deploy
on:
  push:
    branches: [ main ]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install
        run: pnpm install
      - name: Build
        run: pnpm build
      - name: Deploy
        run: pnpm deploy
\`\`\`

### 5.2 监控系统

#### 5.2.1 性能监控

关键指标监控：

- 页面加载时间
- 首次内容绘制
- 首次大内容绘制
- 首次输入延迟

#### 5.2.2 错误监控

错误示例：

\`\`\`typescript
interface ErrorReport {
  type: 'error' | 'warning';
  message: string;
  stack?: string;
  timestamp: number;
  userAgent: string;
}

function reportError(error: Error): void {
  const report: ErrorReport = {
    type: 'error',
    message: error.message,
    stack: error.stack,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  };
  
  // 发送错误报告
  sendErrorReport(report);
}
\`\`

## 6. 安全最佳实践

### 6.1 XSS 防护

\`\`\`typescript
// 安全的 HTML 转义函数
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
\`\`\`

### 6.2 CSRF 防护

![Security](https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=600)

## 总结

现代前端开发是一个复杂的系统工程，需要我们在以下方面不断精进：

1. 工程化能力
2. 性能优化
3. 测试覆盖
4. 全防护
5. 部署监控

> 持续学习实践是提高端开发水平的关键。

相关资源：
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [GitHub](https://github.com/)
`,
  authorName: "张三",
  publishedAt: new Date("2024-03-15"),
  coverImage: "",
  metaKeywords: "前端开发,工程,效率",
  metaDescription: "探讨如何构建高效的前端开发高开发效率",
  status: "published",
  isEditor: true,
  createdAt: new Date("2024-03-15"),
  updatedAt: new Date("2024-03-15"),
  categories: [{ name: "前端开发" }],
  tags: [{ name: "工程化" }, { name: "效率提升" }, { name: "发工具" }],
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

// 加 CopyButton 组件
const CopyButton: React.FC<CopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopy}
      className="h-7 px-2 text-xs hover:bg-[--gray-4]"
    >
      {copied ? "已复制" : "复制"}
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
            bg-[--gray-2] dark:bg-[--gray-2]
            rounded-t-lg
            mx-0"
          >
            <div className="text-sm text-[--gray-11] dark:text-[--gray-11] font-medium">{lang || "text"}</div>
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
        <div className="overflow-x-auto">
          <div className="min-w-[640px] sm:min-w-0">
            <div className="border-x border-t border-b sm:border-t border-[--gray-6] rounded-none sm:rounded-lg bg-white dark:bg-[--gray-1]">
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
                  text-[--gray-12] break-words hyphens-auto"
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
          
          // 选择最靠近视口顶部的标题
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
              className="h-[calc(100vh-64px)] p-4"
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

            {/* 封面图片 */}
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
              className="max-h-[calc(100vh-180px)]"
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

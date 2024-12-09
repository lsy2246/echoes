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
import { toast } from "hooks/Notification";
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import ReactDOMServer from 'react-dom/server';

// 示例文章数据
const mockPost: PostDisplay = {
  id: 1,
  title: "Markdown 完全指南：从基础到高级排版",
  content: `
# Markdown 完全指南：从基础到高级排版

这篇指南介绍 Markdown 的基础语法和高级排版技巧。

## 1. 基础语法

### 1.1 粗体文本

\`\`\`markdown
**这是粗体文本**
\`\`\`

**这是粗体文本**

### 1.2 斜体文本

\`\`\`markdown
*这是斜体文本*
\`\`\`

*这是斜体文本*

### 1.3 粗斜体文本

\`\`\`markdown
***这是粗斜体文本***
\`\`\`

***这是粗斜体文本***

### 1.4 删除线文本

\`\`\`markdown
~~这是删除线文本~~
\`\`\`

~~这是删除线文本~~

### 1.5 无序列表

\`\`\`markdown
- 第一项
  - 子项 1
  - 子项 2
- 第二项
- 第三项
\`\`\`

- 第一项
  - 子项 1
  - 子项 2
- 第二项
- 第三项

### 1.6 有序列表

\`\`\`markdown
1. 第一步
   1. 子步骤 1
   2. 子步骤 2
2. 第二步
3. 第三步
\`\`\`

1. 第一步
   1. 子步骤 1
   2. 子步骤 2
2. 第二步
3. 第三步

### 1.7 任务列表

\`\`\`markdown
- [x] 已完成任务
- [ ] 未完成任务
- [x] 又一个已完成任务
\`\`\`

- [x] 已完成任务
- [ ] 未完成任务
- [x] 又一个已完成任务

### 1.8 行内代码

\`\`\`markdown
这是一段包含\`const greeting = "Hello World";\`的行内代码
\`\`\`

这是一段包含\`const greeting = "Hello World";\`的行内代码

### 1.9 代码块

\`\`\`\`markdown
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
\`\`\`\`

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

### 1.10 表格

\`\`\`markdown
| 功能 | 基础版 | 高级版 |
|:-----|:------:|-------:|
| 文本编辑 | ✓ | ✓ |
| 实时预览 | ✗ | ✓ |
| 导出格式 | 2种 | 5种 |
\`\`\`

| 功能 | 基础版 | 高级版 |
|:-----|:------:|-------:|
| 文本编辑 | ✓ | ✓ |
| 实时预览 | ✗ | ✓ |
| 导出格式 | 2种 | 5种 |

### 1.11 引用

\`\`\`markdown
> 📌 **最佳实践**
> 
> 好的文章需要有清晰的结构和流畅的表达。
\`\`\`

> 📌 **最佳实践**
> 
> 好的文章需要有清晰的结构和流畅的表达。

### 1.12 脚注

\`\`\`markdown
这里有一个脚注[^1]。

[^1]: 这是脚注的内容。
\`\`\`

这里有一个脚注[^1]。

[^1]: 这是脚注的内容。

### 1.13 表情符号

\`\`\`markdown
:smile: :heart: :star: :rocket:
\`\`\`

:smile: :heart: :star: :rocket:

## 2. 高级排版

### 2.1 图文混排布局

<pre>
<div class="flex items-center gap-6 my-8">
  <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400" 
       alt="写作工具" 
       class="w-1/3 rounded-lg shadow-lg" />
  <div class="flex-1">
    <h4 class="text-xl font-bold mb-2">高效写作工具</h4>
    <p>使用合适的写作工具可以极大提升写作效率。推荐使用支持即时预览的编辑器，这样可以实时查看排版效果。</p>
  </div>
</div>
</pre>

<div class="flex items-center gap-6 my-8">
  <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400" 
       alt="写作工具" 
       class="w-1/3 rounded-lg shadow-lg" />
  <div class="flex-1">
    <h4 class="text-xl font-bold mb-2">高效写作工具</h4>
    <p>使用合适的写作工具可以极大提升写作效率。推荐使用支持即时预览的编辑器，这样可以实时查看排版效果。</p>
  </div>
</div>

### 2.2 可折叠内容

<pre>
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
</pre>

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

<pre>
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
</pre>

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

<pre>
<div class="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg my-8">
  <h4 class="text-lg font-bold text-blue-700 mb-2">💡 小贴士</h4>
  <p class="text-blue-600">在写作时，可以先列出文章大纲，再逐步充实内容。这可以保证文章结构清晰，内容完整。</p>
</div>
</pre>

<div class="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg my-8">
  <h4 class="text-lg font-bold text-blue-700 mb-2">小贴士</h4>
  <p class="text-blue-600">在写作时，可以先列出文章大纲，再逐步充实内容。这样可以保证文章结构清晰，内容完整。</p>
</div>

### 2.5 时间线

<pre>
<div class="relative pl-8 my-8 border-l-2 border-gray-200">
  <div class="mb-8 relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">1. 确定主题</div>
    <p>根据目标受众和写作目的，确定文章主题。</p>
  </div>
  
  <div class="mb-8 relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">2. 收集资料</div>
    <p>广泛搜集相关资料，为写作做充实准备。</p>
  </div>
</div>
</pre>

<div class="relative pl-8 my-8 border-l-2 border-gray-200">
  <div class="mb-8 relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">1. 确定主题</div>
    <p>根据目标受众和写作目的，确定文章主题。</p>
  </div>
  
  <div class="mb-8 relative">
    <div class="absolute -left-10 w-4 h-4 bg-blue-500 rounded-full"></div>
    <div class="font-bold mb-2">2. 收集资料</div>
    <p>广泛搜集相关资料，为写作做充实准备。</p>
  </div>
</div>

### 2.6 引用式

<pre>
> 📌 **最佳实践**
> 
> 好的文章需要有清晰的结构和流畅的表达。以下是一些建议：
> 
> 1. 开门见山，直入主题
> 2. 层次分明，逻辑清晰
> 3. 语言简洁，表达准确
> 
> *— 写作指南*
</pre>

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

### 3.1 脚注

<pre>
这里有一个脚注[^1]。

[^1]: 这是脚注的内容。
</pre>

这里有一个脚注[^1]。

[^1]: 这是脚注的内容。

### 3.2 表情符号

<pre>
:smile: :heart: :star: :rocket:
</pre>

:smile: :heart: :star: :rocket:

## 4. 总结

本文展示了 Markdown 从基础到高级的各种用法：

1. 基础语法：文本格式化、列表、代码、表格等
2. 高级排版：图文混排、折叠面板、卡片布局等
3. 特殊语法：数学公式、脚注、表情符号等

> 💡 **提示**：部分高级排版功能可能需要特定的 Markdown 编辑器或渲染支持，请确认是否支持这些功能。
`,
  authorName: "Markdown 专家",
  publishedAt: new Date("2024-03-15"),
  coverImage: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=600",
  status: "published",
  isEditor: true,
  createdAt: new Date("2024-03-15"),
  updatedAt: new Date("2024-03-15"),
  taxonomies: {
    categories: [{ 
      name: "教程",
      slug: "tutorial",
      type: "category"
    }],
    tags: [
      { name: "Markdown", slug: "markdown", type: "tag" },
      { name: "排版", slug: "typography", type: "tag" },
      { name: "写作", slug: "writing", type: "tag" }
    ]
  },
  metadata: [
    { 
      id: 1,
      targetType: "post",
      targetId: 1,
      metaKey: "description",
      metaValue: "从基础语法到高级排版，全面了解 Markdown 的各种用法和技巧。"
    },
    {
      id: 2,
      targetType: "post",
      targetId: 1,
      metaKey: "keywords",
      metaValue: "Markdown,基础语法,高级排版,布局设计"
    }
  ]
};

// 添 meta 函数
export const meta: MetaFunction = () => {
  const description = mockPost.metadata?.find(m => m.metaKey === "description")?.metaValue || "";
  const keywords = mockPost.metadata?.find(m => m.metaKey === "keywords")?.metaValue || "";

  return [
    { title: mockPost.title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    // 添 Open Graph 标
    { property: "og:title", content: mockPost.title },
    { property: "og:description", content: description },
    { property: "og:image", content: mockPost.coverImage },
    { property: "og:type", content: "article" },
    // 添加 Twitter 卡片标签
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: mockPost.title },
    { name: "twitter:description", content: description },
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
    const id = `heading-${counter}`;
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
  const [isMounted, setIsMounted] = useState(false);
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
    
    // 重计数器,传入文章ID
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
    
    // 只在 ID 数组发生变化时更新
    const newIds = tocArray.map(item => item.id);
    if (JSON.stringify(headingIds.current) !== JSON.stringify(newIds)) {
      headingIds.current = [...newIds];
      setHeadingIdsArrays(prev => ({
        ...prev,
        [mockPost.id]: [...newIds]
      }));
    }
    
    setToc(newIds);
    setTocItems(tocArray);
    
    if (tocArray.length > 0 && !activeId) {
      setActiveId(tocArray[0].id);
    }
  }, [mockPost.content, mockPost.id, activeId]);

  useEffect(() => {
    if (headingIdsArrays[mockPost.id] && headingIds.current.length === 0) {
      headingIds.current = [...headingIdsArrays[mockPost.id]];
    }
  }, [headingIdsArrays, mockPost.id]);

  const components = useMemo(() => {
    return {
      h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => {
        const headingId = headingIds.current.shift();
        return (
          <h1 id={headingId} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4" {...props}>
            {children}
          </h1>
        );
      },
      h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => {
        const headingId = headingIds.current.shift();
        return (
          <h2 id={headingId} className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-5 sm:mt-6 mb-2 sm:mb-3" {...props}>
            {children}
          </h2>
        );
      },
      h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => {
        const headingId = headingIds.current.shift();
        return (
          <h3 id={headingId} className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mt-4 mb-2" {...props}>
            {children}
          </h3>
        );
      },
      p: ({ node, ...props }: ComponentPropsWithoutRef<'p'> & { node?: any }) => (
        <p 
          className="text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 text-[--gray-11]" 
          {...props}
        />
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
      pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => {
        const childArray = React.Children.toArray(children);
        
        // 检查是否包含代码块
        const codeElement = childArray.find(
          child => React.isValidElement(child) && child.props.className?.includes('language-')
        );

        // 如果是代码块，让 code 组件处理
        if (codeElement) {
          return <>{children}</>;
        }

        // 获取内容
        let content = '';
        if (typeof children === 'string') {
          content = children;
        } else if (Array.isArray(children)) {
          content = children.map(child => {
            if (typeof child === 'string') return child;
            if (React.isValidElement(child)) {
              // 使用 renderToString 而不是 renderToStaticMarkup
              return ReactDOMServer.renderToString(child as React.ReactElement)
                // 移除 React 添加的 data 属性
                .replace(/\s+data-reactroot=""/g, '')
                // 移除已经存在的 HTML 实体编码
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'");
            }
            return '';
          }).join('');
        } else if (React.isValidElement(children)) {
          content = ReactDOMServer.renderToString(children as React.ReactElement)
            .replace(/\s+data-reactroot=""/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'");
        }

        // 普通预格式化文本
        return (
          <pre 
            className="my-4 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap
                       bg-[--gray-3] border border-[--gray-6] text-[--gray-12]
                       text-sm leading-relaxed font-mono"
            {...props}
          >
            {content
             }
          </pre>
        );
      },
      code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { 
        inline?: boolean,
        className?: string 
      }) => {
        const match = /language-(\w+)/.exec(className || '');
        const code = String(children).replace(/\n$/, '');

        if (!className || inline) {
          return (
            <code 
              className="px-2 py-1 rounded-md bg-[--gray-4] text-[--accent-11] font-medium text-[0.85em]" 
              {...props}
            >
              {children}
            </code>
          );
        }

        const language = match ? match[1] : '';
        
        return (
          <div className="my-4 sm:my-6">
            <div className="flex justify-between items-center h-9 sm:h-10 px-4 sm:px-6 
              border-t border-x border-[--gray-6] 
              bg-[--gray-3] dark:bg-[--gray-3]
              rounded-t-lg"
            >
              <div className="text-sm text-[--gray-12] dark:text-[--gray-12] font-medium">
                {language || "text"}
              </div>
              <CopyButton code={code} />
            </div>
            
            <div className="border border-[--gray-6] rounded-b-lg bg-white dark:bg-[--gray-1]">
              <div className="overflow-x-auto">
                <div className="p-4 sm:p-6">
                  <SyntaxHighlighter
                    language={language || "text"}
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
                    {code}
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
                <table className="w-full border-collapse" {...props}>
                  {children}
                </table>
              </div>
            </div>
          </div>
        </div>
      ),
      
      th: ({ children, style, ...props }: ComponentPropsWithoutRef<'th'> & { style?: React.CSSProperties }) => {
        // 获取对齐方式
        const getAlignment = () => {
          if (style?.textAlign === 'center') return 'text-center';
          if (style?.textAlign === 'right') return 'text-right';
          return 'text-left';
        };

        return (
          <th 
            className={`px-4 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider
                      text-[--gray-12] break-words hyphens-auto
                      bg-[--gray-3] dark:bg-[--gray-3]
                      first:rounded-tl-lg last:rounded-tr-lg
                      border-b border-[--gray-6]
                      align-top ${getAlignment()}`}
            {...props}
          >
            {children}
          </th>
        );
      },
      
      td: ({ children, style, ...props }: ComponentPropsWithoutRef<'td'> & { style?: React.CSSProperties }) => {
        // 获取父级 th 的对齐方式
        const getAlignment = () => {
          if (style?.textAlign === 'center') return 'text-center';
          if (style?.textAlign === 'right') return 'text-right';
          return 'text-left';
        };

        return (
          <td 
            className={`px-4 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-[--gray-11] break-words hyphens-auto
                      [&:first-child]:font-medium [&:first-child]:text-[--gray-12]
                      align-top ${getAlignment()}`}
            {...props}
          >
            {children}
          </td>
        );
      },
      // 修改 details 组件
      details: ({ node, ...props }: ComponentPropsWithoutRef<'details'> & { node?: any }) => (
        <details 
          className="my-4 rounded-lg border border-[--gray-6] bg-[--gray-2] overflow-hidden
                     marker:text-[--gray-11] [&[open]]:bg-[--gray-1]" 
          {...props}
        />
      ),
      
      // 修改 summary 组件
      summary: ({ node, ...props }: ComponentPropsWithoutRef<'summary'> & { node?: any }) => (
        <summary 
          className="px-4 py-3 cursor-pointer hover:bg-[--gray-3] transition-colors
                     text-[--gray-12] font-medium select-none
                     marker:text-[--gray-11]"
          {...props}
        />
      ),
    };
  }, []);

  // 修改滚动监听逻辑
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollTimeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        // 如果是点击触发的滚动，不处理高亮更新
        if (!isMounted || isClickScrolling.current) return;

        // 清除之前的定时器
        clearTimeout(scrollTimeout);

        // 添加防抖，等待滚动结束后再更新高亮
        scrollTimeout = setTimeout(() => {
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          
          if (visibleEntries.length > 0) {
            const visibleHeadings = visibleEntries
              .map(entry => ({
                id: entry.target.id,
                top: entry.boundingClientRect.top,
                y: entry.intersectionRatio
              }))
              .sort((a, b) => {
                if (Math.abs(a.y - b.y) < 0.1) {
                  return a.top - b.top;
                }
                return b.y - a.y;
              });

            const mostVisible = visibleHeadings[0];
            
            setActiveId(currentActiveId => {
              if (mostVisible.id !== currentActiveId) {
                return mostVisible.id;
              }
              return currentActiveId;
            });
          }
        }, 100); // 100ms 的防抖延迟
      },
      {
        root: document.querySelector("#main-content"),
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
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
      clearTimeout(scrollTimeout);
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
    const contentBox = document.querySelector(".prose");

    if (element && container && contentBox) {
      // 设置点击滚动标志
      isClickScrolling.current = true;
      
      // 立即更新高亮，不等待滚动
      setActiveId(itemId);
      
      // 计算滚动位置
      const elementRect = element.getBoundingClientRect();
      const contentBoxRect = contentBox.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const relativeTop = elementRect.top - contentBoxRect.top;
      const contentOffset = contentBoxRect.top - containerRect.top;
      const scrollDistance = container.scrollTop + relativeTop + contentOffset;

      // 执行滚动
      container.scrollTo({
        top: scrollDistance,
        behavior: "smooth",
      });
      
      // 延迟重置 isClickScrolling 标志
      // 增加延迟时间，确保滚动完全结束
      const resetTimeout = setTimeout(() => {
        isClickScrolling.current = false;
      }, 1500); // 增加到 1.5 秒

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
          className="lg:hidden fixed top-[var(--header-height)] inset-x-0 bottom-0 z-50 bg-black/50 transition-opacity duration-300"
          onClick={() => setShowToc(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[--gray-1] shadow-xl
              transform transition-transform duration-300 ease-out
              translate-x-0 animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()}
          >
            <ScrollArea
              type="hover"
              scrollbars="vertical"
              className="scroll-container h-full p-4"
            >
              <div className="space-y-2">
                {tocItems.map((item, index) => {
                  if (item.level > 3) return null;
                  const isActive = activeId === item.id;
                  
                  return (
                    <a
                      key={`${item.id}-${index}`}
                      href={`#${item.id}`}
                      ref={node => {
                        // 当目录打开且是当前高亮项时，将其滚动到居中位置
                        if (node && isActive && showToc) {
                          requestAnimationFrame(() => {
                            // 直接查找最近的滚动容器
                            const scrollContainer = node.closest('.rt-ScrollAreaViewport');
                            if (scrollContainer) {
                              const containerHeight = scrollContainer.clientHeight;
                              const elementTop = node.offsetTop;
                              const elementHeight = node.clientHeight;
                              
                              // 确保计算的滚动位置是正数
                              const scrollTop = Math.max(0, elementTop - (containerHeight / 2) + (elementHeight / 2));
                              
                              // 使用 scrollContainer 而不是 container
                              scrollContainer.scrollTo({
                                top: scrollTop,
                                behavior: 'smooth'
                              });
                            }
                          });
                        }
                      }}
                      className={`
                        block py-1.5 px-3 rounded transition-colors
                        ${
                          isActive
                            ? "text-[--accent-11] font-medium bg-[--accent-3]"
                            : "text-[--gray-11] hover:text-[--gray-12] hover:bg-[--gray-3]"
                        }
                        ${item.level === 2 ? "ml-4" : item.level === 3 ? "ml-8" : ""}
                        ${
                          item.level === 1
                            ? "text-sm font-medium"
                            : item.level === 2 
                              ? "text-[0.8125rem]" 
                              : `text-xs ${isActive ? "text-[--accent-11]" : "text-[--gray-10]"}`
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

  // 在组件顶部添加 useMemo 包静态内容
  const PostContent = useMemo(() => {
    // 在渲染内容前重置 headingIds
    if (headingIdsArrays[mockPost.id]) {
      headingIds.current = [...headingIdsArrays[mockPost.id]];
    }

    return (
      <Box className="prose dark:prose-invert max-w-none 
        [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_pre]:!border-0
        [&_.prism-code]:!bg-transparent [&_.prism-code]:!shadow-none
        [&_pre_.prism-code]:!bg-transparent [&_pre_.prism-code]:!shadow-none
        [&_pre_code]:!bg-transparent [&_pre_code]:!shadow-none
        [&_table]:!m-0
        [&_:not(pre)>code]:![&::before]:hidden [&_:not(pre)>code]:![&::after]:hidden
        [&_:not(pre)>code]:[&::before]:content-none [&_:not(pre)>code]:[&::after]:content-none
        [&_:not(pre)>code]:!bg-[--gray-4] [&_:not(pre)>code]:!text-[--accent-11]
      ">
        <div ref={contentRef}>
          <ReactMarkdown 
            components={components}
            remarkPlugins={[remarkGfm, remarkEmoji]}
            rehypePlugins={[rehypeRaw]}
            skipHtml={false}
          >
            {mockPost.content}
          </ReactMarkdown>
        </div>
      </Box>
    );
  }, [mockPost.content, components, mockPost.id, headingIdsArrays]); // 添加必要的依赖

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
        {/* 文章体 - 调整宽度计算 */}
        <Box className="w-full lg:w-[calc(100%-12rem)] xl:w-[calc(100%-13rem)]">
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
                  {mockPost.taxonomies?.categories.map((category) => {
                    const color = getColorScheme(category.name);
                    return (
                      <Text
                        key={category.slug}
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
                  {mockPost.taxonomies?.tags.map((tag) => {
                    const color = getColorScheme(tag.name);
                    return (
                      <Text
                        key={tag.slug}
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

            {/* 封面 */}
            {mockPost.coverImage && (
              <Box className="mb-16 rounded-xl overflow-hidden aspect-[2/1] shadow-lg">
                <img
                  src={mockPost.coverImage}
                  alt={mockPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </Box>
            )}

            {/* 内容区域使用记忆化的组件 */}
            {PostContent}
          </Box>
        </Box>

        {/* 侧边目录 - 减小宽度 */}
        <Box className="hidden lg:block w-40 xl:w-44 flex-shrink-0">
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

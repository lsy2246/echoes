import { Template } from "interface/template";
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { 
  Container, 
  Heading, 
  Text, 
  Flex, 
  Box, 
  Avatar, 
  Button,
  Code,
  ScrollArea,
  Tabs,
  Card,
} from "@radix-ui/themes";
import {
  CalendarIcon,
  HeartIcon,
  ChatBubbleIcon,
  Share1Icon,
  BookmarkIcon,
  EyeOpenIcon,
  CodeIcon,
} from "@radix-ui/react-icons";
import { Post } from "interface/post";
import { useMemo, useState, useEffect } from "react";
import type { Components } from 'react-markdown';

// 示例文章数据
const mockPost: Post = {
  id: 1,
  title: "构建现代化的前端开发工作流",
  content: `
# 构建现代化的前端开发工作流

在现代前端开发中，一个高效的工作流程对于提高开发效率至关重要。本文将详细介绍如何建一个现代化的前端开发工作流。

## 工具链选择

选择合适的工具链是构建高效工作流的第一步。我们需要考虑以下几方

- 包管理器：npm、yarn 或 pnpm
- 构建工具：Vite、webpack 或 Rollup
- 代码规范：ESLint、Prettier
- 类型检查：TypeScript

## 开发环境配置

良好的开发环境配置可以大大提升开发效率：

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true
  }
}
\`\`\`

## 自动化流程

通过 GitHub Actions 等工具，我们可以实现：

- 自动化测试
- 自动化部署
- 代码质量检查
`,
  authorName: "张三",
  publishedAt: new Date("2024-03-15"),
  coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
  metaKeywords: "前端开发,工作流,效率",
  metaDescription: "探讨如何构现代的前端开发工作流，提高开发效率。",
  status: "published",
  isEditor: true,
  createdAt: new Date("2024-03-15"),
  updatedAt: new Date("2024-03-15"),
};

// 添加标题项接口
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 在 TocItem 接口旁边添加
interface MarkdownCodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

// 创建一个 React 组件
function PostContent() {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 解析文章内容生成目录
  useEffect(() => {
    const headings = mockPost.content.split('\n')
      .filter(line => line.startsWith('#'))
      .map(line => {
        const match = line.match(/^#+/);
        const level = match ? match[0].length : 1;
        const text = line.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/\s+/g, '-');
        return { id, text, level };
      });
    setToc(headings);
  }, [mockPost.content]);

  // 监听滚动更新当前标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Container className="py-16 px-4 md:px-8 lg:px-12 bg-[--gray-1]">
      <Flex gap="20" className="relative max-w-6xl mx-auto">
        {/* 左侧文章主体 */}
        <Box className="flex-1 max-w-3xl">
          {/* 文章头部 - 增加间距和样式 */}
          <Box className="mb-16">
            <Heading 
              size="8" 
              className="mb-8 leading-tight text-[--gray-12] font-bold tracking-tight"
            >
              {mockPost.title}
            </Heading>

            <Flex gap="4" align="center" className="text-[--gray-11]">
              <Avatar
                size="3"
                fallback={mockPost.authorName[0]}
                className="border-2 border-[--gray-a5]"
              />
              <Text size="2" weight="medium">{mockPost.authorName}</Text>
              <Text size="2">·</Text>
              <Flex align="center" gap="2">
                <CalendarIcon className="w-4 h-4" />
                <Text size="2">
                  {mockPost.publishedAt?.toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* 修改封面图片样式 */}
          {mockPost.coverImage && (
            <Box className="mb-16 rounded-xl overflow-hidden aspect-[2/1] shadow-lg">
              <img
                src={mockPost.coverImage}
                alt={mockPost.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </Box>
          )}

          {/* 文章内容 - 优化排版和间距 */}
          <Box className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => {
                  const text = children?.toString() || '';
                  return (
                    <h1 id={text.toLowerCase().replace(/\s+/g, '-')} className="!text-[--gray-12]">
                      {children}
                    </h1>
                  );
                },
                h2: ({ children }) => {
                  const text = children?.toString() || '';
                  return (
                    <h2 id={text.toLowerCase().replace(/\s+/g, '-')} className="!text-[--gray-12]">
                      {children}
                    </h2>
                  );
                },
                code: ({ inline, className, children }: MarkdownCodeProps) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const lang = match ? match[1] : '';
                  
                  return inline ? (
                    <code>
                      {children}
                    </code>
                  ) : (
                    <div className="group relative my-6">
                      {lang && (
                        <div className="absolute top-3 right-3 px-3 py-1 text-xs font-medium text-[--gray-11] bg-[--gray-3] border border-[--gray-a5] rounded-full">
                          {lang}
                        </div>
                      )}
                      <SyntaxHighlighter
                        language={lang || 'text'}
                        style={{
                          ...oneDark,
                          'pre[class*="language-"]': {
                            background: 'transparent',
                            margin: 0,
                            padding: 0,
                            border: 'none',
                            boxShadow: 'none',
                          },
                          'code[class*="language-"]': {
                            background: 'transparent',
                            textShadow: 'none',
                            border: 'none',
                            boxShadow: 'none',
                          },
                          ':not(pre) > code[class*="language-"]': {
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                          },
                          'pre[class*="language-"]::-moz-selection': {
                            background: 'transparent',
                          },
                          'pre[class*="language-"] ::-moz-selection': {
                            background: 'transparent',
                          },
                          'code[class*="language-"]::-moz-selection': {
                            background: 'transparent',
                          },
                          'code[class*="language-"] ::-moz-selection': {
                            background: 'transparent',
                          }
                        }}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          background: 'var(--gray-2)',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          border: '1px solid var(--gray-a5)',
                          borderRadius: '0.75rem',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
              } as Partial<Components>}
            >
              {mockPost.content}
            </ReactMarkdown>
          </Box>

          {/* 优化文章底部标签样式 */}
          <Flex gap="2" className="mt-16 pt-8 border-t border-[--gray-a5]">
            {mockPost.metaKeywords.split(',').map((tag) => (
              <Text
                key={tag}
                size="2"
                className="px-4 py-1.5 rounded-full bg-[--gray-3] border border-[--gray-a5] text-[--gray-11] hover:text-[--gray-12] hover:bg-[--gray-4] transition-all cursor-pointer"
              >
                {tag.trim()}
              </Text>
            ))}
          </Flex>
        </Box>

        {/* 右侧目录 - 优化样式 */}
        <Box className="w-72 hidden lg:block">
          <Box className="sticky top-24 p-6 rounded-xl border border-[--gray-a5] bg-[--gray-2]">
            <Text 
              size="2" 
              weight="medium" 
              className="mb-6 text-[--gray-12] flex items-center gap-2"
            >
              <CodeIcon className="w-4 h-4" />
              目录
            </Text>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <Box className="space-y-3 pr-4">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`
                      block text-sm leading-relaxed transition-all
                      ${item.level > 1 ? `ml-${(item.level - 1) * 4}` : ''}
                      ${activeId === item.id 
                        ? 'text-[--accent-11] font-medium translate-x-1' 
                        : 'text-[--gray-11] hover:text-[--gray-12]'
                      }
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </Box>
            </ScrollArea>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
}

// 使用模板包装组件
export default new Template({}, ({ http, args }) => {
  return <PostContent />;
});

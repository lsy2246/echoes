import { Template } from "interface/template";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
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
import { Post, Category, Tag, PostDisplay } from "interface/fields";
import { useMemo, useState, useEffect } from "react";
import type { Components } from 'react-markdown';
import type { MetaFunction } from "@remix-run/node";
import { getColorScheme, hashString } from "themes/echoes/utils/colorScheme";

// 示例文章数据
const mockPost: PostDisplay = {
  id: 1,
  title: "构建现代化的前端开发工作流",
  content: `
# 构建现代化的前端开发工作流

在现代前端开发中，一个高效的工作流程对于提高开发效率至关重要。本文将详细介绍如何建一个现代化的前端开发工作流。

## 工具链选择

选择合适的工具链工作流的第一我们需要考虑

- 包管理器：npm、yarn 或 pnpm
- 构建工具：Vite、webpack 或 Rollup
- 代码规范：ESLint、Prettier
- 类型检查：TypeScript

## 开发环境配置
### 开发环境配置

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


\`\`\`JavaScript
let a=1
\`\`\`

## 自动化流程

通过 GitHub Actions 等工具，我们可以实现：

- 自动化测试
- 自动化部署
- 代码质量检查
`,
  authorName: "张三",
  publishedAt: new Date("2024-03-15"),
  coverImage: "",
  metaKeywords: "前端开发,工作流,效率",
  metaDescription: "探讨如何构现代的前端开发工作流，提高开发效率。",
  status: "published",
  isEditor: true,
  createdAt: new Date("2024-03-15"),
  updatedAt: new Date("2024-03-15"),
  categories: [
    { name: "前端开发" }
  ],
  tags: [
    { name: "工程化" },
    { name: "效率提升" },
    { name: "开发工具" }
  ]
};

// 添加标题项接口
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 在 TocItem 接口旁添加
interface MarkdownCodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

// 添 meta 函数
export const meta: MetaFunction = () => {
  return [
    { title: mockPost.title },
    { name: "description", content: mockPost.metaDescription },
    { name: "keywords", content: mockPost.metaKeywords },
    // 添加 Open Graph 标签
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

// 添加接口定义
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  node?: any;
  level?: number;
  ordered?: boolean;
  children: React.ReactNode;
}

// 添加复制功能的接口
interface CopyButtonProps {
  code: string;
}

// 添加 CopyButton 组件
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
      {copied ? '已复制' : '复制'}
    </Button>
  );
};

// 创建一 React 组件
export default new Template({}, ({ http, args }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 解析文章内容生成目录
  useEffect(() => {
    const parseHeadings = (content: string) => {
      const lines = content.split('\n');
      const headings: TocItem[] = [];
      let counts = new Map<number, number>();
      
      lines.forEach((line) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          
          // 为每个级别维护计数
          const count = (counts.get(level) || 0) + 1;
          counts.set(level, count);
          
          // 生成唯一 ID
          const id = `heading-${level}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${count}`;
          headings.push({ id, text, level });
        }
      });
      
      return headings;
    };

    setToc(parseHeadings(mockPost.content));
  }, [mockPost.content]);

  // 监听滚动更新当前标题
  useEffect(() => {
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.5
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  return (
    <Container size="4" >
      <Flex className="relative" gap="8">
        {/* 文章主体 */}
        <Box className="flex-1">
          <Box className="p-0">
            {/* 章头部 */}
            <Box className="mb-8">
              <Heading 
                size="8" 
                className="mb-6 leading-tight text-[--gray-12] font-bold tracking-tight"
              >
                {mockPost.title}
              </Heading>

              <Flex gap="6" className="items-center text-[--gray-11] flex-wrap">
                {/* 作者名字 */}
                <Text size="2" weight="medium">
                  {mockPost.authorName}
                </Text>
                

                {/* 分隔符 */}
                <Box className="w-px h-4 bg-[--gray-6]" />

                {/* 发布日期 */}
                <Flex align="center" gap="2">
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
                            opacity: 0.8
                          }}
                        />
                        {tag.name}
                      </Text>
                    );
                  })}
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
            <Box className="max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children, node, ...props }: HeadingProps) => {
                    const text = children?.toString() || '';
                    const id = `heading-1-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-1`;
                    return (
                      <Heading
                        as="h1"
                        id={id}
                        className="text-3xl font-bold mt-12 mb-6 text-[--gray-12] scroll-mt-20"
                      >
                        {children}
                      </Heading>
                    );
                  },
                  h2: ({ children, node, ...props }: HeadingProps) => {
                    const text = children?.toString() || '';
                    const id = `heading-2-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-1`;
                    return (
                      <Heading
                        as="h2"
                        id={id}
                        className="text-2xl font-semibold mt-10 mb-4 text-[--gray-12] scroll-mt-20"
                      >
                        {children}
                      </Heading>
                    );
                  },
                  h3: ({ children, node, ...props }: HeadingProps) => {
                    const text = children?.toString() || '';
                    const id = `heading-3-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-1`;
                    return (
                      <Heading
                        as="h3"
                        id={id}
                        className="text-xl font-medium mt-8 mb-4 text-[--gray-12] scroll-mt-20"
                      >
                        {children}
                      </Heading>
                    );
                  },
                  code: ({ inline, className, children }: MarkdownCodeProps) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1].toLowerCase() : '';
                    
                    return inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-[--gray-3] text-[--gray-12] text-[0.9em]">
                        {children}
                      </code>
                    ) : (
                      <pre className="relative my-6 rounded-lg border border-[--gray-6] bg-[--gray-2]">
                        <div className="flex justify-between items-center absolute top-0 left-0 right-0 h-9 px-4 border-b border-[--gray-6]">
                          {/* 左侧语言类型 */}
                          <div className="text-xs text-[--gray-11]">
                            {lang || 'text'}
                          </div>
                          {/* 右侧复制按钮 */}
                          <CopyButton code={String(children)} />
                        </div>
                        <SyntaxHighlighter
                          language={lang || 'text'}
                          PreTag="div"
                          style={{
                            ...oneDark,
                            'pre[class*="language-"]': {
                              ...oneDark['pre[class*="language-"]'],
                              background: 'transparent',
                              margin: 0,
                              padding: 0,
                            },
                            'code[class*="language-"]': {
                              ...oneDark['code[class*="language-"]'],
                              background: 'transparent',
                              textShadow: 'none',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              fontWeight: '500',
                              opacity: '0.95',
                            }
                          }}
                          customStyle={{
                            margin: 0,
                            padding: '3rem 1.5rem 1.5rem',  // 增加顶部内边距，为头部工具栏留出空间
                            background: 'none',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            fontFeatureSettings: '"liga" 0',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </pre>
                    );
                  },
                  p: ({ children }) => (
                    <Text as="p" className="text-base leading-relaxed mb-6 text-[--gray-11]">
                      {children}
                    </Text>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-6 space-y-2 text-[--gray-11]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-6 space-y-2 text-[--gray-11]">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-base leading-relaxed">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[--gray-6] pl-4 py-1 my-6 text-[--gray-11] italic">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[--gray-12]">
                      {children}
                    </strong>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-[--accent-11] hover:text-[--accent-12] underline-offset-4 hover:underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                } as Partial<Components>}
              >
                {mockPost.content}
              </ReactMarkdown>
            </Box>
          </Box>
        </Box>

        {/* 右侧目录 */}
        <Box className="hidden lg:block w-36 relative">
          <Box className="sticky top-8">
            <Text 
              size="2" 
              weight="medium" 
              className="mb-4 text-[--gray-11] flex items-center gap-2 text-sm"
            >
              <CodeIcon className="w-3 h-3" />
              目录
            </Text>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <Box className="space-y-1.5">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`
                      block text-xs leading-relaxed transition-all
                      border-l-2 
                      ${item.level === 1 ? 'pl-3 border-[--gray-8]' : ''}
                      ${item.level === 2 ? 'pl-3 ml-4 border-[--gray-7]' : ''}
                      ${item.level === 3 ? 'pl-3 ml-8 border-[--gray-6]' : ''}
                      ${item.level >= 4 ? 'pl-3 ml-12 border-[--gray-5]' : ''}
                      ${activeId === item.id 
                        ? 'text-[--accent-11] font-medium border-[--accent-9]' 
                        : 'text-[--gray-11] hover:text-[--gray-12] hover:border-[--gray-8]'
                      }
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'center'
                        });
                        setActiveId(item.id);
                      }
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
})

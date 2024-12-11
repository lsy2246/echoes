import { Template } from "interface/template";
import { Container, Heading, Text, Flex, Card, Button, ScrollArea } from "@radix-ui/themes";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import {  PostDisplay } from "interface/fields";
import { useMemo } from "react";

import { ImageLoader } from "hooks/ParticleImage";
import { getColorScheme, hashString } from "themes/echoes/utils/colorScheme";

// 修改模拟文章列表数据
const mockArticles: PostDisplay[] = [
  {
    id: 1,
    title: "构建现代化的前端开发工作流",
    content: "在现代前端开发中，一个高效的工作流程对于提高开发效率至关重要...",
    authorName: "张三",
    publishedAt: new Date("2024-03-15"),
    coverImage: "https://www.helloimg.com/i/2024/12/11/6759312352499.png",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    taxonomies: {
      categories: [
        { name: "前端开发", slug: "frontend", type: "category" }
      ],
      tags: [
        { name: "工程化", slug: "engineering", type: "tag" },
        { name: "效率提升", slug: "efficiency", type: "tag" }
      ]
    }
  },
  {
    id: 2,
    title: "React 18 新特性详解",
    content: "React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理更新...",
    authorName: "李四",
    publishedAt: new Date("2024-03-14"),
    coverImage: "",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-14"),
    updatedAt: new Date("2024-03-14"),
    taxonomies: {
      categories: [
        { name: "前端开发", slug: "frontend", type: "category" }
      ],
      tags: [
        { name: "React", slug: "react", type: "tag" },
        { name: "JavaScript", slug: "javascript", type: "tag" }
      ]
    }
  },
  {
    id: 3,
    title: "JavaScript 性能优化技巧",
    content: "在这篇文章中，我们将探讨一些提高 JavaScript 性能的技巧和最佳实践...",
    authorName: "王五",
    publishedAt: new Date("2024-03-13"),
    coverImage: "ssssxx",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-13"),
    updatedAt: new Date("2024-03-13"),
    taxonomies: {
      categories: [
        { name: "性能优化", slug: "performance-optimization", type: "category" }
      ],
      tags: [
        { name: "JavaScript", slug: "javascript", type: "tag" },
        { name: "性能", slug: "performance", type: "tag" }
      ]
    }
  },
  {
    id: 4,
    title: "移动端适配最佳实践",
    content: "移动端开发中的各种适配问题及解决方案...",
    authorName: "田六",
    publishedAt: new Date("2024-03-13"),
    coverImage: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-13"),
    updatedAt: new Date("2024-03-13"),
    taxonomies: {
      categories: [
        { name: "移动开发", slug: "mobile-development", type: "category" }
      ],
      tags: [
        { name: "移动端", slug: "mobile", type: "tag" },
        { name: "响应式", slug: "responsive", type: "tag" }
      ]
    }
  },
  {
    id: 5,
    title: "全栈开发：从前端到云原生的完整指南",
    content: "本文将深入探讨现代全栈开发的各个方面，包括前端框架选择、后端架构设计、数据库优化、微服务部署以及云原生实践...",
    authorName: "赵七",
    publishedAt: new Date("2024-03-12"),
    coverImage: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-12"),
    updatedAt: new Date("2024-03-12"),
    taxonomies: {
      categories: [
        { name: "全栈开发", slug: "full-stack-development", type: "category" },
        { name: "云原生", slug: "cloud-native", type: "category" },
        { name: "微服务", slug: "microservices", type: "category" },
        { name: "DevOps", slug: "devops", type: "category" },
        { name: "系统架构", slug: "system-architecture", type: "category" }
      ],
      tags: [
        { name: "React", slug: "react", type: "tag" },
        { name: "Node.js", slug: "node-js", type: "tag" },
        { name: "Docker", slug: "docker", type: "tag" },
        { name: "Kubernetes", slug: "kubernetes", type: "tag" },
        { name: "MongoDB", slug: "mongodb", type: "tag" },
        { name: "微服务", slug: "microservices", type: "tag" },
        { name: "CI/CD", slug: "ci-cd", type: "tag" },
        { name: "云计算", slug: "cloud-computing", type: "tag" }
      ]
    }
  },
  {
    id: 6,
    title: "深入浅出 TypeScript 高级特性",
    content: "探索 TypeScript 的高级类型系统、装饰器、类型编程等特性，以及在大型项目中的最佳实践...",
    authorName: "孙八",
    publishedAt: new Date("2024-03-11"),
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&auto=format",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-11"),
    updatedAt: new Date("2024-03-11"),
    taxonomies: {
      categories: [
        { name: "TypeScript", slug: "typescript", type: "category" },
        { name: "编程语言", slug: "programming-languages", type: "category" }
      ],
      tags: [
        { name: "类型系统", slug: "type-system", type: "tag" },
        { name: "泛型编程", slug: "generic-programming", type: "tag" },
        { name: "装饰器", slug: "decorators", type: "tag" },
        { name: "类型推导", slug: "type-inference", type: "tag" }
      ]
    }
  },
  {
    id: 7,
    title: "Web 性能优化：从理论到实践",
    content: "全面解析 Web 性能优化策略，包括资源加载优化、渲染性能优化、网络优化等多个...",
    authorName: "周九",
    publishedAt: new Date("2024-03-10"),
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
    taxonomies: {
      categories: [
        { name: "性能优化", slug: "performance-optimization", type: "category" },
        { name: "前端开发", slug: "frontend-development", type: "category" }
      ],
      tags: [
        { name: "性能监控", slug: "performance-monitoring", type: "tag" },
        { name: "懒加载", slug: "lazy-loading", type: "tag" },
        { name: "缓存策略", slug: "caching-strategies", type: "tag" },
        { name: "代码分割", slug: "code-splitting", type: "tag" }
      ]
    }
  },
  {
    id: 8,
    title: "微前端架构实践指南",
    content: "详细介绍微前端的架构设计、实现方案、应用集成以及实际项目中的经验总结...",
    authorName: "吴十",
    publishedAt: new Date("2024-03-09"),
    coverImage: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500&auto=format",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-09"),
    updatedAt: new Date("2024-03-09"),
    taxonomies: {
      categories: [
        { name: "架构设计", slug: "architecture-design", type: "category" },
        { name: "微前端", slug: "micro-frontends", type: "category" }
      ],
      tags: [
        { name: "qiankun", slug: "qiankun", type: "tag" },
        { name: "single-spa", slug: "single-spa", type: "tag" },
        { name: "模块联邦", slug: "module-federation", type: "tag" },
        { name: "应用通信", slug: "application-communication", type: "tag" }
      ]
    }
  },
  {
    id: 9,
    title: "AI 驱动的前端开发：从概念到实践",
    content: "探索如何将人工智能技术融入前端开发流程，包括智能代码补全、自动化测试、UI 生成、性能优化建议等实践应用...",
    authorName: "陈十一",
    publishedAt: new Date("2024-03-08"),
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-08"),
    updatedAt: new Date("2024-03-08"),
    taxonomies: {
      categories: [
        { name: "人工智能", slug: "artificial-intelligence", type: "category" },
        { name: "前端开发", slug: "frontend-development", type: "category" }
      ],
      tags: [
        { name: "AI开发", slug: "ai-development", type: "tag" },
        { name: "智能化", slug: "intelligence", type: "tag" },
        { name: "自动化", slug: "automation", type: "tag" },
        { name: "开发效率", slug: "development-efficiency", type: "tag" }
      ]
    }
  }
];

export default new Template({}, ({ http, args }) => {
  const articleData = useMemo(() => mockArticles, []);
  const totalPages = 25; // 假设有25页
  const currentPage = 1; // 当前页码
  
  // 修改生成分页数组的函数，不再需要省略号
  const getPageNumbers = (total: number) => {
    return Array.from({ length: total }, (_, i) => i + 1);
  };

  // 修改分页部分的渲染
  const renderPageNumbers = () => {
    const pages = getPageNumbers(totalPages);
    
    return pages.map(page => (
      <div 
        key={page}
        className={`min-w-[32px] h-8 rounded-md transition-all duration-300 cursor-pointer
          flex items-center justify-center group/item whitespace-nowrap
          ${page === currentPage 
            ? 'bg-[--accent-9] text-[--text-primary]' 
            : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--accent-3]'
          }`}
      >
        <Text 
          size="1" 
          weight={page === currentPage ? "medium" : "regular"}
          className="group-hover/item:scale-110 transition-transform"
        >
          {page}
        </Text>
      </div>
    ));
  };

  return (
    <Container size="3" className="pt-2 pb-4 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0 mb-6 md:mb-8">
        {articleData.map((article) => (
          <Card
            key={article.id}
            className="group cursor-pointer hover-card border border-[--gray-a3]"
          >
            <div className="p-4 relative flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-[120px] h-[90px] flex-shrink-0">
                  <ImageLoader
                    src={article.coverImage}
                    alt={article.title || ""}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500 
                      relative z-[1] object-cover rounded-lg opacity-90 
                      group-hover:opacity-100"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Heading
                    size="2"
                    className="text-[--text-primary] group-hover:text-[--accent-9] 
                      transition-colors duration-200 line-clamp-2 mb-2"
                  >
                    {article.title}
                  </Heading>

                  <Text className="text-[--text-secondary] text-xs 
                    line-clamp-2 leading-relaxed">
                    {article.content}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <ScrollArea 
                    type="hover" 
                    scrollbars="horizontal" 
                    className="scroll-container flex-1"
                  >
                    <Flex gap="2" className="flex-nowrap">
                      {article.taxonomies?.categories.map((category) => (
                        <Text
                          key={category.name}
                          size="2"
                          className={`px-3 py-0.5 rounded-md font-medium transition-colors cursor-pointer
                            whitespace-nowrap
                            ${getColorScheme(category.name).bg} 
                            ${getColorScheme(category.name).text}
                            border ${getColorScheme(category.name).border}
                            ${getColorScheme(category.name).hover}`}
                        >
                          {category.name}
                        </Text>
                      ))}
                    </Flex>
                  </ScrollArea>

                  <Flex gap="2" align="center" className="text-[--text-tertiary] flex-shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                    <Text size="2">
                      {article.publishedAt?.toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    <span className="mx-1">·</span>
                    <Text size="2" weight="medium">
                      {article.authorName}
                    </Text>
                  </Flex>
                </div>

                <Flex gap="2" className="flex-wrap">
                  {article.taxonomies?.tags.map((tag) => (
                    <Text
                      key={tag.name}
                      size="1"
                      className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer
                        flex items-center gap-1.5
                        ${getColorScheme(tag.name).bg} ${getColorScheme(tag.name).text}
                        border ${getColorScheme(tag.name).border} ${getColorScheme(tag.name).hover}`}
                    >
                      <span 
                        className={`inline-block w-1 h-1 rounded-full ${getColorScheme(tag.name).dot}`}
                        style={{ 
                          flexShrink: 0,
                          opacity: 0.8
                        }}
                      />
                      {tag.name}
                    </Text>
                  ))}
                </Flex>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="px-4 md:px-0">
        <Flex 
          align="center" 
          justify="between" 
          className="max-w-[800px] mx-auto"
        >
          <Button 
            variant="ghost" 
            className="group/nav h-8 md:px-3 text-sm hidden md:flex"
            disabled={true}
          >
            <ChevronLeftIcon className="w-4 h-4 md:mr-1 text-[--text-tertiary] group-hover/nav:-translate-x-0.5 transition-transform" />
            <span className="hidden md:inline">上一页</span>
          </Button>

          <Button 
            variant="ghost" 
            className="group/nav w-8 h-8 md:hidden"
            disabled={true}
          >
            <ChevronLeftIcon className="w-4 h-4 text-[--text-tertiary]" />
          </Button>

          <Flex align="center" gap="2" className="flex-1 md:flex-none justify-center">
            <ScrollArea 
              type="hover" 
              scrollbars="horizontal" 
              className="w-[240px] md:w-[400px]"
            >
              <Flex gap="1" className="px-2">
                {renderPageNumbers()}
              </Flex>
            </ScrollArea>

            <Text size="1" className="text-[--text-tertiary] whitespace-nowrap hidden md:block">
              共 {totalPages} 页
            </Text>
          </Flex>

          <Button 
            variant="ghost" 
            className="group/nav h-8 md:px-3 text-sm hidden md:flex"
          >
            <span className="hidden md:inline">下一页</span>
            <ChevronRightIcon className="w-4 h-4 md:ml-1 text-[--text-tertiary] group-hover/nav:translate-x-0.5 transition-transform" />
          </Button>

          <Button 
            variant="ghost" 
            className="group/nav w-8 h-8 md:hidden"
          >
            <ChevronRightIcon className="w-4 h-4 text-[--text-tertiary]" />
          </Button>
        </Flex>
      </div>
    </Container>
  );
});

import { Template } from "interface/template";
import { Container, Heading, Text, Flex, Card, Button } from "@radix-ui/themes";
import {
  CalendarIcon,
  PersonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { Post } from "interface/post";
import { useMemo } from "react";

import { ImageLoader } from "hooks/ParticleImage";

// 模拟文章列表数据
const mockArticles: Post[] = [
  {
    id: 1,
    title: "构建现代化的前端开发工作流",
    content: "在现代前端开发中，一个高效的工作流程对于提高开发效率至关重要...",
    authorName: "张三",
    publishedAt: new Date("2024-03-15"),
    coverImage: "",
    metaKeywords: "",
    metaDescription: "",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: 2,
    title: "React 18 新特性详解",
    content:
      "React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理更新...",
    authorName: "李四",
    publishedAt: new Date("2024-03-14"),
    coverImage: "https://haowallpaper.com/link/common/file/previewFileIm",
    metaKeywords: "",
    metaDescription: "",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-14"),
    updatedAt: new Date("2024-03-14"),
  },
  {
    id: 3,
    title: "JavaScript 性能优化技巧",
    content:
      "在这篇文章中，我们将探讨一些提高 JavaScript 性能的技巧和最佳实践...",
    authorName: "王五",
    publishedAt: new Date("2024-03-13"),
    coverImage: "https://haowallpaper.com/link/common/file/previewFileImg/15789130517090624",
    metaKeywords: "",
    metaDescription: "",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-13"),
    updatedAt: new Date("2024-03-13"),
  },
  {
    id: 4,
    title: "JavaScript 性能优化技巧",
    content:
      "在这篇文章中，我们将探讨一些提高 JavaScript 性能的技巧和最佳实践...",
    authorName: "田六",
    publishedAt: new Date("2024-03-13"),
    coverImage: "https://avatars.githubusercontent.com/u/2?v=4",
    metaKeywords: "",
    metaDescription: "",
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-13"),
    updatedAt: new Date("2024-03-13"),
  },
  // 可以添加更多模拟文章
];

// 修改颜色组合数组，增加更多颜色选项
const colorSchemes = [
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-teal-100", text: "text-teal-600" },
  { bg: "bg-red-100", text: "text-red-600" },
  { bg: "bg-indigo-100", text: "text-indigo-600" },
  { bg: "bg-yellow-100", text: "text-yellow-600" },
  { bg: "bg-cyan-100", text: "text-cyan-600" },
];

const categories = ["前端开发", "后端开发", "UI设计", "移动开发", "人工智能"];
const tags = [
  "React",
  "TypeScript",
  "Vue",
  "Node.js",
  "Flutter",
  "Python",
  "Docker",
];

// 定义 SlideGeometry 类

export default new Template({}, ({ http, args }) => {
  const articleData = useMemo(() => {
    return mockArticles.map((article) => {
      // 使用更复杂的散列函数来生成看起来更随机的索引
      const hash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        return Math.abs(hash);
      };

      // 使用文章的不同属性来生成索引
      const categoryIndex =
        hash(article.title + article.id.toString()) % categories.length;
      const colorIndex =
        hash(article.authorName + article.id.toString()) % colorSchemes.length;

      // 为标签生成不同的索引
      const tagIndices = tags
        .map((_, index) => ({
          index,
          sort: hash(article.title + index.toString() + article.id.toString()),
        }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, 2)
        .map((item) => item.index);

      return {
        ...article,
        category: categories[categoryIndex],
        categoryColor: colorSchemes[colorIndex],
        tags: tagIndices.map((index) => ({
          name: tags[index],
          color:
            colorSchemes[
              hash(tags[index] + article.id.toString()) % colorSchemes.length
            ],
        })),
      };
    });
  }, []);

  return (
    <Container size="3" className="pt-2 pb-4 md:pb-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        {articleData.map((article) => (
          <Card
            key={article.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-[--gray-5] hover:border-[--accent-8] relative overflow-hidden"
          >
            <div className="p-4 relative flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-[120px] md:w-[140px] h-[120px] md:h-[140px]">
                  <ImageLoader
                    src={article.coverImage}
                    alt={article.title || ""}
                    className="group-hover:scale-105 transition-transform duration-500 relative z-[1] object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Heading
                    size="3"
                    className="group-hover:text-[--accent-9] transition-colors duration-200 line-clamp-2 text-base mb-2"
                  >
                    {article.title}
                  </Heading>

                  <Text className="text-[--gray-11] text-xs md:text-sm line-clamp-2 leading-relaxed">
                    {article.content}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Text
                    size="1"
                    className={`px-2 py-0.5 rounded-full font-medium ${article.categoryColor.bg} ${article.categoryColor.text}`}
                  >
                    {article.category}
                  </Text>

                  <Flex gap="2" align="center" className="text-[--gray-11]">
                    <CalendarIcon className="w-3 h-3" />
                    <Text size="1">
                      {article.publishedAt?.toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    <span className="mx-1">·</span>
                    <Text size="1" weight="medium">
                      {article.authorName}
                    </Text>
                  </Flex>
                </div>

                <Flex gap="2" className="flex-wrap">
                  {article.tags.map((tag) => (
                    <Text
                      key={tag.name}
                      size="1"
                      className={`px-2 py-0.5 rounded-full border border-current ${tag.color.text} hover:bg-[--gray-a3] transition-colors`}
                    >
                      {tag.name}
                    </Text>
                  ))}
                </Flex>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Flex justify="center" align="center" gap="2" className="mt-8">
        <Button variant="soft" className="group" disabled>
          <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          上一页
        </Button>

        <Flex gap="1">
          <Button
            variant="solid"
            className="bg-[--accent-9] text-white hover:bg-[--accent-10]"
          >
            1
          </Button>
          <Button variant="soft">2</Button>
          <Button variant="soft">3</Button>
          <div className="flex items-center px-2 text-[--gray-11]">...</div>
          <Button variant="soft">10</Button>
        </Flex>

        <Button variant="soft" className="group">
          下一页
          <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </Flex>
    </Container>
  );
});

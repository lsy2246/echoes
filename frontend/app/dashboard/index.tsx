import { Template } from "interface/template";
import { Container, Heading, Text, Box, Flex, Card } from "@radix-ui/themes";
import {
  BarChartIcon,
  ReaderIcon,
  ChatBubbleIcon,
  PersonIcon,
  EyeOpenIcon,
  HeartIcon,
  RocketIcon,
  LayersIcon,
} from "@radix-ui/react-icons";
import { useMemo } from "react";

// 模拟统计数据
const stats = [
  {
    label: "文章总数",
    value: "128",
    icon: <ReaderIcon className="w-5 h-5" />,
    trend: "+12%",
    color: "var(--accent-9)",
  },
  {
    label: "总访问量",
    value: "25,438",
    icon: <EyeOpenIcon className="w-5 h-5" />,
    trend: "+8.2%",
    color: "var(--green-9)",
  },
  {
    label: "评论数",
    value: "1,024",
    icon: <ChatBubbleIcon className="w-5 h-5" />,
    trend: "+5.4%",
    color: "var(--blue-9)",
  },
  {
    label: "用户互动",
    value: "3,842",
    icon: <HeartIcon className="w-5 h-5" />,
    trend: "+15.3%",
    color: "var(--pink-9)",
  },
];

// 模拟最近文章数据
const recentPosts = [
  {
    title: "构建现代化的前端开发工作流",
    views: 1234,
    comments: 23,
    likes: 89,
    status: "published",
  },
  {
    title: "React 18 新特性详解",
    views: 892,
    comments: 15,
    likes: 67,
    status: "published",
  },
  {
    title: "TypeScript 高级特性指南",
    views: 756,
    comments: 12,
    likes: 45,
    status: "draft",
  },
  {
    title: "前端性能优化实践",
    views: 645,
    comments: 8,
    likes: 34,
    status: "published",
  },
];

export default new Template({}, ({ http, args }) => {
  return (
    <Box>
      {/* 页面标题 */}
      <Heading size="6" className="mb-6 text-[--gray-12]">
        仪表盘
      </Heading>

      {/* 统计卡片 */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 hover-card border border-[--gray-6]">
            <Flex justify="between" align="center">
              <Box>
                <Text className="text-[--gray-11] mb-1" size="2">
                  {stat.label}
                </Text>
                <Heading size="6" className="text-[--gray-12]">
                  {stat.value}
                </Heading>
                <Text className="text-[--green-9]" size="2">
                  {stat.trend}
                </Text>
              </Box>
              <Box 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
              >
                <Box style={{ color: stat.color }}>
                  {stat.icon}
                </Box>
              </Box>
            </Flex>
          </Card>
        ))}
      </Box>

      {/* 最近文章列表 */}
      <Card className="w-full p-4 border border-[--gray-6] hover-card">
        <Heading size="3" className="mb-4 text-[--gray-12]">
          最近文章
        </Heading>
        <Box className="space-y-4">
          {recentPosts.map((post, index) => (
            <Box 
              key={index}
              className="p-3 rounded-lg border border-[--gray-6] hover:border-[--accent-9] transition-colors cursor-pointer"
            >
              <Flex justify="between" align="start" gap="3">
                <Box className="flex-1 min-w-0">
                  <Text className="text-[--gray-12] font-medium mb-2 truncate">
                    {post.title}
                  </Text>
                  <Flex gap="3">
                    <Flex align="center" gap="1">
                      <EyeOpenIcon className="w-3 h-3 text-[--gray-11]" />
                      <Text size="1" className="text-[--gray-11]">
                        {post.views}
                      </Text>
                    </Flex>
                    <Flex align="center" gap="1">
                      <ChatBubbleIcon className="w-3 h-3 text-[--gray-11]" />
                      <Text size="1" className="text-[--gray-11]">
                        {post.comments}
                      </Text>
                    </Flex>
                    <Flex align="center" gap="1">
                      <HeartIcon className="w-3 h-3 text-[--gray-11]" />
                      <Text size="1" className="text-[--gray-11]">
                        {post.likes}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
                <Box 
                  className={`px-2 py-1 rounded-full text-xs
                    ${post.status === 'published' 
                      ? 'bg-[--green-3] text-[--green-11]' 
                      : 'bg-[--gray-3] text-[--gray-11]'
                    }`}
                >
                  {post.status === 'published' ? '已发布' : '草稿'}
                </Box>
              </Flex>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}); 
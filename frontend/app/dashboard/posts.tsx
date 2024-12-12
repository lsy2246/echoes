import { Template } from "interface/template";
import {
  Container,
  Heading,
  Text,
  Box,
  Flex,
  Table,
  Button,
  TextField,
  DropdownMenu,
  ScrollArea,
  DataList,
  Badge,
} from "@radix-ui/themes";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  EyeOpenIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import type { PostDisplay } from "interface/fields";

// 模拟文章数据
const mockPosts: PostDisplay[] = [
  {
    id: 1,
    title: "构建现代化的前端开发工作流",
    content: "在现代前端开发中...",
    authorName: "张三",
    publishedAt: new Date("2024-03-15"),
    status: "published",
    isEditor: false,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    metaKeywords: "",
    metaDescription: "",
    categories: [{ name: "前端开发" }],
    tags: [{ name: "工程化" }, { name: "效率提升" }],
  },
  // ... 可以添加更多模拟数据
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  return (
    <Box>
      {/* 页面标题和操作栏 */}
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="6" className="text-[--gray-12]">
          文章管理
        </Heading>
        <Button className="bg-[--accent-9]">
          <PlusIcon className="w-4 h-4" />
          新建文章
        </Button>
      </Flex>

      {/* 搜索和筛选栏 */}
      <Flex
        gap="4"
        className="mb-6 flex-col sm:flex-row" // 移动端垂直布局，桌面端水平布局
      >
        <Box className="w-full sm:w-64">
          <TextField.Root
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          >
            <TextField.Slot side="right">
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="surface">
              状态: {selectedStatus === "all" ? "全部" : selectedStatus}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onClick={() => setSelectedStatus("all")}>
              全部
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedStatus("published")}>
              已发布
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedStatus("draft")}>
              草稿
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* 文章列表 */}
      <Box className="border border-[--gray-6] rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          {/* 桌面端表格视图 */}
          <div className="hidden sm:block">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>标题</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>作者</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>分类</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>状态</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>发布时间</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {mockPosts.map((post) => (
                  <Table.Row
                    key={post.id}
                    className="hover:bg-[--gray-3] block sm:table-row mb-4 sm:mb-0"
                  >
                    <Table.Cell className="font-medium block sm:table-cell py-2 sm:py-3 before:content-['标题：'] before:inline-block before:w-20 before:font-normal sm:before:content-none">
                      {post.title}
                    </Table.Cell>
                    <Table.Cell className="block sm:table-cell py-2 sm:py-3 before:content-['作者：'] before:inline-block before:w-20 before:font-normal sm:before:content-none">
                      {post.authorName}
                    </Table.Cell>
                    <Table.Cell className="block sm:table-cell py-2 sm:py-3 before:content-['分类：'] before:inline-block before:w-20 before:font-normal sm:before:content-none">
                      <Flex gap="2" className="inline-flex">
                        {post.categories?.map((category) => (
                          <Text
                            key={category.name}
                            size="1"
                            className="px-2 py-0.5 bg-[--gray-4] rounded"
                          >
                            {category.name}
                          </Text>
                        ))}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell className="block sm:table-cell py-2 sm:py-3 before:content-['状态：'] before:inline-block before:w-20 before:font-normal sm:before:content-none">
                      <Flex gap="2">
                        {post.status === "published" ? (
                          <Badge color="green">已发布</Badge>
                        ) : (
                          <Badge color="orange">草稿</Badge>
                        )}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell className="block sm:table-cell py-2 sm:py-3 before:content-['发布时间：'] before:inline-block before:w-20 before:font-normal sm:before:content-none">
                      {post.publishedAt?.toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="block sm:table-cell py-2 sm:py-3 border-b sm:border-b-0 before:content-['操作：'] before:inline-block before:w-20 before:font-normal sm:before:content-none">
                      <Flex gap="2">
                        <Button variant="ghost" size="1">
                          <Pencil1Icon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="1">
                          <EyeOpenIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="1" color="red">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          {/* 移动端列表视图 */}
          <div className="block sm:hidden">
            {mockPosts.map((post) => (
              <DataList.Root
                key={post.id}
                className="p-4 border-b border-[--gray-6] last:border-b-0"
              >
                <DataList.Item>
                  <DataList.Label minWidth="88px">标题</DataList.Label>
                  <DataList.Value>
                    <Text weight="medium">{post.title}</Text>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">作者</DataList.Label>
                  <DataList.Value>{post.authorName}</DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">分类</DataList.Label>
                  <DataList.Value>
                    <Flex gap="2">
                      {post.categories?.map((category) => (
                        <Text
                          key={category.name}
                          size="1"
                          className="px-2 py-0.5 bg-[--gray-4] rounded"
                        >
                          {category.name}
                        </Text>
                      ))}
                    </Flex>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">状态</DataList.Label>
                  <DataList.Value>
                    <Flex gap="2">
                      {post.status === "published" ? (
                        <Badge color="green">已发布</Badge>
                      ) : (
                        <Badge color="orange">草稿</Badge>
                      )}
                    </Flex>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">发布时间</DataList.Label>
                  <DataList.Value>
                    {post.publishedAt?.toLocaleDateString()}
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">操作</DataList.Label>
                  <DataList.Value>
                    <Flex gap="2">
                      <Button variant="ghost" size="1">
                        <Pencil1Icon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="1">
                        <EyeOpenIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="1" color="red">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </DataList.Value>
                </DataList.Item>
              </DataList.Root>
            ))}
          </div>
        </ScrollArea>
      </Box>
    </Box>
  );
});

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
  Avatar,
  Badge
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  CheckIcon,
  Cross2Icon,
  ChatBubbleIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";

// 模拟评论数据
const mockComments = [
  {
    id: 1,
    content: "这篇文章写得很好，对我帮助很大！",
    author: "张三",
    postTitle: "构建现代化的前端开发工作流",
    createdAt: new Date("2024-03-15"),
    status: "pending", // pending, approved, rejected
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
  },
  {
    id: 2,
    content: "文章内容很专业，讲解得很清楚。",
    author: "李四",
    postTitle: "React 18 新特性详解",
    createdAt: new Date("2024-03-14"),
    status: "approved",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
  },
  // 可以添加更多模拟数据
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'approved':
        return 'bg-[--green-3] text-[--green-11]';
      case 'rejected':
        return 'bg-[--red-3] text-[--red-11]';
      default:
        return 'bg-[--yellow-3] text-[--yellow-11]';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return '待审核';
    }
  };

  return (
    <Box>
      {/* 页面标题和统计 */}
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="6" className="text-[--gray-12] mb-2">
            评论管理
          </Heading>
          <Text className="text-[--gray-11]">
            共 {mockComments.length} 条评论
          </Text>
        </Box>
      </Flex>

      {/* 搜索和筛选栏 */}
      <Flex 
        gap="4" 
        className="mb-6 flex-col sm:flex-row"
      >
        <Box className="w-full sm:w-64">
          <TextField.Root 
            placeholder="搜索评论..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="surface">
              状态: {selectedStatus === 'all' ? '全部' : selectedStatus}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onClick={() => setSelectedStatus('all')}>
              全部
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedStatus('pending')}>
              待审核
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedStatus('approved')}>
              已通过
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedStatus('rejected')}>
              已拒绝
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* 评论列表 */}
      <Box className="border border-[--gray-6] rounded-lg overflow-hidden">
        <ScrollArea>
          {/* 桌面端表格视图 */}
          <div className="hidden sm:block">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>评论者</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>评论内容</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>文章</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>状态</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>时间</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {mockComments.map((comment) => (
                  <Table.Row key={comment.id}>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        <Avatar
                          src={comment.avatar}
                          fallback="U"
                          size="2"
                          radius="full"
                        />
                        <Text>{comment.author}</Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="line-clamp-2">
                        {comment.content}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="line-clamp-1">
                        {comment.postTitle}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        {comment.status === 'approved' && <Badge color="green">已通过</Badge>}
                        {comment.status === 'pending' && <Badge color="orange">待审核</Badge>}
                        {comment.status === 'rejected' && <Badge color="red">已拒绝</Badge>}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      {comment.createdAt.toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button 
                          variant="ghost" 
                          size="1"
                          className="text-[--green-11] hover:text-[--green-12]"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="1"
                          className="text-[--red-11] hover:text-[--red-12]"
                        >
                          <Cross2Icon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="1"
                          color="red"
                        >
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
            {mockComments.map((comment) => (
              <DataList.Root key={comment.id} className="p-4 border-b border-[--gray-6] last:border-b-0">
                <DataList.Item>
                  <DataList.Label minWidth="88px">评论者</DataList.Label>
                  <DataList.Value>
                    <Flex align="center" gap="2">
                      <Avatar
                        src={comment.avatar}
                        fallback="U"
                        size="2"
                        radius="full"
                      />
                      <Text>{comment.author}</Text>
                    </Flex>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">评论内容</DataList.Label>
                  <DataList.Value>
                    <Text className="line-clamp-3">{comment.content}</Text>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">文章</DataList.Label>
                  <DataList.Value>
                    <Text className="line-clamp-1">{comment.postTitle}</Text>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">状态</DataList.Label>
                  <DataList.Value>
                    <Flex gap="2">
                      {comment.status === 'approved' && <Badge color="green">已通过</Badge>}
                      {comment.status === 'pending' && <Badge color="orange">待审核</Badge>}
                      {comment.status === 'rejected' && <Badge color="red">已拒绝</Badge>}
                    </Flex>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">时间</DataList.Label>
                  <DataList.Value>
                    {comment.createdAt.toLocaleDateString()}
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">操作</DataList.Label>
                  <DataList.Value>
                    <Flex gap="2">
                      <Button 
                        variant="ghost" 
                        size="1"
                        className="text-[--green-11] hover:text-[--green-12]"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="1"
                        className="text-[--red-11] hover:text-[--red-12]"
                      >
                        <Cross2Icon className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="1"
                        color="red"
                      >
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
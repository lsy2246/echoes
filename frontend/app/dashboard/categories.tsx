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
  ScrollArea,
  Dialog,
  IconButton
} from "@radix-ui/themes";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  TrashIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import type { Category } from "interface/fields";

// 模拟分类数据
const mockCategories: (Category & { id: number; count: number })[] = [
  {
    id: 1,
    name: "前端开发",
    parentId: undefined,
    count: 15
  },
  {
    id: 2,
    name: "React",
    parentId: "1",
    count: 8
  },
  {
    id: 3,
    name: "Vue",
    parentId: "1",
    count: 5
  },
  {
    id: 4,
    name: "后端开发",
    parentId: undefined,
    count: 12
  },
  {
    id: 5,
    name: "Node.js",
    parentId: "4",
    count: 6
  }
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();

  return (
    <Box>
      {/* 页面标题和操作栏 */}
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="6" className="text-[--gray-12] mb-2">
            分类管理
          </Heading>
          <Text className="text-[--gray-11]">
            共 {mockCategories.length} 个分类
          </Text>
        </Box>
        <Button 
          className="bg-[--accent-9]"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          新建分类
        </Button>
      </Flex>

      {/* 搜索栏 */}
      <Box className="w-full sm:w-64 mb-6">
        <TextField.Root 
          placeholder="搜索分类..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      {/* 分类列表 */}
      <Box className="border border-[--gray-6] rounded-lg overflow-hidden">
        <ScrollArea>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>分类名称</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>文章数量</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>父分类</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {mockCategories.map((category) => (
                <Table.Row key={category.id}>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      {category.parentId && (
                        <ChevronRightIcon className="w-4 h-4 text-[--gray-11]" />
                      )}
                      <Text>{category.name}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{category.count} 篇</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>
                      {category.parentId 
                        ? mockCategories.find(c => c.id.toString() === category.parentId)?.name 
                        : '-'
                      }
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button variant="ghost" size="1">
                        <Pencil1Icon className="w-4 h-4" />
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
        </ScrollArea>
      </Box>

      {/* 新建分类对话框 */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>新建分类</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            创建一个新的文章分类
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" mb="1" weight="bold">
                分类名称
              </Text>
              <TextField.Root
                placeholder="输入分类名称"
                value={newCategoryName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
              />
            </Box>

            <Box>
              <Text as="label" size="2" mb="1" weight="bold">
                父分类
              </Text>
              <select
                className="w-full h-9 px-3 rounded-md bg-[--gray-1] border border-[--gray-6] text-[--gray-12]"
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                <option value="">无</option>
                {mockCategories
                  .filter(c => !c.parentId)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                取消
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button className="bg-[--accent-9]">
                创建
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}); 
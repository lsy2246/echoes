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
  Dialog,
  DataList,
} from "@radix-ui/themes";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FileIcon,
  TrashIcon,
  DownloadIcon,
  DotsHorizontalIcon,
  FileTextIcon,
  ImageIcon,
  VideoIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import type { Resource } from "interface/fields";

// 模拟文件数据
const mockFiles: Resource[] = [
  {
    id: 1,
    authorId: "1",
    name: "前端开发规范.pdf",
    sizeBytes: 1024 * 1024 * 2, // 2MB
    storagePath: "/files/frontend-guide.pdf",
    fileType: "application/pdf",
    category: "documents",
    description: "前端开发规范文档",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: 2,
    authorId: "1",
    name: "项目架构图.png",
    sizeBytes: 1024 * 512, // 512KB
    storagePath: "/files/architecture.png",
    fileType: "image/png",
    category: "images",
    description: "项目整体架构示意图",
    createdAt: new Date("2024-03-14"),
  },
  {
    id: 3,
    authorId: "1",
    name: "API文档.md",
    sizeBytes: 1024 * 256, // 256KB
    storagePath: "/files/api-doc.md",
    fileType: "text/markdown",
    category: "documents",
    description: "API接口文档",
    createdAt: new Date("2024-03-13"),
  },
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (fileType.startsWith("video/")) return <VideoIcon className="w-4 h-4" />;
    if (fileType.startsWith("text/"))
      return <FileTextIcon className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  return (
    <Box>
      {/* 页面标题和操作栏 */}
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="6" className="text-[--gray-12] mb-2">
            文件管理
          </Heading>
          <Text className="text-[--gray-11]">共 {mockFiles.length} 个文件</Text>
        </Box>
        <Button
          className="bg-[--accent-9]"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          上传文件
        </Button>
      </Flex>

      {/* 搜索和筛选栏 */}
      <Flex gap="4" className="mb-6 flex-col sm:flex-row">
        <Box className="w-full sm:w-64">
          <TextField.Root
            placeholder="搜索文件..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="surface">
              类型: {selectedType === "all" ? "全部" : selectedType}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onClick={() => setSelectedType("all")}>
              全部
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedType("documents")}>
              文档
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedType("images")}>
              图片
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => setSelectedType("others")}>
              其他
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* 文件列表 */}
      <Box className="border border-[--gray-6] rounded-lg overflow-hidden">
        <ScrollArea>
          {/* 桌面端表格视图 */}
          <div className="hidden sm:block">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>文件名</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>大小</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>类型</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>上传时间</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {mockFiles.map((file) => (
                  <Table.Row key={file.id}>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        {getFileIcon(file.fileType)}
                        <Text className="font-medium">{file.name}</Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>{formatFileSize(file.sizeBytes)}</Table.Cell>
                    <Table.Cell>
                      <Text className="text-[--gray-11]">
                        {file.fileType.split("/")[1].toUpperCase()}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      {file.createdAt.toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button variant="ghost" size="1">
                          <DownloadIcon className="w-4 h-4" />
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
            {mockFiles.map((file) => (
              <DataList.Root
                key={file.id}
                className="p-4 border-b border-[--gray-6] last:border-b-0"
              >
                <DataList.Item>
                  <DataList.Label minWidth="88px">文件名</DataList.Label>
                  <DataList.Value>
                    <Flex align="center" gap="2">
                      {getFileIcon(file.fileType)}
                      <Text className="font-medium">{file.name}</Text>
                    </Flex>
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">大小</DataList.Label>
                  <DataList.Value>
                    {formatFileSize(file.sizeBytes)}
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">类型</DataList.Label>
                  <DataList.Value>
                    {file.fileType.split("/")[1].toUpperCase()}
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">上传时间</DataList.Label>
                  <DataList.Value>
                    {file.createdAt.toLocaleDateString()}
                  </DataList.Value>
                </DataList.Item>

                <DataList.Item>
                  <DataList.Label minWidth="88px">操作</DataList.Label>
                  <DataList.Value>
                    <Flex gap="2">
                      <Button variant="ghost" size="1">
                        <DownloadIcon className="w-4 h-4" />
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

      {/* 上传对话框 */}
      <Dialog.Root
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      >
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>上传文件</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            选择要上传的文件
          </Dialog.Description>

          <Box className="border-2 border-dashed border-[--gray-6] rounded-lg p-8 text-center">
            <input
              type="file"
              className="hidden"
              id="file-upload"
              multiple
              onChange={(e) => {
                // 处理文件上传
                console.log(e.target.files);
              }}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileIcon className="w-12 h-12 mx-auto mb-4 text-[--gray-9]" />
              <Text className="text-[--gray-11] mb-2">
                拖拽文件到此处或点击上传
              </Text>
              <Text size="1" className="text-[--gray-10]">
                支持所有常见文件格式
              </Text>
            </label>
          </Box>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                取消
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button className="bg-[--accent-9]">开始上传</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
});

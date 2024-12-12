import { Template } from "interface/template";
import {
  Container,
  Heading,
  Text,
  Box,
  Flex,
  Card,
  Button,
  TextField,
  DropdownMenu,
  ScrollArea,
  Dialog,
  Tabs,
  Switch,
  IconButton,
} from "@radix-ui/themes";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  GearIcon,
  CodeIcon,
  Cross2Icon,
  CheckIcon,
  UpdateIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import type { PluginConfig } from "interface/plugin";

// 模拟插件数据
const mockPlugins: (PluginConfig & {
  id: number;
  preview?: string;
  installed?: boolean;
})[] = [
  {
    id: 1,
    name: "comment-system",
    displayName: "评论系统",
    version: "1.0.0",
    description: "支持多种评论系统集成，包括Disqus、Gitalk等",
    author: "Admin",
    enabled: true,
    icon: "https://api.iconify.design/material-symbols:comment.svg",
    preview:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&auto=format",
    managePath: "/dashboard/plugins/comment-system",
    installed: true,
    configuration: {
      system: {
        title: "评论系统配置",
        description: "配置评论系统参数",
        data: {
          provider: "gitalk",
          clientId: "",
          clientSecret: "",
        },
      },
    },
    routes: new Set(),
  },
  {
    id: 2,
    name: "image-optimization",
    displayName: "图片优化",
    version: "1.0.0",
    description: "自动优化上传的图片，支持压缩、裁剪、水印等功能",
    author: "ThirdParty",
    enabled: false,
    icon: "https://api.iconify.design/material-symbols:image.svg",
    preview:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&auto=format",
    installed: true,
    configuration: {
      system: {
        title: "图片优化配置",
        description: "配置图片优化参数",
        data: {
          quality: 80,
          maxWidth: 1920,
          watermark: false,
        },
      },
    },
    routes: new Set(),
  },
];

// 模拟市场插件数据
interface MarketPlugin {
  id: number;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: string;
  preview?: string;
  downloads: number;
  rating: number;
}

const marketPlugins: MarketPlugin[] = [
  {
    id: 4,
    name: "image-optimization",
    displayName: "图片优化",
    version: "1.0.0",
    description: "自动优化上传的图片，支持压缩、裁剪、水印等功能",
    author: "ThirdParty",
    preview:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&auto=format",
    downloads: 1200,
    rating: 4.5,
  },
  {
    id: 5,
    name: "markdown-plus",
    displayName: "Markdown增强",
    version: "2.0.0",
    description: "增强的Markdown编辑器，支持更多扩展语法和实时预览",
    author: "ThirdParty",
    preview:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format",
    downloads: 3500,
    rating: 4.8,
  },
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<
    (typeof mockPlugins)[0] | null
  >(null);

  // 处理插件启用/禁用
  const handleTogglePlugin = (pluginId: number) => {
    // 这里添加启用/禁用插件的逻辑
    console.log("Toggle plugin:", pluginId);
  };

  return (
    <Box>
      {/* 页面标题和操作栏 */}
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="6" className="text-[--gray-12] mb-2">
            插件管理
          </Heading>
          <Text className="text-[--gray-11]">
            共 {mockPlugins.length} 个插件
          </Text>
        </Box>
        <Button
          className="bg-[--accent-9]"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          安装插件
        </Button>
      </Flex>

      {/* 搜索栏 */}
      <Box className="w-full sm:w-64 mb-6">
        <TextField.Root
          placeholder="搜索插件..."
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

      {/* 插件列表 */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPlugins.map((plugin) => (
          <Card
            key={plugin.id}
            className="p-4 border border-[--gray-6] hover-card"
          >
            {/* 插件预览图 */}
            {plugin.preview && (
              <Box className="aspect-video mb-4 rounded-lg overflow-hidden bg-[--gray-3]">
                <img
                  src={plugin.preview}
                  alt={plugin.displayName}
                  className="w-full h-full object-cover"
                />
              </Box>
            )}

            {/* 插件信息 */}
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Heading size="3">{plugin.displayName}</Heading>
                <Switch
                  checked={plugin.enabled}
                  onCheckedChange={() => handleTogglePlugin(plugin.id)}
                />
              </Flex>

              <Text size="1" className="text-[--gray-11]">
                版本 {plugin.version} · 作者 {plugin.author}
              </Text>

              <Text size="2" className="text-[--gray-11] line-clamp-2">
                {plugin.description}
              </Text>

              {/* 操作按钮 */}
              <Flex gap="2" mt="2">
                {plugin.managePath && plugin.enabled && (
                  <Button
                    variant="soft"
                    className="flex-1"
                    onClick={() => {
                      if (plugin.managePath) {
                        window.location.href = plugin.managePath;
                      }
                    }}
                  >
                    <GearIcon className="w-4 h-4" />
                    配置
                  </Button>
                )}
                <Button variant="soft" color="red" className="flex-1">
                  <TrashIcon className="w-4 h-4" />
                  卸载
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Box>

      {/* 安装插件对话框 */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>安装插件</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            上传插件包进行安装
          </Dialog.Description>

          <Box className="mt-4">
            <Box className="border-2 border-dashed border-[--gray-6] rounded-lg p-8 text-center">
              <input
                type="file"
                className="hidden"
                id="plugin-upload"
                accept=".zip"
                onChange={(e) => {
                  console.log(e.target.files);
                }}
              />
              <label htmlFor="plugin-upload" className="cursor-pointer">
                <CodeIcon className="w-12 h-12 mx-auto mb-4 text-[--gray-9]" />
                <Text className="text-[--gray-11] mb-2">
                  点击上传插件包或拖拽到此处
                </Text>
                <Text size="1" className="text-[--gray-10]">
                  支持 .zip 格式的插件包
                </Text>
              </label>
            </Box>
          </Box>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                取消
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button className="bg-[--accent-9]">开始安装</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
});

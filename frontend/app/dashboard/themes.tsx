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
  ScrollArea,
  Dialog,
  Tabs,
} from "@radix-ui/themes";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CodeIcon,
  CheckIcon,
  Cross2Icon,
  DownloadIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import type { ThemeConfig } from "interface/theme";

// 模拟主题数据
const mockThemes: (ThemeConfig & { id: number; preview: string; active: boolean })[] = [
  {
    id: 1,
    name: "echoes",
    displayName: "Echoes",
    version: "1.0.0",
    description: "默认主题",
    author: "Admin",
    preview: "https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=500&auto=format",
    templates: new Map(),
    configuration: {
      theme: {
        title: "主题配置",
        description: "Echoes主题配置项",
        data: {
          colors: {
            mode: "light",
            layout: "default"
          }
        }
      }
    },
    routes: new Map(),
    active: true
  },
  {
    id: 2,
    name: "minimal",
    displayName: "Minimal",
    version: "1.0.0", 
    description: "简约风格主题",
    author: "Admin",
    preview: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&auto=format",
    templates: new Map(),
    configuration: {
        theme: {
            title: "主题配置",
            description: "Echoes主题配置项",
            data: {
              colors: {
                mode: "light",
                layout: "default"
              }
            }
          }
    },
    routes: new Map(),
    active: false
  }
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<typeof mockThemes[0] | null>(null);

  return (
    <Box>
      {/* 页面标题和操作栏 */}
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="6" className="text-[--gray-12] mb-2">
            主题管理
          </Heading>
          <Text className="text-[--gray-11]">
            共 {mockThemes.length} 个主题
          </Text>
        </Box>
        <Button 
          className="bg-[--accent-9]"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          安装主题
        </Button>
      </Flex>

      {/* 搜索栏 */}
      <Box className="w-full sm:w-64 mb-6">
        <TextField.Root placeholder="搜索主题...">
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      {/* 主题列表 */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockThemes.map((theme) => (
          <Card key={theme.id} className="p-4 border border-[--gray-6] hover-card">
            {/* 预览图 */}
            <Box className="aspect-video mb-4 rounded-lg overflow-hidden bg-[--gray-3]">
              <img 
                src={theme.preview} 
                alt={theme.displayName}
                className="w-full h-full object-cover"
              />
            </Box>

            {/* 主题信息 */}
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Heading size="3">{theme.displayName}</Heading>
                {theme.active && (
                  <Text size="1" className="px-2 py-1 bg-[--accent-3] text-[--accent-9] rounded">
                    当前使用
                  </Text>
                )}
              </Flex>

              <Text size="1" className="text-[--gray-11]">
                版本 {theme.version} · 作者 {theme.author}
              </Text>

              <Text size="2" className="text-[--gray-11] line-clamp-2">
                {theme.description}
              </Text>

              {/* 操作按钮 */}
              <Flex gap="2" mt="2">
                {theme.active ? (
                  <Button 
                    variant="soft" 
                    className="flex-1"
                    onClick={() => window.location.href = `/dashboard/themes/${theme.name}/settings`}
                  >
                    <GearIcon className="w-4 h-4" />
                    配置
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="flex-1 bg-[--accent-9]"
                    >
                      <CheckIcon className="w-4 h-4" />
                      启用
                    </Button>
                    <Button 
                      variant="soft" 
                      color="red" 
                      className="flex-1"
                      onClick={() => {
                        // 这里添加卸载主题的处理逻辑
                        console.log('卸载主题:', theme.name);
                      }}
                    >
                      <Cross2Icon className="w-4 h-4" />
                      卸载
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
          </Card>
        ))}
      </Box>

      {/* 安装主题对话框 */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>安装主题</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            请上传主题包进行安装
          </Dialog.Description>

          <Box className="mt-4">
            <Box className="border-2 border-dashed border-[--gray-6] rounded-lg p-8 text-center">
              <input
                type="file"
                className="hidden"
                id="theme-upload"
                accept=".zip"
                onChange={(e) => {
                  console.log(e.target.files);
                }}
              />
              <label 
                htmlFor="theme-upload"
                className="cursor-pointer"
              >
                <CodeIcon className="w-12 h-12 mx-auto mb-4 text-[--gray-9]" />
                <Text className="text-[--gray-11] mb-2">
                  点击上传主题包或拖拽到此处
                </Text>
                <Text size="1" className="text-[--gray-10]">
                  支持 .zip 格式的主题包
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
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}); 
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
  Switch,
  Tabs,
  TextArea
} from "@radix-ui/themes";
import {
  GearIcon,
  PersonIcon,
  LockClosedIcon,
  BellIcon,
  GlobeIcon
} from "@radix-ui/react-icons";
import { useState } from "react";

export default new Template({}, ({ http, args }) => {
  const [siteName, setSiteName] = useState("我的博客");
  const [siteDescription, setSiteDescription] = useState("一个优雅的博客系统");
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <Box>
      <Heading size="6" className="text-[--gray-12] mb-6">
        系统设置
      </Heading>

      <Tabs.Root defaultValue="general">
        <Tabs.List>
          <Tabs.Trigger value="general">
            <GearIcon className="w-4 h-4 mr-2" />
            常规设置
          </Tabs.Trigger>
          <Tabs.Trigger value="profile">
            <PersonIcon className="w-4 h-4 mr-2" />
            个人资料
          </Tabs.Trigger>
          <Tabs.Trigger value="security">
            <LockClosedIcon className="w-4 h-4 mr-2" />
            安全设置
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications">
            <BellIcon className="w-4 h-4 mr-2" />
            通知设置
          </Tabs.Trigger>
        </Tabs.List>

        {/* 常规设置 */}
        <Tabs.Content value="general">
          <Card className="mt-6 p-6 border border-[--gray-6]">
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  站点名称
                </Text>
                <TextField.Root
                  value={siteName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSiteName(e.target.value)}
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  站点描述
                </Text>
                <TextArea
                  value={siteDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSiteDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  站点语言
                </Text>
                <select 
                  className="w-full h-9 px-3 rounded-md bg-[--gray-1] border border-[--gray-6] text-[--gray-12]"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  时区设置
                </Text>
                <select 
                  className="w-full h-9 px-3 rounded-md bg-[--gray-1] border border-[--gray-6] text-[--gray-12]"
                >
                  <option value="UTC+8">UTC+8 北京时间</option>
                  <option value="UTC+0">UTC+0 格林威治时间</option>
                </select>
              </Box>
            </Flex>
          </Card>
        </Tabs.Content>

        {/* 个人资料 */}
        <Tabs.Content value="profile">
          <Card className="mt-6 p-6 border border-[--gray-6]">
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  头像
                </Text>
                <Flex align="center" gap="4">
                  <Box className="w-20 h-20 rounded-full bg-[--gray-3] flex items-center justify-center">
                    <PersonIcon className="w-8 h-8 text-[--gray-9]" />
                  </Box>
                  <Button variant="soft">更换头像</Button>
                </Flex>
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  用户名
                </Text>
                <TextField.Root defaultValue="admin" />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  邮箱
                </Text>
                <TextField.Root defaultValue="admin@example.com" />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  个人简介
                </Text>
                <TextArea
                  placeholder="介绍一下自己..."
                  className="min-h-[100px]"
                />
              </Box>
            </Flex>
          </Card>
        </Tabs.Content>

        {/* 安全设置 */}
        <Tabs.Content value="security">
          <Card className="mt-6 p-6 border border-[--gray-6]">
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  修改密码
                </Text>
                <Flex direction="column" gap="2">
                  <TextField.Root 
                    type="password" 
                    placeholder="当前密码" 
                  />
                  <TextField.Root 
                    type="password" 
                    placeholder="新密码" 
                  />
                  <TextField.Root 
                    type="password" 
                    placeholder="确认新密码" 
                  />
                </Flex>
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" className="block mb-2">
                  两步验证
                </Text>
                <Flex align="center" gap="4">
                  <Switch defaultChecked />
                  <Text>启用两步验证</Text>
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Tabs.Content>

        {/* 通知设置 */}
        <Tabs.Content value="notifications">
          <Card className="mt-6 p-6 border border-[--gray-6]">
            <Flex direction="column" gap="4">
              <Box>
                <Flex justify="between" align="center">
                  <Box>
                    <Text weight="bold">邮件通知</Text>
                    <Text size="1" className="text-[--gray-11]">
                      接收新评论和系统通知的邮件提醒
                    </Text>
                  </Box>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </Flex>
              </Box>

              <Box>
                <Flex justify="between" align="center">
                  <Box>
                    <Text weight="bold">浏览器通知</Text>
                    <Text size="1" className="text-[--gray-11]">
                      在浏览器中接收实时通知
                    </Text>
                  </Box>
                  <Switch defaultChecked />
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {/* 保存按钮 */}
      <Flex justify="end" className="mt-6">
        <Button className="bg-[--accent-9]">
          保存更改
        </Button>
      </Flex>
    </Box>
  );
}); 
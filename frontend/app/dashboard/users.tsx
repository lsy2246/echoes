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
  Avatar,
  DropdownMenu,
  Badge,
} from "@radix-ui/themes";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  TrashIcon,
  PersonIcon,
  DotsHorizontalIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import type { User } from "interface/fields";

// 模拟用户数据
const mockUsers: (User & { id: number })[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    role: "admin",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-03-15"),
    lastLoginAt: new Date("2024-03-15"),
    passwordHash: "",
  },
  {
    id: 2,
    username: "editor",
    email: "editor@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    role: "editor",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-14"),
    lastLoginAt: new Date("2024-03-14"),
    passwordHash: "",
  },
  {
    id: 3,
    username: "user",
    email: "user@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    role: "user",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-13"),
    lastLoginAt: new Date("2024-03-13"),
    passwordHash: "",
  },
];

export default new Template({}, ({ http, args }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  // 获取角色标签样式
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "editor":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      {/* 页面标题和操作栏 */}
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="6" className="text-[--gray-12] mb-2">
            用户管理
          </Heading>
          <Text className="text-[--gray-11]">共 {mockUsers.length} 个用户</Text>
        </Box>
        <Button
          className="bg-[--accent-9]"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          新建用户
        </Button>
      </Flex>

      {/* 搜索栏 */}
      <Box className="w-full sm:w-64 mb-6">
        <TextField.Root
          placeholder="搜索用户..."
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

      {/* 用户列表 */}
      <Box className="border border-[--gray-6] rounded-lg overflow-hidden">
        <ScrollArea>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>用户</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>邮箱</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>角色</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>注册时间</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>最后登录</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {mockUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <Avatar
                        src={user.avatarUrl}
                        fallback={user.username[0].toUpperCase()}
                        size="2"
                        radius="full"
                      />
                      <Text weight="medium">{user.username}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Badge color={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{user.createdAt.toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    {user.lastLoginAt?.toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button
                        variant="ghost"
                        size="1"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
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

      {/* 新建用户对话框 */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>新建用户</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            创建一个新的用户账号
          </Dialog.Description>

          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" className="block mb-2">
                用户名
              </Text>
              <TextField.Root
                placeholder="输入用户名"
                value={newUserData.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewUserData({ ...newUserData, username: e.target.value })
                }
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" className="block mb-2">
                邮箱
              </Text>
              <TextField.Root
                placeholder="输入邮箱"
                value={newUserData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" className="block mb-2">
                密码
              </Text>
              <TextField.Root
                type="password"
                placeholder="输入密码"
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewUserData({ ...newUserData, password: e.target.value })
                }
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" className="block mb-2">
                角色
              </Text>
              <select
                className="w-full h-9 px-3 rounded-md bg-[--gray-1] border border-[--gray-6] text-[--gray-12]"
                value={newUserData.role}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, role: e.target.value })
                }
              >
                <option value="user">普通用户</option>
                <option value="editor">编辑</option>
                <option value="admin">管理员</option>
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
              <Button className="bg-[--accent-9]">创建</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* 编辑用户对话框 */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          {selectedUser && (
            <>
              <Dialog.Title>编辑用户</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                修改用户信息
              </Dialog.Description>

              <Flex direction="column" gap="4">
                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    className="block mb-2"
                  >
                    用户名
                  </Text>
                  <TextField.Root defaultValue={selectedUser.username} />
                </Box>

                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    className="block mb-2"
                  >
                    邮箱
                  </Text>
                  <TextField.Root defaultValue={selectedUser.email} />
                </Box>

                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    className="block mb-2"
                  >
                    角色
                  </Text>
                  <select
                    className="w-full h-9 px-3 rounded-md bg-[--gray-1] border border-[--gray-6] text-[--gray-12]"
                    defaultValue={selectedUser.role}
                  >
                    <option value="user">普通用户</option>
                    <option value="editor">编辑</option>
                    <option value="admin">管理员</option>
                  </select>
                </Box>

                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    className="block mb-2"
                  >
                    重置密码
                  </Text>
                  <TextField.Root type="password" placeholder="留空则不修改" />
                </Box>
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    取消
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button className="bg-[--accent-9]">保存</Button>
                </Dialog.Close>
              </Flex>
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
});

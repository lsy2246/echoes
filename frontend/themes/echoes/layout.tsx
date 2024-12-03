import { Layout } from "interface/layout";
import { ThemeModeToggle } from "hooks/themeMode";
import { Echoes } from "hooks/echoes";
import Tide from "hooks/tide";
import {
  Container,
  Flex,
  Box,
  Link,
  TextField,
  DropdownMenu,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  PersonIcon,
  CheckIcon,
  AvatarIcon,
} from "@radix-ui/react-icons";
import { Theme } from "@radix-ui/themes";
import { useState } from "react";

export default new Layout(({ children, args }) => {
  const [moreState, setMoreState] = useState(false);
  const [loginState, setLoginState] = useState(false);
  return (
    <Theme
      grayColor="gray"
      accentColor="gray"
      radius="medium"
      panelBackground="solid"
    >
      <Box className="min-h-screen flex flex-col">
        {/* 导航栏 */}
        <Box
          asChild
          className="fixed top-0 w-full backdrop-blur-sm border-b border-[--gray-a5] z-50"
          id="nav"
        >
          <Container size="4">
            <Flex justify="between" align="center" className="h-16 px-4">
              {/* Logo 区域 */}
              <Flex align="center">
                <Link href="/" className="flex items-center">
                  <Box className="w-20 h-20">
                    <Echoes />
                  </Box>
                </Link>
              </Flex>

              {/* 右侧导航链接 */}
              <Flex align="center" gap="5">
                {/* 桌面端搜索框和用户图标 */}
                <Box
                  id="nav-desktop"
                  className="hidden lg:flex items-center gap-5"
                >
                  <TextField.Root
                    size="2"
                    variant="surface"
                    placeholder="搜索..."
                    className="w-[200px]"
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon className="h-4 w-4 text-[--accent-a11]" />
                    </TextField.Slot>
                  </TextField.Root>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Box className="hover:opacity-70 transition-opacity p-2">
                        {loginState ? (
                          <AvatarIcon className="w-5 h-5 text-current opacity-70" />
                        ) : (
                          <div>
                            <PersonIcon className="w-5 h-5 text-current opacity-80" />
                          </div>
                        )}
                      </Box>
                    </DropdownMenu.Trigger>
                  </DropdownMenu.Root>
                </Box>

                {/* 移动端菜单按钮和下拉搜索框 */}
                <Box id="nav-mobile" className="lg:hidden">
                  <DropdownMenu.Root
                    onOpenChange={() => setMoreState(!moreState)}
                  >
                    <DropdownMenu.Trigger>
                      <Box className="hover:opacity-70 transition-opacity p-2">
                        {moreState ? (
                          <Cross1Icon className="h-5 w-5 text-[--accent-a11]" />
                        ) : (
                          <HamburgerMenuIcon className="h-5 w-5 text-[--accent-a11]" />
                        )}
                      </Box>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      align="end"
                      className="mt-2 p-3 min-w-[250px]"
                    >
                      <TextField.Root
                        size="2"
                        variant="surface"
                        placeholder="搜索..."
                      >
                        <TextField.Slot>
                          <MagnifyingGlassIcon className="h-4 w-4 text-[--accent-a11]" />
                        </TextField.Slot>
                      </TextField.Root>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Box>

                {/* 主题切换按钮 */}
                <Box>
                  <ThemeModeToggle />
                </Box>
              </Flex>
            </Flex>
          </Container>
        </Box>

        {/* 主要内容区域 */}
        <Box className="flex-1 w-full mt-16">
          <Container size="4" className="py-8">
            <Tide />
            <main>{children}</main>
          </Container>
        </Box>
      </Box>
    </Theme>
  );
});

import { Layout } from "interface/layout";
import { ThemeModeToggle } from "hooks/themeMode";
import { Echoes } from "hooks/echoes";
import { Container, Flex, Box, Link, TextField } from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  PersonIcon,
  AvatarIcon,
} from "@radix-ui/react-icons";
import { Theme } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import throttle from "lodash/throttle";
import "./styles/layouts.css";
import parse from 'html-react-parser';

// 直接导出 Layout 实例
export default new Layout(({ children, args }) => {
  const [moreState, setMoreState] = useState(false);
  const [loginState, setLoginState] = useState(true);
  const [device, setDevice] = useState("");

  // 添加窗口尺寸变化监听
  useEffect(() => {
    // 立即执行一次设备检测
    if (window.innerWidth >= 1024) {
      setDevice("desktop");
    } else {
      setDevice("mobile");
    }

    // 创建节流函数，200ms 内只执行一次
    const handleResize = throttle(() => {
      if (window.innerWidth >= 1024) {
        setDevice("desktop");
        setMoreState(false);
      } else {
        setDevice("mobile");
      }
    }, 200);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, []);

  const navString = typeof args === 'object' && args && 'nav' in args ? args.nav as string : '';

  return (
    <Theme
      grayColor="gray"
      accentColor="gray"
      radius="large"
      panelBackground="solid"
    >
      <Box
        className="min-h-screen flex flex-col"
        id="nav"
      >
        {/* 导航栏 */}
        <Box
          asChild
          className="fixed top-0 w-full backdrop-blur-sm border-b border-[--gray-a5] z-60"
        >
          <nav>
            <Container size="4">
              <Flex
                justify="between"
                align="center"
                className="h-16 px-4"
              >
                {/* Logo 区域 */}
                <Flex align="center">
                  <Link
                    href="/"
                    className="flex items-center hover:opacity-80 transition-all"
                  >
                    <Box className="w-16 h-16">
                      <Echoes />
                    </Box>
                  </Link>
                </Flex>

                {/* 右侧导航链接 */}
                <Flex
                  align="center"
                  gap="5"
                >
                  {/* 桌面端导航 */}
                  {device === "desktop" && (
                    <Box className="flex items-center gap-6">
                      <TextField.Root
                        size="2"
                        variant="surface"
                        placeholder="搜索..."
                        className="w-[240px] [&_input]:pl-3"
                        id="search"
                      >
                        <TextField.Slot
                          side="right"
                          className="p-2"
                        >
                          <MagnifyingGlassIcon className="h-4 w-4 text-[--gray-a12]" />
                        </TextField.Slot>
                      </TextField.Root>

                      <Box className="flex items-center gap-6">
                      {parse(navString)}
                      </Box>

                      <DropdownMenuPrimitive.Root>
                        <DropdownMenuPrimitive.Trigger asChild>
                          <button className="hover:opacity-70 transition-opacity cursor-pointer">
                            {loginState ? (
                              <AvatarIcon className="w-6 h-6 text-[--gray-a12]" />
                            ) : (
                              <PersonIcon className="w-6 h-6 text-[--gray-a12]" />
                            )}
                          </button>
                        </DropdownMenuPrimitive.Trigger>
                        <DropdownMenuPrimitive.Portal>
                          <Theme
                            grayColor="gray"
                            accentColor="gray"
                            radius="large"
                            panelBackground="solid"
                          >
                            <DropdownMenuPrimitive.Content
                              align="end"
                              sideOffset={10}
                              className="mt-3 p-1 min-w-[180px] rounded-md bg-[--color-background] border border-[--gray-a5] shadow-lg animate-in fade-in slide-in-from-top-2"
                            >
                              {loginState ? (
                                <>
                                  <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded">
                                    个人中心
                                  </DropdownMenuPrimitive.Item>
                                  <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded">
                                    设置
                                  </DropdownMenuPrimitive.Item>
                                  <DropdownMenuPrimitive.Separator className="h-px bg-[--gray-a5] my-1" />
                                  <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded">
                                    退出登录
                                  </DropdownMenuPrimitive.Item>
                                </>
                              ) : (
                                <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded">
                                  登录/注册
                                </DropdownMenuPrimitive.Item>
                              )}
                            </DropdownMenuPrimitive.Content>
                          </Theme>
                        </DropdownMenuPrimitive.Portal>
                      </DropdownMenuPrimitive.Root>
                    </Box>
                  )}

                  {/* 移动端菜单 */}
                  {device === "mobile" && (
                    <Box className="flex gap-3">
                      <DropdownMenuPrimitive.Root
                        open={moreState}
                        onOpenChange={setMoreState}
                      >
                        <DropdownMenuPrimitive.Trigger asChild>
                          <button className="hover:opacity-70 transition-opacity p-2">
                            {moreState ? (
                              <Cross1Icon className="h-6 w-6 text-[--gray-a12]" />
                            ) : (
                              <HamburgerMenuIcon className="h-6 w-6 text-[--gray-a12]" />
                            )}
                          </button>
                        </DropdownMenuPrimitive.Trigger>
                        <DropdownMenuPrimitive.Portal>
                          <Theme
                            grayColor="gray"
                            accentColor="gray"
                            radius="large"
                            panelBackground="solid"
                          >
                            <DropdownMenuPrimitive.Content
                              align="end"
                              sideOffset={5}
                              className="mt-2 p-3 min-w-[280px] rounded-md bg-[--color-background] border border-[--gray-a5] shadow-lg animate-in fade-in slide-in-from-top-2"
                            >
                              <Box className="flex flex-col gap-2">
                                {parse(navString)}
                              </Box>
                              <Box className="mt-3 pt-3 border-t border-[--gray-a5]">
                                <TextField.Root
                                  size="2"
                                  variant="surface"
                                  placeholder="搜索..."
                                  className="w-full [&_input]:pl-3"
                                  id="search"
                                >
                                  <TextField.Slot
                                    side="right"
                                    className="p-2"
                                  >
                                    <MagnifyingGlassIcon className="h-4 w-4 text-[--gray-a12]" />
                                  </TextField.Slot>
                                </TextField.Root>
                              </Box>
                            </DropdownMenuPrimitive.Content>
                          </Theme>
                        </DropdownMenuPrimitive.Portal>
                      </DropdownMenuPrimitive.Root>
                    </Box>
                  )}

                  {/* 主题切换按钮 */}
                  <Box className="w-6 h-6 flex items-center justify-center">
                    <ThemeModeToggle />
                  </Box>
                </Flex>
              </Flex>
            </Container>
          </nav>
        </Box>

        {/* 主要内容区域 */}
        <Box className="flex-1 w-full mt-16">
          <Container
            size="4"
            className="py-8"
          >
            <main>{children}</main>
          </Container>
        </Box>
      </Box>
    </Theme>
  );
});


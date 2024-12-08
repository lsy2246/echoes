import { Layout } from "interface/layout";
import { ThemeModeToggle } from "hooks/ThemeMode";
import { Echoes } from "hooks/Echoes";
import { Container, Flex, Box, Link, TextField, Button } from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  PersonIcon,
  AvatarIcon,
} from "@radix-ui/react-icons";
import { Theme } from "@radix-ui/themes";
import { useState, useEffect, useCallback } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import throttle from "lodash/throttle";
import "./styles/layouts.css";
import parse from 'html-react-parser';

// 直接导出 Layout 实例
export default new Layout(({ children, args }) => {
  const [moreState, setMoreState] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? false : false;
    }
    return false;
  });
  const [loginState, setLoginState] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const container = document.querySelector('#main-content');
    if (!container) return;
    
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(Math.min(scrolled, 100));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = document.querySelector('#main-content');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    const throttledResize = throttle(() => {
      requestAnimationFrame(() => {
        if (window.innerWidth >= 1024) {
          setMoreState(false);
        }
      });
    }, 200);

    window.addEventListener("resize", throttledResize);

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener("resize", throttledResize);
      throttledResize.cancel();
    };
  }, [handleScroll]);

  const navString = typeof args === 'object' && args && 'nav' in args ? args.nav as string : '';

  // 添加回到顶部的处理函数
  const scrollToTop = () => {
    const container = document.querySelector('#main-content');
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // 修改移动端菜单的渲染逻辑
  const mobileMenu = (
    <Box className="flex lg:hidden gap-2 items-center">
      {/* 添加移动端进度指示器 */}
      <Box 
        className={`w-10 h-10 flex items-center justify-center ${
          scrollProgress > 0 
            ? 'block' 
            : 'hidden'
        }`}
      >
        <Button
          variant="ghost"
          className="w-10 h-10 p-0 text-[--gray-12] hover:text-[--accent-9] transition-colors flex items-center justify-center [&_text]:text-[--gray-12] [&_text:hover]:text-[--accent-9]"
          onClick={scrollToTop}
        >
          <svg 
            className="w-6 h-6"
            viewBox="0 0 100 100"
          >
            <text
              x="50"
              y="55"
              className="progress-indicator font-bold transition-colors"
              dominantBaseline="middle"
              textAnchor="middle"
              style={{ 
                fontSize: '56px',
                fill: 'currentColor'
              }}
            >
              {Math.round(scrollProgress)}
            </text>
          </svg>
        </Button>
      </Box>

      <Button 
        className="w-10 h-10 p-0 hover:text-[--accent-9] transition-colors flex items-center justify-center group bg-transparent border-0"
        onClick={() => setMoreState(!moreState)}
      >
        {moreState ? (
          <Cross1Icon className="h-5 w-5 text-[--gray-11] transition-colors group-hover:text-[--accent-9]" />
        ) : (
          <HamburgerMenuIcon className="h-5 w-5 text-[--gray-11] transition-colors group-hover:text-[--accent-9]" />
        )}
      </Button>

      {/* 移动端菜单内容 */}
      {moreState && (
        <div 
          className="absolute top-full right-4 w-[180px] mt-2 rounded-md bg-[--gray-1] border border-[--gray-a5] shadow-lg
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 
            duration-200 z-[90]"
        >
          <Box className="flex flex-col">
            {/* 导航链接区域 */}
            <Box className="flex flex-col">
              <Box className="flex flex-col [&>a]:px-4 [&>a]:py-2.5 [&>a]:text-[--gray-12] [&>a]:transition-colors [&>a:hover]:bg-[--gray-a3] [&>a]:text-lg [&>a]:text-center [&>a]:border-b [&>a]:border-[--gray-a5] [&>a:first-child]:rounded-t-md [&>a:last-child]:border-b-0">
                {parse(navString)}
              </Box>
            </Box>

            {/* 搜索框区域 */}
            <Box className="p-4 border-t border-[--gray-a5]">
              <TextField.Root
                size="2"
                variant="surface"
                placeholder="搜索..."
                className="w-full [&_input]:pl-3 hover:border-[--accent-9] border transition-colors group"
              >
                <TextField.Slot
                  side="right"
                  className="p-2"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 text-[--gray-11] transition-colors group-hover:text-[--accent-9]" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            {/* 用户操作区域 */}
            <Box className="p-4 border-t border-[--gray-a5]">
              <Flex gap="3" align="center">
                {/* 用户信息/登录按钮 - 调整为 70% 宽度 */}
                <Box className="w-[70%]">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-[--gray-12] hover:text-[--accent-9] hover:bg-[--gray-a3] transition-colors"
                  >
                    {loginState ? (
                      <>
                        <AvatarIcon className="w-5 h-5" />
                        <span>个人中心</span>
                      </>
                    ) : (
                      <>
                        <PersonIcon className="w-5 h-5" />
                        <span>登录/注册</span>
                      </>
                    )}
                  </Button>
                </Box>

                {/* 主题切换按钮 - 调整为 30% 宽度 */}
                <Box className="w-[30%] flex justify-end [&_button]:w-10 [&_button]:h-10 [&_svg]:w-5 [&_svg]:h-5 [&_button]:text-[--gray-12] [&_button:hover]:text-[--accent-9]">
                  <ThemeModeToggle />
                </Box>
              </Flex>
            </Box>
          </Box>
        </div>
      )}
    </Box>
  );

  return (
    <Theme
      grayColor="gray"
      accentColor="indigo"
      radius="large"
      panelBackground="solid"
    >
      <Box
        className="h-screen flex flex-col overflow-hidden"
        id="nav"
      >
        {/* 导航栏 */}
        <Box
          asChild
          className="w-full backdrop-blur-sm border-b border-[--gray-a5] z-[100] sticky top-0"
        >
          <nav>
            <Container size="4">
              <Flex
                justify="between"
                align="center"
                className="h-20 px-4"
              >
                {/* Logo 区域 */}
                <Flex align="center">
                  <Link
                    href="/"
                    className="hover-text flex items-center"
                  >
                    <Box className="w-20 h-20 [&_path]:transition-all [&_path]:duration-200 group-hover:[&_path]:stroke-[--accent-9]">
                      <Echoes />
                    </Box>
                  </Link>
                </Flex>

                {/* 右侧导航链接 */}
                <Flex align="center" gap="3">
                  {/* 桌面端导航 */}
                  <Box className="hidden lg:flex items-center gap-4">
                    {/* 导航链接 */}
                    <Box className="flex items-center gap-5 [&>a]:text-[--gray-12] [&>a]:text-lg [&>a]:transition-colors [&>a:hover]:text-[--accent-9]">
                      {parse(navString)}
                    </Box>

                    {/* 搜索框 */}
                    <TextField.Root
                      size="3"
                      variant="surface"
                      placeholder="搜索..."
                      className="w-[240px] [&_input]:pl-3 hover:border-[--accent-9] border transition-colors group mr-4"
                      id="search"
                    >
                      <TextField.Slot side="right" className="p-2">
                        <MagnifyingGlassIcon className="h-4 w-4 text-[--gray-11] transition-colors group-hover:text-[--accent-9]" />
                      </TextField.Slot>
                    </TextField.Root>

                    {/* 用户和主题切换区域 */}
                    <Box className="flex items-center border-l border-[--gray-a5] pl-6">
                      {/* 用户头像/登录按钮 */}
                      <Box className="flex items-center">
                        <DropdownMenuPrimitive.Root>
                          <DropdownMenuPrimitive.Trigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-10 h-10 p-0 text-[--gray-12] hover:text-[--accent-9] transition-colors flex items-center justify-center"
                            >
                              {loginState ? (
                                <AvatarIcon className="w-6 h-6" />
                              ) : (
                                <PersonIcon className="w-6 h-6" />
                              )}
                            </Button>
                          </DropdownMenuPrimitive.Trigger>
                          <DropdownMenuPrimitive.Portal>
                            <DropdownMenuPrimitive.Content
                              align="end"
                              sideOffset={10}
                              className="mt-3 p-1 min-w-[180px] rounded-md bg-[--gray-1] border border-[--gray-a5] shadow-lg animate-in fade-in slide-in-from-top-2"
                            >
                              {loginState ? (
                                <>
                                  <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded text-[--gray-12]">
                                    个人中心
                                  </DropdownMenuPrimitive.Item>
                                  <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded text-[--gray-12]">
                                    设置
                                  </DropdownMenuPrimitive.Item>
                                  <DropdownMenuPrimitive.Separator className="h-px bg-[--gray-a5] my-1" />
                                  <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded text-[--gray-12]">
                                    退出登录
                                  </DropdownMenuPrimitive.Item>
                                </>
                              ) : (
                                <DropdownMenuPrimitive.Item className="py-1.5 px-2 outline-none cursor-pointer hover:bg-[--gray-a3] rounded text-[--gray-12]">
                                  登录/注册
                                </DropdownMenuPrimitive.Item>
                              )}
                            </DropdownMenuPrimitive.Content>
                          </DropdownMenuPrimitive.Portal>
                        </DropdownMenuPrimitive.Root>
                      </Box>

                      {/* 主题切换和进度指示器容器 */}
                      <Box className="flex items-center gap-2 ml-4">
                        {/* 主题切换按钮 */}
                        <Box className="w-10 h-10 flex items-center justify-center [&_button]:w-10 [&_button]:h-10 [&_svg]:w-6 [&_svg]:h-6 [&_button]:text-[--gray-12] [&_button:hover]:text-[--accent-9]">
                          <ThemeModeToggle />
                        </Box>

                        {/* 读进度指示器 */}
                        <Box 
                          className={`w-10 h-10 flex items-center justify-center ${
                            scrollProgress > 0 
                              ? 'block' 
                              : 'hidden'
                          }`}
                        >
                          <Button
                            variant="ghost"
                            className="w-10 h-10 p-0 text-[--gray-12] hover:text-[--accent-9] transition-colors flex items-center justify-center [&_text]:text-[--gray-12] [&_text:hover]:text-[--accent-9]"
                            onClick={scrollToTop}
                          >
                            <svg 
                              className="w-6 h-6"
                              viewBox="0 0 100 100"
                            >
                              <text
                                x="50"
                                y="55"
                                className="progress-indicator font-bold transition-colors"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                style={{ 
                                  fontSize: '56px',
                                  fill: 'currentColor'
                                }}
                              >
                                {Math.round(scrollProgress)}
                              </text>
                            </svg>
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* 移动菜单按钮 */}
                  {mobileMenu}
                </Flex>
              </Flex>
            </Container>
          </nav>
        </Box>

        {/* 主要内容区域 */}
        <Box 
          id="main-content" 
          className="flex-1 w-full overflow-auto"
        >
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


import { Layout } from "interface/layout";
import { ThemeModeToggle } from "hooks/ThemeMode";
import { Container, Flex, Box, Link, Button } from "@radix-ui/themes";
import {
  HamburgerMenuIcon,
  Cross1Icon,
  PersonIcon,
  ExitIcon,
  DashboardIcon,
  GearIcon,
  FileTextIcon,
  ReaderIcon,
  LayersIcon,
  FileIcon,
  ColorWheelIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { Theme } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import throttle from "lodash/throttle";

// 定义侧边栏菜单项
const menuItems = [
  {
    icon: <DashboardIcon className="w-4 h-4" />,
    label: "仪表盘",
    path: "/dashboard",
  },
  {
    icon: <FileTextIcon className="w-4 h-4" />,
    label: "文章管理",
    path: "/dashboard/posts",
  },
  {
    icon: <ReaderIcon className="w-4 h-4" />,
    label: "评论管理",
    path: "/dashboard/comments",
  },
  {
    icon: <LayersIcon className="w-4 h-4" />,
    label: "分类管理",
    path: "/dashboard/categories",
  },
  {
    icon: <FileIcon className="w-4 h-4" />,
    label: "文件管理",
    path: "/dashboard/files",
  },
  {
    icon: <ColorWheelIcon className="w-4 h-4" />,
    label: "主题管理",
    path: "/dashboard/themes",
  },
  {
    icon: <GearIcon className="w-4 h-4" />,
    label: "系统设置",
    path: "/dashboard/settings",
  },
  {
    icon: <PersonIcon className="w-4 h-4" />,
    label: "用户管理",
    path: "/dashboard/users",
  },
  {
    icon: <LayersIcon className="w-4 h-4" />,
    label: "插件管理",
    path: "/dashboard/plugins",
  },
];

export default new Layout(({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = throttle(() => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    }, 200);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, []);

  return (
    <Box className="min-h-screen">
      <Theme
        grayColor="gray"
        accentColor="indigo"
        radius="large"
        panelBackground="solid"
      >
        <Box className="flex h-screen">
          {/* 侧边栏 */}
          <Box
            className={`
              fixed lg:static h-full
              transform lg:transform-none transition-transform duration-300
              ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
              ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
              bg-[--gray-1] border-r border-[--gray-6]
              flex flex-col z-30
            `}
          >
            {/* Logo区域 */}
            <Flex
              align="center"
              justify="between"
              className="h-16 px-4 border-b border-[--gray-6]"
            >
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 transition-all ${
                  sidebarCollapsed ? "lg:justify-center" : ""
                }`}
              >
                <Box className="w-8 h-8 rounded-lg bg-[--accent-9] flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </Box>
                <span
                  className={`text-[--gray-12] font-medium ${
                    sidebarCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  后台管理
                </span>
              </Link>
            </Flex>

            {/* 菜单列表区域添加滚动 */}
            <Box className="flex-1 overflow-y-auto">
              <Box className="py-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md
                      text-[--gray-11] hover:text-[--gray-12]
                      hover:bg-[--gray-3] transition-colors
                      ${sidebarCollapsed ? "lg:justify-center" : ""}
                    `}
                  >
                    {item.icon}
                    <span className={sidebarCollapsed ? "lg:hidden" : ""}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 主内容区域 */}
          <Box className="flex-1 flex flex-col lg:ml-0 w-full relative">
            {/* 顶部导航栏 */}
            <Box
              className={`
                h-16 border-b border-[--gray-6] bg-[--gray-1] 
                sticky top-0 z-20 w-full
              `}
            >
              <Flex
                justify="between"
                align="center"
                className="h-full px-4 lg:px-6"
              >
                {/* 左侧菜单按钮 */}
                <Flex gap="4" align="center">
                  {mobileMenuOpen ? (
                    <Button
                      variant="ghost"
                      size="3"
                      className="lg:hidden text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cross1Icon className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="3"
                      className="lg:hidden text-base"
                      onClick={() => setMobileMenuOpen(true)}
                    >
                      <HamburgerMenuIcon className="w-5 h-5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="3"
                    className="hidden lg:flex items-center text-base"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <HamburgerMenuIcon className="w-5 h-5" />
                  </Button>
                </Flex>

                {/* 右侧用户菜单 */}
                <Flex align="center" gap="4">
                  <Box className="flex items-center border-r border-[--gray-6] pr-4 [&_button]:w-10 [&_button]:h-10 [&_svg]:w-6 [&_svg]:h-6">
                    <ThemeModeToggle />
                  </Box>

                  {/* 返回主页按钮 */}
                  <Button
                    variant="ghost"
                    size="3"
                    className="gap-2 text-base"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">返回主页</span>
                  </Button>

                  {/* 退出登录按钮 */}
                  <Button
                    variant="ghost"
                    size="3"
                    className="gap-2 text-base"
                    onClick={() => {
                      // 这里添加退出登录的逻辑
                      console.log("退出登录");
                    }}
                  >
                    <ExitIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">退出登录</span>
                  </Button>
                </Flex>
              </Flex>
            </Box>

            {/* 页面内容区域 */}
            <Box
              id="main-content"
              className="flex-1 overflow-y-auto bg-[--gray-2]"
            >
              <Container size="4" className="py-6 px-4">
                {children}
              </Container>
            </Box>
          </Box>
        </Box>

        {/* 移动端菜单遮罩 */}
        {mobileMenuOpen && (
          <Box
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </Theme>
    </Box>
  );
});

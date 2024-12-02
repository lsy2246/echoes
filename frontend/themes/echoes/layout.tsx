import { Layout } from "interface/layout";
import { ThemeModeToggle } from "hooks/themeMode";
import { Echoes } from "hooks/echo";
import { Container, Flex, Box, Link } from "@radix-ui/themes";

export default new Layout(({ children, args }) => {
  return (
    <Box className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <Box asChild className="fixed top-0 w-full border-b backdrop-blur-sm z-50">
        <nav>
          <Container size="4" className="mx-auto">
            <Flex justify="between" align="center" className="h-16">
              {/* Logo 区域 */}
              <Flex align="center" gap="4">
                <Link 
                  href="/"
                  className="text-xl font-bold flex items-center hover:opacity-80 transition-opacity"
                >
                  <Echoes/>
                </Link>
              </Flex>

              {/* 导航链接 */}
              <Flex align="center" gap="6">
                <Flex gap="4">
                  <Link 
                    href="/posts" 
                    className="hover:opacity-80 transition-opacity font-medium"
                  >
                    文章
                  </Link>
                  <Link 
                    href="/about" 
                    className="hover:opacity-80 transition-opacity font-medium"
                  >
                    关于
                  </Link>
                </Flex>
                <Box>
                  <ThemeModeToggle />
                </Box>
              </Flex>
            </Flex>
          </Container>
        </nav>
      </Box>

      {/* 主要内容区域 */}
      <Box className="flex-1 w-full mt-16">
        <Container size="4" className="py-8">
          <main>
            {children}
          </main>
        </Container>
      </Box>

      {/* 页脚 */}
      <Box asChild className="w-full border-t mt-auto">
        <footer>
          <Container size="4" className="py-8">
            <Flex direction="column" align="center" gap="4">
              <Flex gap="6" className="text-sm">
                <Link href="/terms" className="hover:opacity-80 transition-opacity">
                  使用条款
                </Link>
                <Link href="/privacy" className="hover:opacity-80 transition-opacity">
                  隐私政策
                </Link>
                <Link href="/contact" className="hover:opacity-80 transition-opacity">
                  联系我们
                </Link>
              </Flex>
              <Box className="text-sm text-center opacity-85">
                <p>© {new Date().getFullYear()} Echoes. All rights reserved.</p>
                <p className="mt-1 text-xs opacity-75">
                  Powered by Echoes Framework
                </p>
              </Box>
            </Flex>
          </Container>
        </footer>
      </Box>
    </Box>
  );
});

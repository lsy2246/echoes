import "./styles/login.css";
import { Template } from "interface/template";
import { Container, Heading, Text, Box, Flex, Button } from "@radix-ui/themes";
import { PersonIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AnimatedBackground } from 'hooks/Background';
import { useThemeMode, ThemeModeToggle } from 'hooks/ThemeMode';

export default new Template({}, ({ http, args }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { mode } = useThemeMode();

  useEffect(() => {
    setIsVisible(true);

    const ctx = gsap.context(() => {
      // 登录框动画
      gsap.from(".login-box", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // 表单元素动画
      gsap.from(".form-element", {
        x: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      });

      // 按钮动画
      gsap.from(".login-button", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        delay: 0.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里添加登录逻辑
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟API请求
      
      // 登录成功后的处理
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Box 
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center [&_button]:w-10 [&_button]:h-10 [&_svg]:w-6 [&_svg]:h-6"
        style={{
          '--button-color': 'var(--gray-12)',
          '--button-hover-color': 'var(--accent-9)'
        } as React.CSSProperties}
      >
        <ThemeModeToggle />
      </Box>
      
      <Container
        ref={containerRef}
        className={`h-screen w-full flex items-center justify-center transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Box className="w-full max-w-md mx-auto px-4">
          <Box 
            className="login-box backdrop-blur-sm rounded-lg shadow-lg p-8 border transition-colors duration-300"
            style={{
              backgroundColor: mode === 'dark' ? 'var(--gray-2-alpha-80)' : 'var(--white-alpha-80)',
              borderColor: 'var(--gray-6)'
            }}
          >
            {/* Logo */}
            <Flex direction="column" align="center" className="mb-8">
              <Heading size="6" className="text-center mb-2">
                后台
              </Heading>

            </Flex>

            {/* 登录表单 */}
            <form onSubmit={handleLogin}>
              <Flex direction="column" gap="4">
                {/* 用户名输入框 */}
                <Box className="form-element relative">
                  <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--gray-11)' }} />
                  <input
                    className="login-input pl-10"
                    placeholder="请输入用户名"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Box>

                {/* 密码输入框 */}
                <Box className="form-element relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--gray-11)' }} />
                  <input
                    className="login-input pl-10"
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Box>

                {/* 登录按钮 */}
                <Button
                  className="login-button w-full h-10 transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--accent-9)',
                    color: 'white',
                    '--hover-bg': 'var(--accent-10)'
                  } as React.CSSProperties}
                  size="3"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "登录中..." : "登录"}
                </Button>

                {/* 其他选项 */}
                <Flex justify="center" className="form-element">
                  <Text 
                    size="2" 
                    className="cursor-pointer transition-colors duration-300"
                    style={{
                      color: 'var(--gray-11)',
                      '--hover-color': 'var(--accent-9)'
                    } as React.CSSProperties}
                  >
                    忘记密码？
                  </Text>
                </Flex>
              </Flex>
            </form>
          </Box>
        </Box>
      </Container>
    </>
  );
}); 
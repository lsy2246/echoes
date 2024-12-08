import "./styles/login.css";
import { Template } from "interface/template";
import { Container, Heading, Text, Box, Flex, Button } from "@radix-ui/themes";
import { PersonIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { AnimatedBackground } from 'hooks/Background';
import { useThemeMode, ThemeModeToggle } from 'hooks/ThemeMode';
import { useNotification } from 'hooks/Notification';

export default new Template({}, ({ http, args }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { mode } = useThemeMode();
  const [hasBackgroundError, setHasBackgroundError] = useState(false);
  const notification = useNotification();

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
      
      // 登录成功的通知
      notification.success('登录成功', '欢迎回来！');
      
      // 登录成功后的处理
      console.log("Login successful");
    } catch (error) {
      // 登录失败的通知
      notification.error('登录失败', '用户名或密码错误');
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundError = () => {
    console.log('Background failed to load, switching to fallback');
    setHasBackgroundError(true);
  };

  // 使用 useMemo 包裹背景组件
  const backgroundComponent = useMemo(() => (
    !hasBackgroundError && <AnimatedBackground onError={handleBackgroundError} />
  ), [hasBackgroundError]);

  return (
    <div className="relative min-h-screen">
      {backgroundComponent}
      
      <Box 
        className="fixed top-4 right-4 z-20 w-10 h-10 flex items-center justify-center [&_button]:w-10 [&_button]:h-10 [&_svg]:w-6 [&_svg]:h-6"
        style={{
          '--button-color': 'var(--gray-12)',
          '--button-hover-color': 'var(--accent-9)'
        } as React.CSSProperties}
      >
        <ThemeModeToggle />
      </Box>
      
      <Container
        ref={containerRef}
        className={`relative z-10 h-screen w-full flex items-center justify-center transition-all duration-300 ${
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
                <Box className="form-element input-box relative">
                  <input
                    className="login-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label>用户名</label>
                </Box>

                {/* 密码输入框 */}
                <Box className="form-element input-box relative">
                  <input
                    className="login-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label>密码</label>
                </Box>

                {/* 登录按钮 */}
                <Button
                  className="login-button w-full h-10 transition-colors duration-300 hover:bg-[--hover-bg]"
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
                    className="cursor-pointer transition-colors duration-300 hover:text-[--hover-color]"
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
    </div>
  );
}); 
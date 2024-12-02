import React, { createContext, useState, useContext, useEffect } from "react";
import {DEFAULT_CONFIG} from "app/env"
import { HttpClient } from "core/http";
import { ThemeModeToggle } from "hooks/themeMode";
import { Theme, Button, Select, Flex, Container, Heading, Text, Box } from '@radix-ui/themes';
import { toast } from 'hooks/notification';
import { Echoes } from "hooks/echo";

interface SetupContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const SetupContext = createContext<SetupContextType>({
  currentStep: 1,
  setCurrentStep: () => {},
});

// 步骤组件的通用属性接口
interface StepProps {
  onNext: () => void;
}

const StepContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Container size="2" className="w-full max-w-[90%] md:max-w-[600px] mx-auto px-4">
    <Heading size="5" mb="4">{title}</Heading>
    <Flex direction="column" gap="4">
      {children}
    </Flex>
  </Container>
);

// 通用的导航按钮组件
const NavigationButtons: React.FC<StepProps & { loading?: boolean; disabled?: boolean }> = ({ 
  onNext, 
  loading = false,
  disabled = false 
}) => (
  <Flex justify="end" mt="4" className="w-full">
    <Button 
      onClick={onNext}
      disabled={loading || disabled}
      className="w-full md:w-auto"
    >
      {loading ? '处理中...' : '下一步'}
    </Button>
  </Flex>
);

// 修改输入框组件
const InputField: React.FC<{
  label: string;
  name: string;
  defaultValue?: string | number;
  hint?: string;
  required?: boolean;
}> = ({ label, name, defaultValue, hint, required = true }) => (
  <Box mb="6" className="w-full">
    <Text as="label" size="2" weight="medium" mb="2" className="block">
      {label} {required && <Text color="red">*</Text>}
    </Text>
    <input
      name={name}
      defaultValue={defaultValue?.toString()}
      required={required}
      className="w-full h-[40px] px-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm"
    />
    {hint && <Text size="1" color="gray" mt="1" className="text-xs">{hint}</Text>}
  </Box>
);

const Introduction: React.FC<StepProps> = ({ onNext }) => (
  <StepContainer title="安装说明">
    <div className="space-y-6">
      <p className="text-base text-custom-p-light dark:text-custom-p-dark">
        欢迎使用 Echoes
      </p>
      <NavigationButtons onNext={onNext} />
    </div>
  </StepContainer>
);

const DatabaseConfig: React.FC<StepProps> = ({ onNext }) => {
  const [dbType, setDbType] = useState("postgresql");
  const [loading, setLoading] = useState(false);
  const http = HttpClient.getInstance();

  const validateForm = () => {
    const getRequiredFields = () => {
      switch (dbType) {
        case 'sqllite':
          return ['db_prefix', 'db_name'];
        case 'postgresql':
        case 'mysql':
          return ['db_host', 'db_prefix', 'db_port', 'db_user', 'db_password', 'db_name'];
        default:
          return [];
      }
    };

    const requiredFields = getRequiredFields();
    const emptyFields: string[] = [];

    requiredFields.forEach(field => {
      const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement;
      if (input && (!input.value || input.value.trim() === '')) {
        emptyFields.push(field);
      }
    });

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(field => {
        switch (field) {
          case 'db_host': return '数据库地址';
          case 'db_prefix': return '数据库前缀';
          case 'db_port': return '端口';
          case 'db_user': return '用户名';
          case 'db_password': return '密码';
          case 'db_name': return '数据库名';
          default: return field;
        }
      });
      toast.error(`请填写以下必填项：${fieldNames.join('、')}`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const validation = validateForm();
    if (validation !== true) {
      return;
    }

    setLoading(true);
    try {
      const formData = {
        db_type: dbType,
        host: (document.querySelector('[name="db_host"]') as HTMLInputElement)?.value?.trim()??"",
        db_prefix: (document.querySelector('[name="db_prefix"]') as HTMLInputElement)?.value?.trim()??"",
        port: Number((document.querySelector('[name="db_port"]') as HTMLInputElement)?.value?.trim()??0),
        user: (document.querySelector('[name="db_user"]') as HTMLInputElement)?.value?.trim()??"",
        password: (document.querySelector('[name="db_password"]') as HTMLInputElement)?.value?.trim()??"",
        db_name: (document.querySelector('[name="db_name"]') as HTMLInputElement)?.value?.trim()??"",
      };

      await http.post('/sql', formData);

      let oldEnv = import.meta.env ?? DEFAULT_CONFIG;
      const viteEnv = Object.entries(oldEnv).reduce((acc, [key, value]) => {
        if (key.startsWith('VITE_')) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const newEnv = {
        ...viteEnv,
        VITE_INIT_STATUS: '2'
      };

      await http.dev("/env", {
        method: "POST",
        body: JSON.stringify(newEnv),
      });

      Object.assign(import.meta.env, newEnv);

      toast.success('数据库配置成功！');
      
      setTimeout(() => onNext(), 1000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message, error.title);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepContainer title="数据库配置">
      <div>
        <Box mb="6">
          <Text as="label" size="2" weight="medium" mb="2" className="block">
            数据库类型
          </Text>
          <Select.Root value={dbType} onValueChange={setDbType}>
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value="postgresql">PostgreSQL</Select.Item>
                <Select.Item value="mysql">MySQL</Select.Item>
                <Select.Item value="sqllite">SQLite</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>

        {dbType === "postgresql" && (
          <>
            <InputField
              label="数据库地址"
              name="db_host"
              defaultValue="localhost"
              hint="通常使 localhost"
              required
            />
            <InputField
              label="数据库前缀"
              name="db_prefix"
              defaultValue="echoec_"
              hint="通常使用 echoec_"
              required
            />
            <InputField
              label="端口"
              name="db_port"
              defaultValue={5432}
              hint="PostgreSQL 默认端口为 5432"
              required
            />
            <InputField
              label="用户名"
              name="db_user"
              defaultValue="postgres"
              required
            />
            <InputField
              label="密码"
              name="db_password"
              defaultValue="postgres"
              required
            />
            <InputField
              label="数据库名"
              name="db_name"
              defaultValue="echoes"
              required
            />
          </>
        )}
        {dbType === "mysql" && (
          <>
            <InputField
              label="数据库地址"
              name="db_host"
              defaultValue="localhost"
              hint="通常使用 localhost"
              required
            />
            <InputField
              label="数据库前缀"
              name="db_prefix"
              defaultValue="echoec_"
              hint="通常使用 echoec_"
              required
            />
            <InputField
              label="端口"
              name="db_port"
              defaultValue={3306}
              hint="mysql 默认端口为 3306"
              required
            />
            <InputField
              label="用户名"
              name="db_user"
              defaultValue="root"
              required
            />
            <InputField
              label="密码"
              name="db_password"
              defaultValue="mysql"
              required
            />
            <InputField
              label="数据库名"
              name="db_name"
              defaultValue="echoes"
              required
            />
          </>
        )}
        {dbType === "sqllite" && (
          <>
            <InputField
              label="数据库前缀"
              name="db_prefix"
              defaultValue="echoec_"
              hint="通常使用 echoec_"
              required
            />
            <InputField
              label="数据库名"
              name="db_name"
              defaultValue="echoes.db"
              required
            />
          </>
        )}
        <NavigationButtons 
          onNext={handleNext} 
          loading={loading}
          disabled={loading}
        />
      </div>
    </StepContainer>
  );
};


interface InstallReplyData {
  token: string,
  username: string,
  password: string,
}


const AdminConfig: React.FC<StepProps> = ({ onNext }) => {
  const [loading, setLoading] = useState(false);
  const http = HttpClient.getInstance();

  const handleNext = async () => {
    setLoading(true);
    try {
      const formData = {
        username: (document.querySelector('[name="admin_username"]') as HTMLInputElement)?.value,
        password: (document.querySelector('[name="admin_password"]') as HTMLInputElement)?.value,
        email: (document.querySelector('[name="admin_email"]') as HTMLInputElement)?.value,
      };

      const response = await http.post('/administrator', formData) as InstallReplyData;
      const data = response;
      
      localStorage.setItem('token', data.token);
      
      let oldEnv = import.meta.env ?? DEFAULT_CONFIG;
      const viteEnv = Object.entries(oldEnv).reduce((acc, [key, value]) => {
        if (key.startsWith('VITE_')) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const newEnv = {
        ...viteEnv,
        VITE_INIT_STATUS: '3',
        VITE_API_USERNAME: data.username,
        VITE_API_PASSWORD: data.password
      };

      await http.dev("/env", {
        method: "POST",
        body: JSON.stringify(newEnv),
      });

      Object.assign(import.meta.env, newEnv);

      toast.success('管理员账号创建成功！');
      onNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message, error.title);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepContainer title="创建管理员账号">
      <div className="space-y-6">
        <InputField label="用户名" name="admin_username" />
        <InputField label="密码" name="admin_password" />
        <InputField label="邮箱" name="admin_email" />
        <NavigationButtons onNext={handleNext} loading={loading} />
      </div>
    </StepContainer>
  );
};

const SetupComplete: React.FC = () => {

  return (
    <StepContainer title="安装完成">
      <div className="text-center">
        <p className="text-xl text-custom-p-light dark:text-custom-p-dark mb-4">
          恭喜！安装已完成
        </p>
        <p className="text-base text-custom-p-light dark:text-custom-p-dark">
          系统正在重启中，请稍候...
        </p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </StepContainer>
  );
};

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(() => {
    return Number(import.meta.env.VITE_INIT_STATUS ?? 0) + 1;
  });

  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 在客户端运行时检查主题
    const isDark = document.documentElement.classList.contains('dark');
    setAppearance(isDark ? 'dark' : 'light');

    // 监听主题变化
    const handleThemeChange = (event: CustomEvent<{ theme: 'light' | 'dark' }>) => {
      setAppearance(event.detail.theme);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('theme-change', handleThemeChange as EventListener);
  }, []);

  return (
    <Theme 
      accentColor="blue" 
      grayColor="slate" 
      radius="medium"
      appearance={appearance}
    >
      <div className="min-h-screen w-full">
        <div className="fixed top-2 right-4 z-10">
          <ThemeModeToggle />
        </div>
        <div className="flex justify-center pt-2">
          <div className="w-20 h-20 md:w-24 md:h-24">
            <Echoes />
          </div>
        </div>
        <Flex direction="column" className="min-h-screen w-full pb-4">
          <Container className="w-full">
            <SetupContext.Provider value={{ currentStep, setCurrentStep }}>
              {currentStep === 1 && (
                <Introduction onNext={() => setCurrentStep(currentStep + 1)} />
              )}
              {currentStep === 2 && (
                <DatabaseConfig 
                  onNext={() => setCurrentStep(currentStep + 1)}
                />
              )}
              {currentStep === 3 && (
                <AdminConfig 
                  onNext={() => setCurrentStep(currentStep + 1)}
                />
              )}
              {currentStep === 4 && <SetupComplete />}
            </SetupContext.Provider>
          </Container>
        </Flex>
      </div>
    </Theme>
  );
}
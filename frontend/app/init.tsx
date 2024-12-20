import React, { createContext, useEffect, useState } from "react";
import { DEFAULT_CONFIG } from "app/env";
import { HttpClient } from "core/http";
import { ThemeModeToggle } from "hooks/ThemeMode";
import {
  Theme,
  Button,
  Select,
  Flex,
  Container,
  Heading,
  Text,
  Box,
  TextField,
} from "@radix-ui/themes";
import { toast } from "hooks/Notification";
import { Echoes } from "hooks/Echoes";
import { ModuleManager } from "core/moulde";

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
  <Box style={{ width: "90%", maxWidth: "600px", margin: "0 auto" }}>
    <Heading size="5" mb="4" weight="bold" style={{ userSelect: "none" }}>
      {title}
    </Heading>
    <Flex direction="column" gap="4">
      {children}
    </Flex>
  </Box>
);

// 通用的导航按钮组件
const NavigationButtons: React.FC<
  StepProps & { loading?: boolean; disabled?: boolean }
> = ({ onNext, loading = false, disabled = false }) => (
  <Flex justify="end" mt="4">
    <Button
      size="3"
      disabled={loading || disabled}
      onClick={onNext}
      style={{ width: "100%" }}
    >
      {loading ? "处理中..." : "下一步"}
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
  <Box mb="4">
    <Text as="label" size="2" weight="medium" className="block mb-2">
      {label} {required && <Text color="red">*</Text>}
    </Text>
    <TextField.Root
      name={name}
      defaultValue={defaultValue?.toString()}
      required={required}
    >
      <TextField.Slot></TextField.Slot>
    </TextField.Root>
    {hint && (
      <Text color="gray" size="1" mt="1">
        {hint}
      </Text>
    )}
  </Box>
);

const Introduction: React.FC<StepProps> = ({ onNext }) => (
  <StepContainer title="安装说明">
    <Text size="3" style={{ lineHeight: 1.6 }}>
      欢迎使用 Echoes
    </Text>
    <NavigationButtons onNext={onNext} />
  </StepContainer>
);

// 新增工具函数
const updateEnvConfig = async (newValues: Record<string, any>) => {
  const http = HttpClient.getInstance();
  // 获取所有 VITE_ 开头的环境变量
  let oldEnv = import.meta.env ?? DEFAULT_CONFIG;
  const viteEnv = Object.entries(oldEnv).reduce(
    (acc, [key, value]) => {
      if (key.startsWith("VITE_")) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const newEnv = {
    ...viteEnv,
    ...newValues,
  };

  await http.dev("/env", {
    method: "POST",
    body: JSON.stringify(newEnv),
  });

  Object.assign(import.meta.env, newEnv);
};

// 新增表单数据收集函数
const getFormData = (fields: string[]) => {
  return fields.reduce((acc, field) => {
    const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement;
    if (input) {
      acc[field] = input.value.trim();
    }
    return acc;
  }, {} as Record<string, string>);
};

const DatabaseConfig: React.FC<StepProps> = ({ onNext }) => {
  const [dbType, setDbType] = useState("postgresql");
  const [loading, setLoading] = useState(false);
  const http = HttpClient.getInstance();

  const validateForm = () => {
    const getRequiredFields = () => {
      switch (dbType) {
        case "sqllite":
          return ["db_prefix", "db_name"];
        case "postgresql":
        case "mysql":
          return [
            "db_host",
            "db_prefix",
            "db_port",
            "db_user",
            "db_password",
            "db_name",
          ];
        default:
          return [];
      }
    };

    const requiredFields = getRequiredFields();
    const emptyFields: string[] = [];

    requiredFields.forEach((field) => {
      const input = document.querySelector(
        `[name="${field}"]`,
      ) as HTMLInputElement;
      if (input && (!input.value || input.value.trim() === "")) {
        emptyFields.push(field);
      }
    });

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map((field) => {
        switch (field) {
          case "db_host":
            return "数据库地址";
          case "db_prefix":
            return "数据库前缀";
          case "db_port":
            return "端口";
          case "db_user":
            return "用户名";
          case "db_password":
            return "密码";
          case "db_name":
            return "数据库名";
          default:
            return field;
        }
      });
      toast.error(`请填写以下必填项：${fieldNames.join("、")}`);
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
      const formFields = getFormData([
        "db_host",
        "db_prefix",
        "db_port",
        "db_user",
        "db_password",
        "db_name",
      ]);

      const formData = {
        db_type: dbType,
        host: formFields?.db_host ?? "localhost",
        db_prefix: formFields?.db_prefix ?? "echoec_",
        port:Number(formFields?.db_port?? 0),
        user: formFields?.db_user ?? "",
        password: formFields?.db_password ?? "",
        db_name: formFields?.db_name ?? "",
      };

      await http.post("/sql", formData);

      toast.success("数据库配置成功！");
      setTimeout(() => onNext(), 1000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.title, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepContainer title="数据库配置">
      <div>
        <Box mb="6">
          <Text as="label" size="2" weight="medium" mb="2" className="block">
            数据库类型 <Text color="red">*</Text>
          </Text>
          <Select.Root value={dbType} onValueChange={setDbType}>
            <Select.Trigger className="w-full" />
            <Select.Content position="popper" sideOffset={8}>
              <Select.Group>
                <Select.Item value="postgresql">
                  <Flex gap="2" align="center">
                    <Text>PostgreSQL</Text>
                  </Flex>
                </Select.Item>
                <Select.Item value="mysql">
                  <Flex gap="2" align="center">
                    <Text>MySQL</Text>
                  </Flex>
                </Select.Item>
                <Select.Item value="sqllite">
                  <Flex gap="2" align="center">
                    <Text>SQLite</Text>
                  </Flex>
                </Select.Item>
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
  token: string;
  username: string;
  password: string;
}

const AdminConfig: React.FC<StepProps> = ({ onNext }) => {
  const [loading, setLoading] = useState(false);
  const http = HttpClient.getInstance();

  const handleNext = async () => {
    setLoading(true);
    try {
      const formData = getFormData([
        'admin_username',
        'admin_password',
        'admin_email',
      ]);

      // 添加非空验证
      if (!formData.admin_username || !formData.admin_password || !formData.admin_email) {
        toast.error('请填写所有必填字段');
        return;
      }

      // 调整数据格式以匹配后端期望的格式
      const requestData = {
        username: formData.admin_username,
        password: formData.admin_password,
        email: formData.admin_email,
      };

      const response = (await http.post("/administrator", requestData)) as InstallReplyData;
      const { token, username, password } = response;

      localStorage.setItem("token", token);

      await updateEnvConfig({
        VITE_API_USERNAME: username,
        VITE_API_PASSWORD: password,
      });

      toast.success("管理员账号创建成功！");
      onNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error.title, error.message);
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
  useEffect(() => {
    // 添加延迟后刷新页面
    const timer = setTimeout(() => {
      window.location.reload();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <StepContainer title="安装完成">
      <Flex direction="column" align="center" gap="4">
        <Text size="5" weight="medium">
          恭喜！安装已完成
        </Text>
        <Text size="3">系统正在重启中，请稍候...</Text>
        <Box mt="4">
          <Flex justify="center">
            <Box className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></Box>
          </Flex>
        </Box>
      </Flex>
    </StepContainer>
  );
};

export default function SetupPage() {
  const [moduleManager, setModuleManager] = useState<ModuleManager | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initManager = async () => {
      try {
        const manager = await ModuleManager.getInstance();
        setModuleManager(manager);
        // 确保初始步骤至少从1开始
        setCurrentStep(Math.max(manager.getStep() + 1, 1));
      } catch (error) {
        console.error('Init manager error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initManager();
  }, []);

  const handleStepChange = async (step: number) => {
    if (moduleManager) {
      await moduleManager.setStep(step - 1);
      setCurrentStep(step);
    }
  };

  if (isLoading) {
    return (
      <Theme
        grayColor="gray"
        accentColor="gray"
        radius="medium"
        panelBackground="solid"
        appearance="inherit"
      >
        <Box className="min-h-screen w-full">
          <Flex justify="center" pt="2">
            <Box className="w-20 h-20">
              <Echoes />
            </Box>
          </Flex>
        </Box>
      </Theme>
    );
  }

  return (
    <Theme
      grayColor="gray"
      accentColor="gray"
      radius="medium"
      panelBackground="solid"
      appearance="inherit"
    >
      <Box className="min-h-screen w-full">
        <Box position="fixed" top="2" right="4">
          <Box className="w-10 h-10 flex items-center justify-center [&_button]:w-10 [&_button]:h-10 [&_svg]:w-6 [&_svg]:h-6 [&_button]:text-[--gray-12] [&_button:hover]:text-[--accent-9]">
            <ThemeModeToggle />
          </Box>
        </Box>

        <Flex justify="center" pt="2">
          <Box className="w-20 h-20">
            <Echoes />
          </Box>
        </Flex>

        <Flex direction="column" className="min-h-screen w-full pb-4">
          <Container className="w-full">
            <SetupContext.Provider value={{ 
              currentStep, 
              setCurrentStep: handleStepChange 
            }}>
              {currentStep === 1 && (
                <Introduction onNext={() => handleStepChange(2)} />
              )}
              {currentStep === 2 && (
                <DatabaseConfig onNext={() => handleStepChange(3)} />
              )}
              {currentStep === 3 && (
                <AdminConfig onNext={() => handleStepChange(4)} />
              )}
              {currentStep === 4 && <SetupComplete />}
            </SetupContext.Provider>
          </Container>
        </Flex>
      </Box>
    </Theme>
  );
}

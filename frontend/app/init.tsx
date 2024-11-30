import React, { createContext, useState, useEffect } from "react";
import { message } from "hooks/message";
import {DEFAULT_CONFIG} from "app/env"
import { useHub } from "core/hub";


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
  <div className="mx-auto max-w-3xl">
    <h2 className="text-xl font-medium text-custom-title-light dark:text-custom-title-dark mb-6 px-4">
      {title}
    </h2>
    <div className="space-y-6 px-4">
      {children}
    </div>
  </div>
);

// 通用的导航按钮组件
const NavigationButtons: React.FC<StepProps & { loading?: boolean; disabled?: boolean }> = ({ 
  onNext, 
  loading = false,
  disabled = false 
}) => (
  <div className="flex justify-end mt-4">
    <button
      onClick={onNext}
      disabled={loading || disabled}
      className={`px-6 py-2 rounded-lg transition-colors font-medium text-sm
        ${loading || disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
    >
      {loading ? '处理中...' : '下一步'}
    </button>
  </div>
);

// 输入框组件
const InputField: React.FC<{
  label: string;
  name: string;
  defaultValue?: string | number;
  hint?: string;
  required?: boolean;
}> = ({ label, name, defaultValue, hint, required = true }) => ( 
  <div className="mb-6">
    <h3 className="text-base font-medium text-custom-title-light dark:text-custom-title-dark mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </h3>
    <input
      name={name}
      defaultValue={defaultValue}
      required={required}
      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    />
    {hint && (
      <p className="text-xs text-custom-p-light dark:text-custom-p-dark mt-1.5">
        {hint}
      </p>
    )}
  </div>
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
  const http = useHub().http;

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
      message.error(`请填写以下必填项：${fieldNames.join('、')}`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) {
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

      message.success('数据库配置成功！');
      setTimeout(() => onNext(), 1000);
    } catch (error: any) {
      console.error( error);
      message.error(error.message );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepContainer title="数据库配置">
      <div>
        <div className="mb-6">
          <h3 className="text-base font-medium text-custom-title-light dark:text-custom-title-dark mb-1.5">
            数据库类型
          </h3>
          <select
            value={dbType}
            onChange={(e) => setDbType(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqllite">SQLite</option>
          </select>
        </div>

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
  const http = useHub().http;

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

      message.success('管理员账号创建成功！');
      onNext();
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
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
  const http = useHub().http;
  


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

// 修改主题切换按钮组件
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(currentScrollPos < 100); // 滚动超过100px就隐藏
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`absolute top-4 right-4 p-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(() => {
    return Number(import.meta.env.VITE_INIT_STATUS ?? 0) + 1;
  });

  return (
    <div className="relative min-h-screen w-full bg-custom-bg-light dark:bg-custom-bg-dark">
      <ThemeToggle />
      <div className="container mx-auto py-8">
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
      </div>
    </div>
  );
}
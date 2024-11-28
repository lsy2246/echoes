import React, { createContext, useState, useEffect } from "react";
import { useApi } from "hooks/servicesProvider";
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
  onPrev?: () => void;
}

// 通用的步骤容器组件
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
const NavigationButtons: React.FC<StepProps> = ({ onNext }) => (
  <div className="flex justify-end mt-4">
    <button
      onClick={onNext}
      className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors font-medium text-sm"
    >
      下一步
    </button>
  </div>
);

// 输入框组件
const InputField: React.FC<{
  label: string;
  name: string;
  defaultValue?: string | number;
  hint?: string;
}> = ({ label, name, defaultValue, hint }) => (
  <div className="mb-6">
    <h3 className="text-base font-medium text-custom-title-light dark:text-custom-title-dark mb-2">
      {label}
    </h3>
    <input
      name={name}
      defaultValue={defaultValue}
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
              hint="通常使用 localhost"
            />
            <InputField
              label="数据库前缀"
              name="db_prefix"
              defaultValue="echoec_"
              hint="通常使用 echoec_"
            />
            <InputField
              label="端口"
              name="db_port"
              defaultValue={5432}
              hint="PostgreSQL 默认端口为 5432"
            />
            <InputField
              label="用户名"
              name="db_user"
              defaultValue="postgres"
            />
            <InputField
              label="密码"
              name="db_password"
              defaultValue="postgres"
            />
            <InputField
              label="数据库名"
              name="db_name"
              defaultValue="echoes"
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
            />
            <InputField
              label="数据库前缀"
              name="db_prefix"
              defaultValue="echoec_"
              hint="通常使用 echoec_"
            />
            <InputField
              label="端口"
              name="db_port"
              defaultValue={3306}
              hint="mysql 默认端口为 3306"
            />
            <InputField
              label="用户名"
              name="db_user"
              defaultValue="root"
            />
            <InputField
              label="密码"
              name="db_password"
              defaultValue="mysql"
            />
            <InputField
              label="数据库名"
              name="db_name"
              defaultValue="echoes"
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
            />
            <InputField
              label="数据库名"
              name="db_name"
              defaultValue="echoes.db"
            />
          </>
        )}
        <NavigationButtons onNext={onNext} />
      </div>
    </StepContainer>
  );
};

const AdminConfig: React.FC<StepProps> = ({ onNext }) => (
  <StepContainer title="创建管理员账号">
    <div className="space-y-6">
      <InputField label="用户名" name="admin_username" />
      <InputField label="密码" name="admin_password" />
      <InputField label="邮箱" name="admin_email" />
      <NavigationButtons onNext={onNext} />
    </div>
  </StepContainer>
);

const SetupComplete: React.FC = () => (
  <StepContainer title="安装完成">
    <div className="text-center">
      <p className="text-xl text-custom-p-light dark:text-custom-p-dark">
        恭喜！安装已完成，系统即将重启...
      </p>
    </div>
  </StepContainer>
);

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
  let step = Number(import.meta.env.VITE_INIT_STATUS);
  
  const [currentStep, setCurrentStep] = useState(step);

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
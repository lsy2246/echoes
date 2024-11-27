import React, { useContext, createContext, useState } from "react";

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
  <div className="mx-auto max-w-5xl">
    <h2 className="text-2xl font-semibold text-custom-title-light dark:text-custom-title-dark mb-5">
      {title}
    </h2>
    <div className="bg-custom-box-light dark:bg-custom-box-dark rounded-lg shadow-lg p-8">
      {children}
    </div>
  </div>
);

// 通用的导航按钮组件
const NavigationButtons: React.FC<StepProps> = ({ onNext, onPrev }) => (
  <div className="flex gap-4 mt-6">
    {onPrev && (
      <button
        onClick={onPrev}
        className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
      >
        上一步
      </button>
    )}
    <button
      onClick={onNext}
      className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
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
  <div className="mb-4">
    <h3 className="text-xl text-custom-title-light dark:text-custom-title-dark mb-2">
      {label}
    </h3>
    <input
      name={name}
      defaultValue={defaultValue}
      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
    />
    {hint && (
      <p className="text-xs text-custom-p-light dark:text-custom-p-dark mt-1">
        {hint}
      </p>
    )}
  </div>
);

const Introduction: React.FC<StepProps> = ({ onNext }) => (
  <StepContainer title="安装说明">
    <div className="space-y-6">
      <p className="text-xl text-custom-p-light dark:text-custom-p-dark">
        欢迎使用 Echoes
      </p>
      <NavigationButtons onNext={onNext} />
    </div>
  </StepContainer>
);

const DatabaseConfig: React.FC<StepProps> = ({ onNext, onPrev }) => {
  const [dbType, setDbType] = useState("postgresql");

  return (
    <StepContainer title="数据库配置">
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl text-custom-title-light dark:text-custom-title-dark mb-2">
            数据库类型
          </h3>
          <select
            value={dbType}
            onChange={(e) => setDbType(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="postgresql">PostgreSQL</option>
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
        <NavigationButtons onNext={onNext} onPrev={onPrev} />
      </div>
    </StepContainer>
  );
};

const AdminConfig: React.FC<StepProps> = ({ onNext, onPrev }) => (
  <StepContainer title="创建管理员账号">
    <div className="space-y-6">
      <InputField label="用户名" name="admin_username" />
      <InputField label="密码" name="admin_password" />
      <InputField label="邮箱" name="admin_email" />
      <NavigationButtons onNext={onNext} onPrev={onPrev} />
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

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen w-full bg-custom-bg-light dark:bg-custom-bg-dark">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-custom-title-light dark:text-custom-title-dark mb-4">
            Echoes
          </h1>
        </div>
        <SetupContext.Provider value={{ currentStep, setCurrentStep }}>
          {currentStep === 1 && (
            <Introduction onNext={() => setCurrentStep(currentStep + 1)} />
          )}
          {currentStep === 2 && (
            <DatabaseConfig
              onNext={() => setCurrentStep(currentStep + 1)}
              onPrev={() => setCurrentStep(currentStep - 1)}
            />
          )}
          {currentStep === 3 && (
            <AdminConfig
              onNext={() => setCurrentStep(currentStep + 1)}
              onPrev={() => setCurrentStep(currentStep - 1)}
            />
          )}
          {currentStep === 4 && <SetupComplete />}
        </SetupContext.Provider>
      </div>
    </div>
  );
}
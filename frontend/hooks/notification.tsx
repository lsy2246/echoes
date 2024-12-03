// @ts-nocheck
import React, { createContext, useState, useContext } from "react";
import { Button, Flex, Card, Text, Box } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

// 定义通知类型枚举
export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
}

// 通知类型定义
type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
};

// 通知配置类型定义
type NotificationConfig = {
  icon: React.ReactNode;
  bgColor: string;
};

// 通知配置映射
const notificationConfigs: Record<NotificationType, NotificationConfig> = {
  [NotificationType.SUCCESS]: {
    icon: <CheckCircledIcon className="w-5 h-5 text-white" />,
    bgColor: "bg-[rgba(0,168,91,0.85)]",
  },
  [NotificationType.ERROR]: {
    icon: <CrossCircledIcon className="w-5 h-5 text-white" />,
    bgColor: "bg-[rgba(225,45,57,0.85)]",
  },
  [NotificationType.INFO]: {
    icon: <InfoCircledIcon className="w-5 h-5 text-white" />,
    bgColor: "bg-[rgba(38,131,255,0.85)]",
  },
};

// 修改通知上下文类型定义
type NotificationContextType = {
  show: (type: NotificationType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

// 简化全局 toast 对象定义
export const toast: NotificationContextType = {
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 统一参数顺序：title 在前，message 在后
  const show = (type: NotificationType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, type, title, message };

    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    }, 3000);
  };

  // 简化快捷方法定义
  const contextValue = {
    show,
    success: (title: string, message?: string) =>
      show(NotificationType.SUCCESS, title, message),
    error: (title: string, message?: string) =>
      show(NotificationType.ERROR, title, message),
    info: (title: string, message?: string) =>
      show(NotificationType.INFO, title, message),
  };

  // 初始化全局方法
  React.useEffect(() => {
    Object.assign(toast, contextValue);
  }, []);

  const closeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {notifications.length > 0 && (
        <Box
          position="fixed"
          top="4"
          className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 w-full max-w-[360px] px-4 md:px-0 md:right-6"
        >
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="p-0 overflow-hidden shadow-lg w-full"
            >
              <Flex
                direction="column"
                gap="2"
                className={`relative min-h-[52px] p-4 ${notificationConfigs[notification.type].bgColor}`}
              >
                <Button
                  variant="ghost"
                  onClick={() => closeNotification(notification.id)}
                  className="absolute right-2 top-2 p-1 min-w-0 h-auto text-white opacity-70 cursor-pointer bg-transparent border-none text-sm hover:opacity-100 transition-opacity"
                >
                  ✕
                </Button>
                <Flex direction="column" gap="1.5" className="pr-6">
                  <Flex align="center" gap="2">
                    <span className="flex items-center justify-center">
                      {notificationConfigs[notification.type].icon}
                    </span>
                    {notification.title && (
                      <Text
                        weight="bold"
                        size="2"
                        className="text-white leading-tight"
                      >
                        {notification.title}
                      </Text>
                    )}
                  </Flex>
                  <Text size="2" className="text-white/80 leading-normal">
                    {notification.message}
                  </Text>
                </Flex>
                <div className="h-0.5 w-full bg-white/10 mt-1">
                  <div
                    className="h-full bg-white/20 animate-[progress_3s_linear]"
                    style={{
                      transformOrigin: "left",
                    }}
                  />
                </div>
              </Flex>
            </Card>
          ))}
        </Box>
      )}
      {children}
    </NotificationContext.Provider>
  );
};

// 导出hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

import { ReactNode } from "react";

import { MessageProvider, MessageContainer } from "hooks/message";

export const StyleProvider = ({ children }: { children: ReactNode }) => (
  <MessageProvider>
    <MessageContainer />
    {children}
  </MessageProvider>
);

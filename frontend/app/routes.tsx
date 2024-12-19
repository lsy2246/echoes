import React, { memo, useState, useEffect } from "react";
import { ModuleManager } from "core/moulde";
import SetupPage from "app/init";

const Routes = memo(() => {
  const [manager, setManager] = useState<ModuleManager | null>(null);

  useEffect(() => {
    ModuleManager.getInstance().then(instance => {
      setManager(instance);
    });
  }, []);

  if (!manager?.isInitialized()) {
    return null;
  }

  const step = manager.getStep();

  if (step < 3) {
    return <SetupPage />;
  }

  const currentPath = window.location.pathname;
  return manager.getPage(currentPath);
});

export default Routes;

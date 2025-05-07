import { createContext, ReactNode, useContext, useState } from "react";

type TopActionsContextType = {
  showTopActions: boolean;
  setShowTopActions: (show: boolean) => void;
};

export const TopActionsContext = createContext<TopActionsContextType | null>(null);

export function TopActionsProvider({ children }: { children: ReactNode }) {
  const [showTopActions, setShowTopActions] = useState(true);

  return (
    <TopActionsContext.Provider
      value={{
        showTopActions,
        setShowTopActions,
      }}
    >
      {children}
    </TopActionsContext.Provider>
  );
}

export function useTopActions() {
  const context = useContext(TopActionsContext);
  if (!context) {
    throw new Error("useTopActions must be used within a TopActionsProvider");
  }
  return context;
}
import { createContext, useContext } from 'react';

interface NavigationContextValue {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
}

export const NavigationContext = createContext<NavigationContextValue>({
  isExpanded: false,
  setIsExpanded: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

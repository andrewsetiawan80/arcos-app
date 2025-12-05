// src/context/MenuContext.tsx - Global menu context for both public and admin
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextType {
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  openMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <MenuContext.Provider value={{ menuVisible, setMenuVisible, openMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}



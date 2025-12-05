// src/components/GlobalMenu.tsx - Global menu that works everywhere
import React from 'react';
import { useAuth } from '../store/auth';
import { useMenu } from '../context/MenuContext';
import PublicMenu from './PublicMenu';
import AdminDrawer from './AdminDrawer';

interface GlobalMenuProps {
  navigation: any;
  currentRoute: string | null;
}

export default function GlobalMenu({ navigation, currentRoute }: GlobalMenuProps) {
  const { isAuthenticated } = useAuth();
  const { menuVisible, closeMenu } = useMenu();

  if (!menuVisible) return null;

  // Show admin drawer if in Admin stack, otherwise show public menu
  // If authenticated but on public site, show public menu
  const isOnAdminStack = currentRoute === 'Admin';
  
  if (isAuthenticated && isOnAdminStack) {
    return (
      <AdminDrawer
        visible={menuVisible}
        onClose={closeMenu}
        navigation={navigation}
      />
    );
  }

  return (
    <PublicMenu
      visible={menuVisible}
      onClose={closeMenu}
      navigation={navigation}
    />
  );
}


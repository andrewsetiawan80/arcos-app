// src/components/AdminDrawer.tsx - Drawer menu for admin functions
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../store/auth';
import ArcosLogo from './ArcosLogo';

interface AdminDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export default function AdminDrawer({ visible, onClose, navigation }: AdminDrawerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const slideAnim = React.useRef(new Animated.Value(1)).current; // 1 = hidden (off-screen left), 0 = visible

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    { title: 'Dashboard', icon: 'home-outline', screen: 'Dashboard' },
    { title: 'Products', icon: 'cube-outline', screen: 'Products' },
    { title: 'Recipes', icon: 'flask-outline', screen: 'Recipes' },
    { title: 'Planning', icon: 'calculator-outline', screen: 'Planning' },
    { title: 'Sales', icon: 'document-text-outline', screen: 'Sales' },
    { title: 'Lab', icon: 'beaker-outline', screen: 'Lab' },
    { title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
  ];

  const handleNavigate = (screen: string) => {
    const nav = navigation || (global as any).navigationRef?.current;
    if (nav) {
      // Navigate within the Admin tab
      nav.navigate('Admin', { screen });
    }
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    const nav = navigation || (global as any).navigationRef?.current;
    if (nav) {
      nav.navigate('Public', { screen: 'PublicHome' });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Drawer - slides in from left */}
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              transform: [{ translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -400] // Slide in from left
              })}],
            },
          ]}
        >
          {/* Header with logo and close button */}
          <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
            <ArcosLogo size="small" />
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={[styles.menuItem]}
                onPress={() => handleNavigate(item.screen)}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.publicSiteButton, { borderColor: colors.border }]}
              onPress={() => {
                const nav = navigation || (global as any).navigationRef?.current;
                if (nav) {
                  nav.navigate('Public', { screen: 'PublicHome' });
                }
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.publicSiteText, { color: colors.text }]}>Public Site</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.error || '#ef4444' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '70%',
    maxWidth: 320,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    flex: 1,
    padding: 24,
  },
  menuItem: {
    paddingVertical: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  publicSiteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  publicSiteText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});


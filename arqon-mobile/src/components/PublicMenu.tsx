// src/components/PublicMenu.tsx - Menu for public navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../store/auth';
import ArqonLogo from './ArqonLogo';

interface PublicMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export default function PublicMenu({ visible, onClose, navigation }: PublicMenuProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
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

  // Get navigation from context if not provided
  const nav = navigation || (global as any).navigationRef?.current;

  const menuItems = [
    { title: 'Catalog', icon: 'grid-outline', screen: 'PublicCatalog', action: 'navigate' },
    { title: 'Services', icon: 'construct-outline', screen: 'PublicHome', action: 'scroll', section: 'services' },
    { title: 'Process', icon: 'build-outline', screen: 'PublicHome', action: 'scroll', section: 'process' },
    { title: 'Projects', icon: 'images-outline', screen: 'PublicHome', action: 'scroll', section: 'projects' },
    { title: 'Contact', icon: 'mail-outline', screen: 'PublicHome', action: 'scroll', section: 'contact' },
  ];

  const handleNavigate = (item: typeof menuItems[0]) => {
    const nav = navigation || (global as any).navigationRef?.current;
    if (item.action === 'navigate') {
      if (nav) {
        nav.navigate('Public', { screen: item.screen });
      }
    } else if (item.action === 'scroll' && item.section) {
      // Navigate to home and scroll to section
      if (nav) {
        nav.navigate('Public', { 
          screen: 'PublicHome',
          params: { scrollTo: item.section }
        });
      }
    }
    onClose();
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
            <ArqonLogo size="small" />
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
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={`${item.screen}-${item.section || ''}`}
                style={styles.menuItem}
                onPress={() => handleNavigate(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Staff Login / Admin Access Section */}
            <View style={[styles.divider, { borderTopColor: colors.border }]}>
              {isAuthenticated ? (
                <TouchableOpacity
                  style={styles.staffLoginItem}
                  onPress={() => {
                    const nav = navigation || (global as any).navigationRef?.current;
                    if (nav) {
                      nav.navigate('Admin', { screen: 'Dashboard' });
                    }
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.staffLoginText, { color: colors.text }]}>Go to Admin</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.staffLoginItem}
                  onPress={() => {
                    const nav = navigation || (global as any).navigationRef?.current;
                    if (nav) {
                      nav.navigate('Public', { screen: 'Login' });
                    }
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.staffLoginText, { color: colors.textSecondary }]}>Staff Login</Text>
                </TouchableOpacity>
              )}
            </View>
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
  divider: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  staffLoginItem: {
    paddingVertical: 12,
  },
  staffLoginText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


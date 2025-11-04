// src/components/DrawerContent.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import CasturaLogo from './CasturaLogo';

interface DrawerContentProps {
  navigation: any;
  state: any;
}

export default function DrawerContent({ navigation, state }: DrawerContentProps) {
  const { colors } = useTheme();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'home-outline',
      route: 'Dashboard',
    },
    {
      name: 'Products',
      icon: 'cube-outline',
      route: 'Products',
    },
    {
      name: 'Recipes',
      icon: 'flask-outline',
      route: 'Recipes',
    },
    {
      name: 'Lab Entries',
      icon: 'beaker-outline',
      route: 'Lab',
    },
    {
      name: 'Settings',
      icon: 'settings-outline',
      route: 'Settings',
    },
  ];

  const handleNavigation = (routeName: string) => {
    navigation.navigate(routeName);
    navigation.closeDrawer();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <CasturaLogo size="medium" />
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Concrete Management
        </Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const isActive = state.routeNames[state.index] === item.route;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                isActive && { backgroundColor: colors.accent }
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={isActive ? colors.text : colors.textSecondary}
              />
              <Text
                style={[
                  styles.menuText,
                  { color: isActive ? colors.text : colors.textSecondary }
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Castura v1.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '300',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
  },
});







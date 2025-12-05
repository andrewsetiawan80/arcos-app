// src/screens/SettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, resetToSeedData } from '../store';
import type { AppState, MobileTheme } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import ArcosLogo from '../components/ArcosLogo';
import AdminHeader from '../components/AdminHeader';
import { forceStackTrace, logError, debugLog } from '../utils/debug';

export default function SettingsScreen({ navigation }: any) {
  const { colors, theme, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appState = await load();
        setState(appState);
      } catch (error) {
        console.error('Failed to load app state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleThemeChange = (newTheme: MobileTheme) => {
    setTheme(newTheme);
  };

  const systemConfigItems = [
    {
      title: 'Materials',
      subtitle: 'Manage raw materials',
      icon: 'library-outline' as const,
      color: colors.warning,
      onPress: () => navigation.navigate('Materials'),
    },
    {
      title: 'Processes',
      subtitle: 'Configure production processes',
      icon: 'settings-outline' as const,
      color: colors.textSecondary,
      onPress: () => navigation.navigate('Processes'),
    },
    {
      title: 'Site Settings',
      subtitle: 'Configure site and catalog settings',
      icon: 'globe-outline' as const,
      color: colors.accent,
      onPress: () => navigation.navigate('CatalogSettings'),
    },
    {
      title: 'Reset to Seed Data',
      subtitle: 'Restore default materials and recipes',
      icon: 'refresh-outline' as const,
      color: colors.error,
      onPress: () => {
        Alert.alert(
          'Reset to Seed Data',
          'This will replace all your current data with the default materials and recipes. Are you sure?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: async () => {
                try {
                  await resetToSeedData();
                  Alert.alert('Success', 'Data has been reset to seed data');
                } catch (error) {
                  Alert.alert('Error', 'Failed to reset data');
                }
              },
            },
          ]
        );
      },
    },
    {
      title: 'Export Data',
      subtitle: 'Backup your data',
      icon: 'download-outline' as const,
      onPress: () => {
        // Export data
        console.log('Export Data');
      },
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Settings"
        subtitle="Configure your app preferences"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >

      {/* Theme Settings */}
        <Card style={{ ...styles.sectionCard, marginTop: 16 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        <View style={styles.themeOptions}>
          {(['light', 'dark'] as MobileTheme[]).map((themeOption) => (
            <TouchableOpacity
              key={themeOption}
              style={[
                styles.themeOption,
                {
                  backgroundColor: theme === themeOption ? colors.text : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleThemeChange(themeOption)}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: theme === themeOption ? colors.background : colors.text,
                  },
                ]}
              >
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* App Settings */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          App Settings
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Receive updates and alerts
              </Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={notifications ? colors.background : colors.textSecondary}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="sync-outline" size={20} color={colors.success} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Auto Sync
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Sync data across devices
              </Text>
            </View>
          </View>
          <Switch
            value={syncEnabled}
            onValueChange={setSyncEnabled}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={syncEnabled ? colors.background : colors.textSecondary}
          />
        </View>
      </Card>

      {/* System Configuration */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          System Configuration
        </Text>
        {systemConfigItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card>

      {/* App Info */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <ArcosLogo size="medium" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            Arcos Mobile
          </Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
            Concrete Management System
          </Text>
        </View>
      </Card>

      {/* Debug Section */}
      {__DEV__ && (
        <View style={styles.section}>
          <Card style={{ ...styles.sectionCard, marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🐛 Debug Tools
            </Text>
            <View style={styles.debugButtons}>
              <TouchableOpacity
                style={[styles.debugButton, { backgroundColor: colors.warning + '20' }]}
                onPress={() => forceStackTrace('Manual stack trace from Settings')}
              >
                <Ionicons name="bug-outline" size={20} color={colors.warning} />
                <Text style={[styles.debugButtonText, { color: colors.warning }]}>
                  Force Stack Trace
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.debugButton, { backgroundColor: colors.error + '20' }]}
                onPress={() => logError('Test error from Settings', 'Debug button pressed')}
              >
                <Ionicons name="warning-outline" size={20} color={colors.error} />
                <Text style={[styles.debugButtonText, { color: colors.error }]}>
                  Test Error Log
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.debugButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => debugLog('Test debug log from Settings', { timestamp: Date.now() })}
              >
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.debugButtonText, { color: colors.primary }]}>
                  Test Debug Log
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  section: {
    padding: 16,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  debugButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  debugButton: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

// src/screens/ProcessesScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save } from '../store';
import type { AppState } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ProcessesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

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

  const processes = [
    { key: 'precast', label: 'Precast Concrete', description: 'Factory-made concrete elements' },
    { key: 'cast-in-place', label: 'Cast-in-Place', description: 'Concrete poured on-site' },
    { key: 'shotcrete', label: 'Shotcrete', description: 'Sprayed concrete application' },
    { key: 'self-compacting', label: 'Self-Compacting', description: 'High-flow concrete mix' },
    { key: 'fiber-reinforced', label: 'Fiber Reinforced', description: 'Concrete with fiber additives' },
    { key: 'high-performance', label: 'High Performance', description: 'Advanced concrete formulations' },
  ];

  const renderProcess = ({ item }: { item: any }) => (
    <Card style={styles.processCard}>
      <View style={styles.processHeader}>
        <View style={styles.processIconContainer}>
          <Ionicons name="build-outline" size={20} color="#607d8b" />
        </View>
        <View style={styles.processInfo}>
          <Text style={[styles.processTitle, { color: colors.text }]}>
            {item.label}
          </Text>
          <Text style={[styles.processDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.processActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#607d8b20' }]}
          >
            <Ionicons name="create-outline" size={16} color="#607d8b" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading processes...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load processes
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.surface, 
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top + 8, 20)
        }
      ]}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="settings-outline" size={24} color="#607d8b" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Processes
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Configure production processes
            </Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={processes}
        renderItem={renderProcess}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(96, 125, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
  },
  processCard: {
    marginBottom: 16,
    padding: 20,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(96, 125, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  processInfo: {
    flex: 1,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  processDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  processActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});







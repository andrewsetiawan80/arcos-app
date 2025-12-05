// src/screens/StudioScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

export default function StudioScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Mix Studio"
        subtitle="Interactive recipe mixing and testing"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* Content */}
        <View style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="flask-outline" size={48} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Mix Studio
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              The Mix Studio is an interactive environment for testing and refining concrete recipes. 
              You can adjust material ratios in real-time and see the impact on properties like strength, 
              workability, and cost.
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>
            Coming Soon
          </Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Mix Studio functionality will be implemented in a future update.
          </Text>
        </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
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
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureCard: {
    padding: 20,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    opacity: 0.8,
  },
});







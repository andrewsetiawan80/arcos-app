// src/screens/CmsPageEditorScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';

export default function CmsPageEditorScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: Math.max(insets.top + 8, 20),
        paddingBottom: 12,
        borderBottomColor: colors.border
      }]}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Page
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Edit website page content
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="document-text-outline" size={48} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Page Editor
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Edit the content, title, and settings for this website page. 
              You can modify the page content, update the title, and configure 
              how it appears to visitors.
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>
            Coming Soon
          </Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Page editor functionality will be implemented in a future update.
          </Text>
        </Card>
      </View>
    </ScrollView>
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







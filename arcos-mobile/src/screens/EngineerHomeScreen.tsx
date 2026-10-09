// src/screens/EngineerHomeScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

export default function EngineerHomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const engineerTools = [
    {
      title: 'Recipes',
      subtitle: 'View and manage product recipes',
      icon: 'flask-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Recipes'),
    },
    {
      title: 'Lab Notebook',
      subtitle: 'Record experiments and mixes',
      icon: 'document-text-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Lab'),
    },
    {
      title: 'Mix Studio',
      subtitle: 'Interactive recipe mixing and testing',
      icon: 'color-palette-outline' as const,
      color: colors.accent,
      onPress: () => navigation.navigate('Studio'),
    },
    {
      title: 'Notifications',
      subtitle: 'View system notifications',
      icon: 'notifications-outline' as const,
      color: colors.warning,
      onPress: () => navigation.navigate('Notifications'),
    },
  ];

  const renderTool = (tool: (typeof engineerTools)[0]) => (
    <Card key={tool.title} style={styles.toolCard} onPress={tool.onPress}>
      <View style={styles.toolHeader}>
        <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}>
          <Ionicons name={tool.icon} size={32} color={tool.color} />
        </View>
        <View style={styles.toolInfo}>
          <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
          <Text style={[styles.toolSubtitle, { color: colors.textSecondary }]}>{tool.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Engineer"
        subtitle="Recipes, Lab & Studio"
        navigation={navigation}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TOOLS</Text>
          {engineerTools.map(renderTool)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
  toolCard: { marginBottom: 12 },
  toolHeader: { flexDirection: 'row', alignItems: 'center' },
  toolIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  toolInfo: { flex: 1 },
  toolTitle: { fontSize: 16, fontWeight: '600' },
  toolSubtitle: { fontSize: 13, marginTop: 2 },
});

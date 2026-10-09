// src/screens/SalesScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

export default function SalesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const clientWorkItems = [
    {
      title: 'Clients',
      subtitle: 'Manage client database',
      icon: 'people-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Clients'),
    },
    {
      title: 'Quotes',
      subtitle: 'Create and manage quotes',
      icon: 'document-text-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Quotes'),
    },
    {
      title: 'Create Proposals',
      subtitle: 'Generate client proposals',
      icon: 'document-text-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Proposals'),
    },
    {
      title: 'Pricing Tools',
      subtitle: 'Calculate costs and pricing',
      icon: 'calculator-outline' as const,
      color: colors.success,
      onPress: () => navigation.navigate('CostCalculator'),
    },
    {
      title: 'Notifications',
      subtitle: 'View system notifications',
      icon: 'notifications-outline' as const,
      color: colors.warning,
      onPress: () => navigation.navigate('Notifications'),
    },
  ];

  const renderSalesItem = (item: any) => (
    <Card key={item.title} style={styles.salesCard} onPress={item.onPress}>
      <View style={styles.salesHeader}>
        <View style={[styles.salesIconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.salesInfo}>
          <Text style={[styles.salesTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.salesSubtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Sales"
        subtitle="Manage proposals and quotes"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* Client Work Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CLIENT WORK
          </Text>
          {clientWorkItems.map(renderSalesItem)}
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  salesCard: {
    marginBottom: 12,
    padding: 16,
  },
  salesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  salesInfo: {
    flex: 1,
  },
  salesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  salesSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
});

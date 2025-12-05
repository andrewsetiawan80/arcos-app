// src/screens/ProposalScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, addProposal } from '../store';
import type { AppState, Proposal } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';

export default function ProposalScreen({ navigation }: any) {
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

  const handleProposalPress = (proposal: Proposal) => {
    // Navigate to proposal detail
    console.log('Proposal pressed:', proposal);
  };

  const handleAddProposal = () => {
    Alert.prompt(
      'Create New Proposal',
      'Enter proposal title:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (title?: string) => {
            if (title && state) {
              try {
                const newProposal = {
                  title: title.trim(),
                  client: '',
                  status: 'draft' as const,
                  total: 0,
                  items: [],
                };
                
                const updatedState = addProposal(state, newProposal);
                setState(updatedState);
                await save(updatedState);
                
                Alert.alert('Success', 'Proposal created successfully!', [
                  { text: 'OK' }
                ]);
              } catch (error) {
                console.error('Failed to create proposal:', error);
                Alert.alert('Error', 'Failed to create proposal. Please try again.');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return colors.textSecondary;
      case 'sent': return '#2196f3';
      case 'reviewed': return '#ff9800';
      case 'won': return '#4caf50';
      case 'lost': return '#f44336';
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'document-outline';
      case 'sent': return 'send-outline';
      case 'reviewed': return 'eye-outline';
      case 'won': return 'checkmark-circle-outline';
      case 'lost': return 'close-circle-outline';
      default: return 'document-outline';
    }
  };

  const renderProposal = ({ item }: { item: Proposal }) => (
    <Card style={styles.proposalCard} onPress={() => handleProposalPress(item)}>
      <View style={styles.proposalHeader}>
        <View style={styles.proposalIconContainer}>
          <Ionicons name="document-text-outline" size={20} color="#ffbb33" />
        </View>
        <View style={styles.proposalInfo}>
          <Text style={[styles.proposalTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.proposalClient, { color: colors.textSecondary }]}>
            {item.client || 'No client'}
          </Text>
        </View>
        <View style={styles.proposalActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons
              name={getStatusIcon(item.status) as any}
              size={12}
              color={getStatusColor(item.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.proposalFooter}>
        <View style={styles.proposalStats}>
          <View style={styles.statItem}>
            <Ionicons name="list-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.items?.length || 0} items
            </Text>
          </View>
          {item.total && item.total > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                Rp {(item.total || 0).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.updatedAt, { color: colors.textSecondary }]}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading proposals...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load proposals
        </Text>
      </View>
    );
  }

  const proposals = state.proposals || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Proposals"
        subtitle="Client proposals and quotes"
        navigation={navigation}
        rightAction={{
          icon: 'add',
          onPress: handleAddProposal,
        }}
      />

      {proposals.length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: 80 + insets.bottom }]}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Proposals Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create your first client proposal
          </Text>
          <TouchableOpacity
            onPress={handleAddProposal}
            style={[styles.createProposalButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.background} />
            <Text style={[styles.createProposalButtonText, { color: colors.background }]}>
              Create Proposal
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={proposals}
          renderItem={renderProposal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    backgroundColor: 'rgba(255, 187, 51, 0.1)',
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
  addButton: {
    padding: 8,
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
  proposalCard: {
    marginBottom: 16,
    padding: 20,
  },
  proposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  proposalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 187, 51, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  proposalInfo: {
    flex: 1,
  },
  proposalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  proposalClient: {
    fontSize: 14,
    fontWeight: '500',
  },
  proposalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  proposalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proposalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updatedAt: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  createProposalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 200,
  },
  createProposalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

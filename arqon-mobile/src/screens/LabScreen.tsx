// src/screens/LabScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save } from '../store';
import type { AppState, LabEntry } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';
import ArqonLogo from '../components/ArqonLogo';

export default function LabScreen({ navigation }: any) {
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

  const handleLabEntryPress = (entry: LabEntry) => {
    // Navigate to lab entry editor (matching web app /app/lab/:id)
    navigation.navigate('LabEntryEditor', { entry });
  };

  const handleAddLabEntry = () => {
    // Navigate to new lab entry editor (matching web app /app/lab/new)
    navigation.navigate('LabEntryEditor', { 
      entry: null // null indicates creating a new entry
    });
  };

  const handleAddLabEntryWithPrompt = () => {
    Alert.prompt(
      'Add New Lab Entry',
      'Enter entry title:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (title?: string) => {
            if (title && state) {
              const newEntry: LabEntry = {
                id: Math.random().toString(36).slice(2, 10),
                title: title.trim(),
                status: 'draft',
                notes: '',
                images: [],
                videos: [],
                attachments: [],
                modifications: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              
              const updatedState = {
                ...state,
                labEntries: [...(state.labEntries || []), newEntry],
              };
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteLabEntry = (entry: LabEntry) => {
    Alert.alert(
      'Delete Lab Entry',
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (state) {
              const updatedState = {
                ...state,
                labEntries: (state.labEntries || []).filter(e => e.id !== entry.id),
              };
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return colors.textSecondary;
      case 'promising': return colors.text;
      case 'candidate': return colors.text;
      case 'promoted': return colors.text;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'document-outline';
      case 'promising': return 'star-outline';
      case 'candidate': return 'checkmark-circle-outline';
      case 'promoted': return 'trophy-outline';
      default: return 'document-outline';
    }
  };

  const renderLabEntry = ({ item }: { item: LabEntry }) => (
    <Card style={styles.entryCard} onPress={() => handleLabEntryPress(item)}>
      <View style={styles.entryHeader}>
        <View style={styles.entryIconContainer}>
          <Ionicons name="beaker-outline" size={20} color="#ff4444" />
        </View>
        <View style={styles.entryInfo}>
          <Text style={[styles.entryTitle, { color: colors.text }]}>
            {item.title}
          </Text>
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
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteLabEntry(item);
          }}
          style={[styles.actionButton, { backgroundColor: '#ff444420' }]}
        >
          <Ionicons name="trash-outline" size={16} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      {item.notes && (
        <Text style={[styles.entryNotes, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
      
      <View style={styles.entryFooter}>
        <View style={styles.mediaInfo}>
          {item.images && item.images.length > 0 && (
            <View style={styles.mediaItem}>
              <Ionicons name="image-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.mediaText, { color: colors.textSecondary }]}>
                {item.images.length}
              </Text>
            </View>
          )}
          {item.videos && item.videos.length > 0 && (
            <View style={styles.mediaItem}>
              <Ionicons name="videocam-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.mediaText, { color: colors.textSecondary }]}>
                {item.videos.length}
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
          Loading lab entries...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load lab entries
        </Text>
      </View>
    );
  }

  const labEntries = state.labEntries || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Lab Trials"
        subtitle="Document your concrete experiments and test results"
        navigation={navigation}
        rightAction={{
          icon: 'add',
          onPress: handleAddLabEntry,
        }}
      />

      {/* Research & Testing Section */}
      <View style={styles.researchSection}>
        <Card style={styles.researchCard}>
          <Text style={[styles.researchTitle, { color: colors.text }]}>
            Research & Testing
          </Text>
          <View style={styles.researchItems}>
            <TouchableOpacity
              style={[styles.researchItem, { backgroundColor: colors.primary + '20' }]}
              onPress={() => navigation.navigate('Ideas')}
            >
              <Ionicons name="bulb-outline" size={24} color={colors.primary} />
              <Text style={[styles.researchItemText, { color: colors.primary }]}>
                Experiment Ideas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.researchItem, { backgroundColor: colors.success + '20' }]}
              onPress={() => {
                // Already on Lab Notebook, just scroll to top or show current view
              }}
            >
              <Ionicons name="beaker-outline" size={24} color={colors.success} />
              <Text style={[styles.researchItemText, { color: colors.success }]}>
                Lab Notebook
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {labEntries.length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: 80 + insets.bottom }]}>
          <Ionicons name="beaker-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No entries yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Click "New Entry" to get started.
          </Text>
          <TouchableOpacity
            onPress={handleAddLabEntry}
            style={[styles.createEntryButton, { backgroundColor: '#ffffff', borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color="#000000" />
            <Text style={[styles.createEntryButtonText, { color: '#000000' }]}>
              New Entry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={labEntries}
          renderItem={renderLabEntry}
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
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
    paddingTop: 4,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    maxWidth: 200, // Constrain width to force text wrapping
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
    marginLeft: 12,
    marginTop: 4,
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
  entryCard: {
    marginBottom: 16,
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  entryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryNotes: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaText: {
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
  createEntryButton: {
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
  createEntryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  researchSection: {
    padding: 16,
  },
  researchCard: {
    padding: 16,
  },
  researchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  researchItems: {
    flexDirection: 'row',
    gap: 12,
  },
  researchItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  researchItemText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

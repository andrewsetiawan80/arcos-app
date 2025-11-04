// src/screens/LabEntryEditorScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, addLabEntry } from '../store';
import type { AppState, LabEntry } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function LabEntryEditorScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const entry = route?.params?.entry;
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedEntry, setEditedEntry] = useState<LabEntry | null>(
    entry || {
      id: Math.random().toString(36).slice(2, 10),
      title: '',
      status: 'draft' as const,
      process: 'precast',
      summary: '',
      modifications: [],
      media: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

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

  const handleSave = async () => {
    if (!state || !editedEntry) return;

    let updatedState: AppState;
    const isNewEntry = !entry; // If no original entry, it's a new one

    if (isNewEntry) {
      // Create new lab entry
      updatedState = addLabEntry(state, editedEntry);
    } else {
      // Update existing lab entry
      const updatedEntry = {
        ...editedEntry,
        updatedAt: new Date().toISOString(),
      };

      updatedState = {
        ...state,
        labEntries: (state.labEntries || []).map(e => 
          e.id === editedEntry.id ? updatedEntry : e
        ),
      };
    }
    
    setState(updatedState);
    await save(updatedState);
    
    Alert.alert('Success', isNewEntry ? 'Lab entry created successfully' : 'Lab entry updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleStatusChange = (status: string) => {
    if (!editedEntry) return;
    setEditedEntry({ ...editedEntry, status: status as any });
  };

  const handleAddModification = () => {
    if (!editedEntry) return;
    
    Alert.prompt(
      'Add Modification',
      'Enter modification name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (name?: string) => {
            if (name && editedEntry) {
              const newModification = {
                materialId: Math.random().toString(36).slice(2, 10), // Temporary ID
                amount: 0,
                notes: name.trim(),
              };
              setEditedEntry({
                ...editedEntry,
                modifications: [...(editedEntry.modifications || []), newModification],
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleRemoveModification = (index: number) => {
    if (!editedEntry) return;
    
    Alert.alert(
      'Remove Modification',
      'Are you sure you want to remove this modification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (editedEntry) {
              const newModifications = (editedEntry.modifications || []).filter((_, i) => i !== index);
              setEditedEntry({ ...editedEntry, modifications: newModifications });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading lab entry editor...
        </Text>
      </View>
    );
  }

  if (!editedEntry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          No entry data available
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load data
        </Text>
      </View>
    );
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: 'document-outline' },
    { value: 'promising', label: 'Promising', icon: 'star-outline' },
    { value: 'candidate', label: 'Candidate', icon: 'checkmark-circle-outline' },
    { value: 'promoted', label: 'Promoted', icon: 'trophy-outline' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {entry ? 'Edit Lab Entry' : 'New Lab Entry'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {editedEntry.title || 'Untitled entry'}
        </Text>
      </View>

      {/* Basic Information */}
      <Card style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Basic Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Title
          </Text>
          <Input
            value={editedEntry.title}
            onChangeText={(title) => setEditedEntry({ ...editedEntry, title })}
            placeholder="Enter entry title"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Status
          </Text>
          <View style={styles.statusOptions}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  { 
                    backgroundColor: editedEntry.status === option.value ? colors.text : colors.surface,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleStatusChange(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={editedEntry.status === option.value ? '#0a0a0a' : colors.text}
                />
                <Text style={[
                  styles.statusOptionText,
                  { color: editedEntry.status === option.value ? '#0a0a0a' : colors.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Notes
          </Text>
          <Input
            value={editedEntry.notes}
            onChangeText={(notes) => setEditedEntry({ ...editedEntry, notes })}
            placeholder="Enter notes and observations"
            style={styles.input}
            multiline
            numberOfLines={4}
          />
        </View>
      </Card>

      {/* Modifications */}
      <Card style={styles.modificationsCard}>
        <View style={styles.modificationsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Modifications ({(editedEntry.modifications || []).length})
          </Text>
          <Button
            title="Add Modification"
            onPress={handleAddModification}
            size="small"
            variant="outline"
          />
        </View>

        {(editedEntry.modifications || []).length === 0 ? (
          <View style={styles.emptyModifications}>
            <Ionicons name="add-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No modifications added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Track material changes and adjustments
            </Text>
          </View>
        ) : (
          <View style={styles.modificationsList}>
            {(editedEntry.modifications || []).map((modification, index) => (
              <View key={index} style={styles.modificationRow}>
                <View style={styles.modificationInfo}>
                  <Text style={[styles.modificationName, { color: colors.text }]}>
                    {modification.notes || 'Modification'}
                  </Text>
                  <Text style={[styles.modificationAmount, { color: colors.textSecondary }]}>
                    {modification.amount} kg
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveModification(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Media Information */}
      <Card style={styles.mediaCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Media
        </Text>
        
        <View style={styles.mediaInfo}>
          <View style={styles.mediaItem}>
            <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.mediaText, { color: colors.textSecondary }]}>
              {editedEntry.images?.length || 0} images
            </Text>
          </View>
          
          <View style={styles.mediaItem}>
            <Ionicons name="videocam-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.mediaText, { color: colors.textSecondary }]}>
              {editedEntry.videos?.length || 0} videos
            </Text>
          </View>
          
          <View style={styles.mediaItem}>
            <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.mediaText, { color: colors.textSecondary }]}>
              {editedEntry.attachments?.length || 0} attachments
            </Text>
          </View>
        </View>
        
        <Text style={[styles.mediaNote, { color: colors.textSecondary }]}>
          Media upload functionality will be implemented in a future update
        </Text>
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Save Entry"
          onPress={handleSave}
          style={styles.saveButton}
        />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
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
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modificationsCard: {
    margin: 16,
    marginTop: 0,
  },
  modificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyModifications: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
  modificationsList: {
    gap: 12,
  },
  modificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  modificationInfo: {
    flex: 1,
  },
  modificationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  modificationAmount: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  mediaCard: {
    margin: 16,
    marginTop: 0,
  },
  mediaInfo: {
    gap: 12,
    marginBottom: 16,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mediaText: {
    fontSize: 16,
  },
  mediaNote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

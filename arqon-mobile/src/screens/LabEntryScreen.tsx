// src/screens/LabEntryScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import type { LabEntry } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';

export default function LabEntryScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { entry }: { entry: LabEntry } = route.params;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title={entry.title}
        subtitle="Lab entry details"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon(entry.status) as any}
            size={16}
            color={getStatusColor(entry.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(entry.status) }]}>
            {entry.status}
          </Text>
        </View>

        <Card style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Entry Information
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Status:
          </Text>
          <Text style={[styles.infoValue, { color: getStatusColor(entry.status) }]}>
            {entry.status}
          </Text>
        </View>
        {entry.baseRecipeId && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Base Recipe:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {entry.baseRecipeId}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Created:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(entry.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Updated:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(entry.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>

      {entry.notes && (
        <Card style={styles.notesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notes
          </Text>
          <Text style={[styles.notes, { color: colors.text }]}>
            {entry.notes}
          </Text>
        </Card>
      )}

      {entry.images && entry.images.length > 0 && (
        <Card style={styles.mediaCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Images ({entry.images.length})
          </Text>
          {entry.images.map((image, index) => (
            <View key={index} style={styles.mediaItem}>
              <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.mediaText, { color: colors.text }]}>
                {image}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {entry.videos && entry.videos.length > 0 && (
        <Card style={styles.mediaCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Videos ({entry.videos.length})
          </Text>
          {entry.videos.map((video, index) => (
            <View key={index} style={styles.mediaItem}>
              <Ionicons name="videocam-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.mediaText, { color: colors.text }]}>
                {video}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {entry.attachments && entry.attachments.length > 0 && (
        <Card style={styles.mediaCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Attachments ({entry.attachments.length})
          </Text>
          {entry.attachments.map((attachment, index) => (
            <View key={index} style={styles.mediaItem}>
              <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.mediaText, { color: colors.text }]}>
                {attachment}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {entry.modifications && entry.modifications.length > 0 && (
        <Card style={styles.modificationsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Modifications ({entry.modifications.length})
          </Text>
          {entry.modifications.map((mod, index) => (
            <View key={index} style={styles.modificationItem}>
              <View style={styles.modificationInfo}>
                <Text style={[styles.modificationId, { color: colors.text }]}>
                  {mod.materialId}
                </Text>
                {mod.notes && (
                  <Text style={[styles.modificationNotes, { color: colors.textSecondary }]}>
                    {mod.notes}
                  </Text>
                )}
              </View>
              <Text style={[styles.modificationAmount, { color: colors.text }]}>
                {mod.amount}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Edit Entry"
          onPress={() => {
            navigation.navigate('LabEntryEditor', { entry });
          }}
          style={styles.editButton}
        />
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  mediaCard: {
    margin: 16,
    marginTop: 0,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mediaText: {
    fontSize: 14,
    flex: 1,
  },
  modificationsCard: {
    margin: 16,
    marginTop: 0,
  },
  modificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modificationInfo: {
    flex: 1,
  },
  modificationId: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  modificationNotes: {
    fontSize: 14,
  },
  modificationAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 16,
  },
  editButton: {
    marginBottom: 0,
  },
});

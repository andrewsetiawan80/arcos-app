// src/screens/NotificationsScreen.tsx - List notifications from backend
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../lib/api';
import AdminHeader from '../components/AdminHeader';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const res = await api.getNotifications();
    if (res.data) setItems(res.data as Notification[]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    setItems(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <AdminHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        navigation={navigation}
      />
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={markAllRead}
          style={[styles.markAllBtn, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="checkmark-done-outline" size={18} color={colors.text} />
          <Text style={[styles.markAllText, { color: colors.text }]}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
          />
        }
      >
        {loading ? (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No notifications
          </Text>
        ) : (
          items.map(n => (
            <TouchableOpacity
              key={n.id}
              onPress={() => !n.read && markRead(n.id)}
              style={[
                styles.item,
                {
                  backgroundColor: n.read ? colors.surface : colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.itemHeader}>
                <Text
                  style={[styles.title, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {n.title}
                </Text>
                {!n.read && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text
                style={[styles.message, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {n.message}
              </Text>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {new Date(n.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  item: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    marginTop: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});

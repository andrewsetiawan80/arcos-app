import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../lib/api';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

interface Quote {
  id: string;
  title: string;
  client_name: string | null;
  status: string;
  total: number;
  share_token: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  sent: '#2196f3',
  approved: '#22c55e',
  rejected: '#ef4444',
};

export default function QuotesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.getQuotes();
    if (res.data) setQuotes(res.data as Quote[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const fmtCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const remove = (id: string) => {
    Alert.alert('Delete Quote', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.deleteQuote(id);
        load();
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader title="Quotes" subtitle={`${quotes.length} total`} navigation={navigation} />
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Card style={styles.quoteCard} onPress={() => navigation.navigate('QuoteEditor', { quoteId: item.id })}>
            <Text style={[styles.quoteTitle, { color: colors.text }]}>{item.title}</Text>
            {item.client_name && <Text style={[styles.quoteClient, { color: colors.textSecondary }]}>{item.client_name}</Text>}
            <View style={styles.quoteMeta}>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || STATUS_COLORS.draft) + '30' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || STATUS_COLORS.draft }]}>{item.status}</Text>
              </View>
              <Text style={[styles.quoteTotal, { color: colors.textSecondary }]}>{fmtCurrency(item.total)}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(item.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.error || '#ef4444'} />
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={[styles.empty, { color: colors.textSecondary }]}>No quotes yet.</Text> : null}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 24 + insets.bottom }]}
        onPress={() => navigation.navigate('QuoteEditor', { quoteId: null })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  quoteCard: { marginBottom: 12, position: 'relative' },
  quoteTitle: { fontWeight: '600', fontSize: 16 },
  quoteClient: { fontSize: 14, marginTop: 4 },
  quoteMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  quoteTotal: { fontSize: 14 },
  deleteBtn: { position: 'absolute', top: 12, right: 12, padding: 8 },
  empty: { textAlign: 'center', padding: 24 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

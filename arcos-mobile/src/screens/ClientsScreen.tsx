import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../lib/api';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
}

export default function ClientsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.getClients();
    if (res.data) setClients(res.data as Client[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter(c =>
    `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader title="Clients" subtitle={`${clients.length} total`} navigation={navigation} />
      <View style={[styles.searchRow, { borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search clients..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Card style={styles.clientCard} onPress={() => navigation.navigate('ClientEditor', { clientId: item.id })}>
            <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
            {item.company && <Text style={[styles.clientCompany, { color: colors.textSecondary }]}>{item.company}</Text>}
            {(item.email || item.phone) && (
              <Text style={[styles.clientMeta, { color: colors.textSecondary }]}>
                {item.email || ''} {item.phone ? ` • ${item.phone}` : ''}
              </Text>
            )}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={[styles.empty, { color: colors.textSecondary }]}>No clients found.</Text> : null}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 24 + insets.bottom }]}
        onPress={() => navigation.navigate('ClientEditor', { clientId: null })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  clientCard: { marginBottom: 12 },
  clientName: { fontWeight: '600', fontSize: 16 },
  clientCompany: { fontSize: 14, marginTop: 4 },
  clientMeta: { fontSize: 12, marginTop: 4 },
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

import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../lib/api';
import AdminHeader from '../components/AdminHeader';

export default function QuoteEditorScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const quoteId = route.params?.quoteId;
  const isNew = !quoteId;

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<{ description: string; qty: number; unit: string; unit_price: number }[]>([{ description: '', qty: 1, unit: 'm²', unit_price: 0 }]);
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getClients().then((r) => { if (r.data) setClients(r.data as any[]); });
    if (!isNew) {
      api.getQuote(quoteId).then((r) => {
        if (r.data) {
          const q = r.data as any;
          setTitle(q.title); setClientId(q.client_id || ''); setNotes(q.notes || ''); setStatus(q.status);
          if (q.items?.length) setItems(q.items.map((i: any) => ({ description: i.description, qty: i.qty, unit: i.unit, unit_price: i.unit_price })));
        }
      });
    }
  }, [quoteId]);

  const total = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const fmtCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const addItem = () => setItems([...items, { description: '', qty: 1, unit: 'm²', unit_price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: any) => {
    const copy = [...items]; copy[i] = { ...copy[i], [field]: val }; setItems(copy);
  };

  const save = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    setSaving(true);
    const payload = { title, client_id: clientId || null, notes, status, items };
    if (isNew) {
      const r = await api.createQuote(payload);
      if (r.data) navigation.replace('QuoteEditor', { quoteId: (r.data as any).id });
      else Alert.alert('Error', r.error || 'Failed to create quote');
    } else {
      const r = await api.updateQuote(quoteId, payload);
      if (!r.error) navigation.goBack();
      else Alert.alert('Error', r.error || 'Failed to update quote');
    }
    setSaving(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader title={isNew ? 'New Quote' : 'Edit Quote'} navigation={navigation} rightAction={{ icon: 'checkmark', onPress: save }} />
      <ScrollView style={styles.form} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Quote title" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Client</Text>
        <View style={[styles.picker, { borderColor: colors.border }]}>
          <Text style={[styles.pickerText, { color: colors.text }]}>
            {clients.find(c => c.id === clientId)?.name || 'No client'}
          </Text>
        </View>
        <View style={styles.clientPicker}>
          {clients.slice(0, 5).map((c) => (
            <TouchableOpacity key={c.id} onPress={() => setClientId(clientId === c.id ? '' : c.id)} style={[styles.clientChip, { backgroundColor: clientId === c.id ? colors.primary + '40' : colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.clientChipText, { color: colors.text }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
        <View style={styles.statusRow}>
          {['draft', 'sent', 'approved', 'rejected'].map((s) => (
            <TouchableOpacity key={s} onPress={() => setStatus(s)} style={[styles.statusChip, { backgroundColor: status === s ? colors.primary + '40' : colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statusChipText, { color: colors.text }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Line Items</Text>
        {items.map((it, i) => (
          <View key={i} style={[styles.itemRow, { borderColor: colors.border }]}>
            <TextInput value={it.description} onChangeText={(v) => updateItem(i, 'description', v)} placeholder="Description" placeholderTextColor={colors.textSecondary} style={[styles.itemDesc, { color: colors.text }]} />
            <TextInput value={String(it.qty)} onChangeText={(v) => updateItem(i, 'qty', +v || 0)} style={[styles.itemQty, { color: colors.text }]} keyboardType="numeric" />
            <TextInput value={it.unit} onChangeText={(v) => updateItem(i, 'unit', v)} style={[styles.itemUnit, { color: colors.text }]} />
            <TextInput value={String(it.unit_price)} onChangeText={(v) => updateItem(i, 'unit_price', +v || 0)} style={[styles.itemPrice, { color: colors.text }]} keyboardType="numeric" />
            <TouchableOpacity onPress={() => removeItem(i)}><Ionicons name="trash-outline" size={18} color={colors.textSecondary} /></TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addItem} style={[styles.addItemBtn, { borderColor: colors.border }]}>
          <Ionicons name="add" size={18} color={colors.textSecondary} />
          <Text style={[styles.addItemText, { color: colors.textSecondary }]}>Add Item</Text>
        </TouchableOpacity>
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{fmtCurrency(total)}</Text>
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Quote'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  picker: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  pickerText: { fontSize: 16 },
  clientPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  clientChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  clientChipText: { fontSize: 14 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  statusChipText: { fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, padding: 8, borderWidth: 1, borderRadius: 8 },
  itemDesc: { flex: 1, fontSize: 14 },
  itemQty: { width: 50, fontSize: 14, textAlign: 'right' },
  itemUnit: { width: 50, fontSize: 14, textAlign: 'center' },
  itemPrice: { width: 80, fontSize: 14, textAlign: 'right' },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderRadius: 8, borderStyle: 'dashed', marginBottom: 16 },
  addItemText: { fontSize: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, marginTop: 8, borderTopWidth: 1 },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '600' },
  saveBtn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

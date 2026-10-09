import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../lib/api';
import AdminHeader from '../components/AdminHeader';

export default function ClientEditorScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const clientId = route.params?.clientId;
  const isNew = !clientId;

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.getClient(clientId).then((r) => {
        if (r.data) {
          const c = r.data as any;
          setName(c.name || '');
          setCompany(c.company || '');
          setEmail(c.email || '');
          setPhone(c.phone || '');
          setAddress(c.address || '');
          setNotes(c.notes || '');
        }
      });
    }
  }, [clientId]);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    const payload = { name: name.trim(), company: company || null, email: email || null, phone: phone || null, address: address || null, notes: notes || null };
    if (isNew) {
      const r = await api.createClient(payload);
      if (r.data) nav();
      else Alert.alert('Error', r.error || 'Failed to create client');
    } else {
      const r = await api.updateClient(clientId, payload);
      if (!r.error) nav();
      else Alert.alert('Error', r.error || 'Failed to update client');
    }
    setSaving(false);
  };

  const nav = () => navigation.goBack();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title={isNew ? 'New Client' : 'Edit Client'}
        navigation={navigation}
        rightAction={{ icon: 'checkmark', onPress: save }}
      />
      <ScrollView style={styles.form} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Name *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Company</Text>
        <TextInput value={company} onChangeText={setCompany} placeholder="Company" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textSecondary} keyboardType="email-address" style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
        <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} multiline />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={colors.textSecondary} style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]} multiline />
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
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
  textArea: { minHeight: 80 },
  saveBtn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
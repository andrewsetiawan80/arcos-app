// src/screens/LoginScreen.tsx - Simple login screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../store/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import ArqonLogo from '../components/ArqonLogo';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@arqon.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Navigate to Admin after successful login
        navigation.navigate('Admin', { screen: 'Dashboard' });
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ArqonLogo size="large" style={{ marginBottom: 40 }} />
        <Text style={[styles.title, { color: colors.text }]}>Admin Login</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your credentials to access admin functions
        </Text>
        
        <View style={styles.form}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginBottom: 20 }}
          />
          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            variant="primary"
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


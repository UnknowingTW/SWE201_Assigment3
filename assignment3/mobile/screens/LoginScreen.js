// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { COLORS } from '../utils/constants';

// Validation rules for the login form
function validate(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Password is required';
  return errors;
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useForm({ email: '', password: '' }, validate);

  const onSubmit = async () => {
    await handleSubmit(async (vals) => {
      try {
        await login(vals.email.trim(), vals.password);
        // Navigation happens automatically via AppNavigator reacting to auth state
      } catch (err) {
        Alert.alert('Login Failed', err.message);
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo / heading */}
        <View style={styles.hero}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
          <Text style={styles.title}>Task Manager</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, touched.email && errors.email && styles.inputError]}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.border}
            keyboardType="email-address"
            autoCapitalize="none"
            value={values.email}
            onChangeText={(v) => handleChange('email', v)}
            onBlur={() => handleBlur('email')}
          />
          {touched.email && errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.flex, touched.password && errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.border}
              secureTextEntry={!showPassword}
              value={values.password}
              onChangeText={(v) => handleChange('password', v)}
              onBlur={() => handleBlur('password')}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? 'Signing in…' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginBottom: 40, gap: 8 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.dark },
  subtitle: { fontSize: 15, color: COLORS.gray },
  fieldGroup: { marginBottom: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.dark,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { fontSize: 12, color: COLORS.danger },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.gray, fontSize: 14 },
  linkText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});

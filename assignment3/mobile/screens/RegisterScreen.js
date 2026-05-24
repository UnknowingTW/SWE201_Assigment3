// screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { COLORS } from '../utils/constants';

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = 'Enter a valid email address';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (values.password !== values.confirm) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useForm({ name: '', email: '', password: '', confirm: '' }, validate);

  const onSubmit = async () => {
    await handleSubmit(async (vals) => {
      try {
        await register(vals.name.trim(), vals.email.trim(), vals.password);
      } catch (err) {
        Alert.alert('Registration Failed', err.message);
      }
    });
  };

  const Field = ({ label, field, placeholder, keyboardType, secure }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.flex, touched[field] && errors[field] && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.border}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={field === 'name' ? 'words' : 'none'}
          secureTextEntry={secure && !showPassword}
          value={values[field]}
          onChangeText={(v) => handleChange(field, v)}
          onBlur={() => handleBlur(field)}
        />
        {secure && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>
      {touched[field] && errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Ionicons name="person-add" size={56} color={COLORS.primary} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start managing your tasks</Text>
        </View>

        <Field label="Full Name"     field="name"     placeholder="Your name" />
        <Field label="Email"         field="email"    placeholder="you@example.com" keyboardType="email-address" />
        <Field label="Password"      field="password" placeholder="Min. 6 characters" secure />
        <Field label="Confirm Password" field="confirm" placeholder="Repeat password" secure />

        <TouchableOpacity
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? 'Creating account…' : 'Register'}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, backgroundColor: COLORS.background },
  hero: { alignItems: 'center', marginVertical: 32, gap: 8 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.dark },
  subtitle: { fontSize: 15, color: COLORS.gray },
  fieldGroup: { marginBottom: 14, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  inputRow: { flexDirection: 'row', gap: 8 },
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

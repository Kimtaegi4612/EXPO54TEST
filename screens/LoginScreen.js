import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('이메일과 비밀번호를 입력해요');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      Alert.alert(
        isLogin ? '로그인 실패' : '가입 실패',
        isLogin ? '이메일 또는 비밀번호를 확인해요' : '이미 있는 계정이거나 비밀번호가 6자 이상이어야 해요'
      );
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.top}>
        <Text style={styles.emoji}>💑</Text>
        <Text style={styles.title}>우리 둘만의 공간</Text>
        <Text style={styles.subtitle}>함께하는 모든 순간을 기록해요</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 (6자 이상)"
          placeholderTextColor="#ccc"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    padding: 24,
  },
  top: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 70, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#E75480', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#bbb' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#E75480',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: { backgroundColor: '#E75480' },
  toggleText: { fontSize: 14, color: '#ccc', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#FFF8FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE0EC',
  },
  button: {
    backgroundColor: '#E75480',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
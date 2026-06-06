import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해요');
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('가입 완료', '회원가입이 됐어요!');
    } catch (error) {
      Alert.alert('가입 실패', '이미 있는 계정이거나 비밀번호가 6자 이상이어야 해요');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💑</Text>
      <Text style={styles.title}>우리 둘만의 공간</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonOutline} onPress={handleSignUp}>
        <Text style={styles.buttonOutlineText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E75480', marginBottom: 40 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#f0c0d0',
  },
  button: {
    width: '100%',
    backgroundColor: '#E75480',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonOutline: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E75480',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonOutlineText: { color: '#E75480', fontSize: 16, fontWeight: 'bold' },
});
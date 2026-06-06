import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function NicknameScreen({ onComplete }) {
  const [nickname, setNickname] = useState('');

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('닉네임을 입력해요');
      return;
    }
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      nickname: nickname.trim(),
    });
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconBox}>
          <Ionicons name="person-circle-outline" size={80} color="#C2185B" />
        </View>
        <Text style={styles.title}>닉네임 설정</Text>
        <Text style={styles.subtitle}>상대방에게 보여질 이름이에요</Text>

        <TextInput
          style={styles.input}
          placeholder="닉네임 입력"
          placeholderTextColor="#BDBDBD"
          value={nickname}
          onChangeText={setNickname}
          maxLength={10}
          autoFocus
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  inner: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  iconBox: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#212121', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#BDBDBD', marginBottom: 40 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    textAlign: 'center',
    color: '#212121',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    width: '100%',
    backgroundColor: '#C2185B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Share, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function CoupleConnectScreen({ onConnected }) {
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateMyCode();
  }, []);

  const generateMyCode = async () => {
    const uid = auth.currentUser.uid;
    const code = uid.slice(0, 6).toUpperCase();
    setMyCode(code);
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: auth.currentUser.email,
      coupleCode: code,
    }, { merge: true });
  };

  const shareCode = async () => {
    await Share.share({ message: `커플앱 초대 코드: ${myCode}` });
  };

  const connectCouple = async () => {
    if (inputCode.length < 6) {
      Alert.alert('코드를 입력해요');
      return;
    }
    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('coupleCode', '==', inputCode.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('없는 코드예요', '코드를 다시 확인해요');
        setLoading(false);
        return;
      }

      const partnerDoc = snapshot.docs[0];
      const partnerId = partnerDoc.id;

      if (partnerId === uid) {
        Alert.alert('본인 코드예요', '상대방 코드를 입력해요');
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, 'users', uid), { partnerId });
      await updateDoc(doc(db, 'users', partnerId), { partnerId: uid });

      Alert.alert('연결 완료! 💑', '커플 연결이 됐어요!');
      onConnected();
    } catch (e) {
      Alert.alert('오류', '다시 시도해요');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.top}>
          <Text style={styles.emoji}>💑</Text>
          <Text style={styles.title}>커플 연결</Text>
          <Text style={styles.subtitle}>코드를 공유해서 연결해요</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>내 초대 코드</Text>
          <Text style={styles.code}>{myCode}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={shareCode}>
            <Text style={styles.shareText}>코드 공유하기 📤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>상대방 코드 입력</Text>
          <TextInput
            style={styles.input}
            placeholder="6자리 코드"
            placeholderTextColor="#ccc"
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={connectCouple}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? '연결 중...' : '연결하기 💕'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  top: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#E75480', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#bbb' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#E75480',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 12, color: '#bbb', marginBottom: 10, fontWeight: '600' },
  code: {
    fontSize: 38,
    fontWeight: '800',
    color: '#E75480',
    letterSpacing: 8,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E75480',
  },
  shareText: { color: '#E75480', fontWeight: '700', fontSize: 14 },
  input: {
    width: '100%',
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    padding: 16,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 6,
    color: '#333',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#E75480',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutButton: { alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#ddd', fontSize: 13 },
});
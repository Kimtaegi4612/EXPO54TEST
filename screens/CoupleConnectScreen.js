import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function CoupleConnectScreen({ onConnected }) {
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');

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
    try {
      const uid = auth.currentUser.uid;
      const usersRef = doc(db, 'users', uid);

      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('coupleCode', '==', inputCode.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('없는 코드예요', '코드를 다시 확인해요');
        return;
      }

      const partnerDoc = snapshot.docs[0];
      const partnerId = partnerDoc.id;

      if (partnerId === uid) {
        Alert.alert('본인 코드예요', '상대방 코드를 입력해요');
        return;
      }

      await updateDoc(usersRef, { partnerId });
      await updateDoc(doc(db, 'users', partnerId), { partnerId: uid });

      Alert.alert('연결 완료! 💑', '커플 연결이 됐어요!');
      onConnected();
    } catch (e) {
      Alert.alert('오류', '다시 시도해요');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💑</Text>
      <Text style={styles.title}>커플 연결</Text>

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
          placeholder="코드 6자리 입력"
          value={inputCode}
          onChangeText={setInputCode}
          autoCapitalize="characters"
          maxLength={6}
        />
        <TouchableOpacity style={styles.button} onPress={connectCouple}>
          <Text style={styles.buttonText}>연결하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutButton}>
        <Text style={styles.logoutText}>로그아웃</Text>
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#E75480', marginBottom: 30 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0c0d0',
  },
  label: { fontSize: 14, color: '#999', marginBottom: 10 },
  code: { fontSize: 36, fontWeight: 'bold', color: '#E75480', letterSpacing: 6, marginBottom: 15 },
  shareButton: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E75480',
  },
  shareText: { color: '#E75480', fontWeight: 'bold' },
  input: {
    width: '100%',
    backgroundColor: '#FFF5F7',
    borderRadius: 12,
    padding: 15,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: '#f0c0d0',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#E75480',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    marginTop: 20,
    padding: 10,
  },
  logoutText: {
    color: '#ccc',
    fontSize: 14,
  },
});
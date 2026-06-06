import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {
  const [startDate, setStartDate] = useState(null);
  const [dday, setDday] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadStartDate();
  }, []);

  const loadStartDate = async () => {
    const uid = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists() && userDoc.data().startDate) {
      const date = userDoc.data().startDate.toDate();
      setStartDate(date);
      calcDday(date);
    }
  };

  const calcDday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    setDday(diff);
  };

  const handleDateChange = async (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      calcDday(selectedDate);
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, 'users', uid), { startDate: selectedDate });
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃 할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💑</Text>
      <Text style={styles.title}>우리 둘만의 공간</Text>

      {dday ? (
        <View style={styles.ddayCard}>
          <Text style={styles.ddayLabel}>함께한 지</Text>
          <Text style={styles.ddayNumber}>D+{dday}</Text>
          <Text style={styles.ddayDate}>
            {startDate?.toLocaleDateString('ko-KR')} 부터
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.ddayCard} onPress={() => setShowPicker(true)}>
          <Text style={styles.ddayEmpty}>💕 처음 만난 날을 설정해요</Text>
        </TouchableOpacity>
      )}

      {dday && (
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={styles.editDate}>날짜 변경</Text>
        </TouchableOpacity>
      )}

      {showPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#E75480', marginBottom: 30 },
  ddayCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0c0d0',
    marginBottom: 20,
    width: '80%',
  },
  ddayLabel: { fontSize: 14, color: '#999', marginBottom: 8 },
  ddayNumber: { fontSize: 52, fontWeight: 'bold', color: '#E75480', marginBottom: 8 },
  ddayDate: { fontSize: 13, color: '#ccc' },
  ddayEmpty: { fontSize: 15, color: '#E75480' },
  editDate: { fontSize: 13, color: '#ccc', marginBottom: 30 },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: '#E75480',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoutText: { color: '#E75480', fontSize: 14 },
});
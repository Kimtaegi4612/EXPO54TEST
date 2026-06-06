import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, SafeAreaView, ScrollView, Share
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [startDate, setStartDate] = useState(null);
  const [dday, setDday] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [myCode, setMyCode] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const uid = auth.currentUser.uid;
    setEmail(auth.currentUser.email);
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setMyCode(data.coupleCode || '');
      if (data.startDate) {
        const date = data.startDate.toDate();
        setStartDate(date);
        calcDday(date);
      }
      if (data.partnerId) {
        const partnerDoc = await getDoc(doc(db, 'users', data.partnerId));
        if (partnerDoc.exists()) {
          setPartnerName(partnerDoc.data().nickname || partnerDoc.data().email?.split('@')[0] || '연인');
        }
      }
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
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { startDate: selectedDate });
    }
  };

  const shareCode = async () => {
    await Share.share({ message: `💌 커플앱 초대 코드: ${myCode}\n함께 써봐요!` });
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>홈</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.ddayCard} onPress={() => setShowPicker(true)} activeOpacity={0.9}>
          {dday ? (
            <>
              <Text style={styles.partnerLabel}>{partnerName}과 함께한 지</Text>
              <Text style={styles.ddayNumber}>D+{dday}</Text>
              <Text style={styles.ddayDate}>{startDate?.toLocaleDateString('ko-KR')} 부터</Text>
            </>
          ) : (
            <>
              <Ionicons name="heart" size={36} color="rgba(255,255,255,0.8)" />
              <Text style={styles.ddayEmpty}>처음 만난 날을 설정해요</Text>
              <Text style={styles.ddayHint}>탭해서 날짜 선택</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={20} color="#C2185B" />
            <Text style={styles.infoLabel}>내 계정</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{email}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="heart-outline" size={20} color="#C2185B" />
            <Text style={styles.infoLabel}>연인</Text>
            <Text style={styles.infoValue}>{partnerName || '연결됨'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.inviteCard} onPress={shareCode} activeOpacity={0.85}>
          <View style={styles.inviteLeft}>
            <Ionicons name="link-outline" size={22} color="#C2185B" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.inviteTitle}>친구 초대하기</Text>
              <Text style={styles.inviteSubtitle}>초대 코드 공유하기</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
        </TouchableOpacity>

        <View style={styles.menuGrid}>
          {[
            { icon: 'calendar-outline', label: '캘린더' },
            { icon: 'chatbubble-outline', label: '채팅' },
            { icon: 'images-outline', label: '앨범' },
            { icon: 'heart-outline', label: '버킷리스트' },
          ].map((item, i) => (
            <View key={i} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={26} color="#C2185B" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212121' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  ddayCard: {
    backgroundColor: '#C2185B',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#C2185B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  partnerLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  ddayNumber: { fontSize: 64, fontWeight: '800', color: '#fff', marginBottom: 6 },
  ddayDate: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  ddayEmpty: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 12, marginBottom: 6 },
  ddayHint: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: { fontSize: 11, color: '#BDBDBD', marginTop: 8, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#212121' },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inviteLeft: { flexDirection: 'row', alignItems: 'center' },
  inviteTitle: { fontSize: 15, fontWeight: '600', color: '#212121' },
  inviteSubtitle: { fontSize: 12, color: '#BDBDBD', marginTop: 2 },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  menuLabel: { fontSize: 13, fontWeight: '600', color: '#212121' },
});
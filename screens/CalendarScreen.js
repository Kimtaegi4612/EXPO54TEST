import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function CalendarScreen() {
  const [selected, setSelected] = useState('');
  const [events, setEvents] = useState({});
  const [memo, setMemo] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    const uid = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const pid = userDoc.data().partnerId;
      setPartnerId(pid);
      loadEvents(uid, pid);
    }
  };

  const loadEvents = (uid, pid) => {
    const q = query(
      collection(db, 'events'),
      where('participants', 'array-contains', uid)
    );
    onSnapshot(q, (snapshot) => {
      const marked = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        marked[data.date] = {
          marked: true,
          dotColor: '#E75480',
          events: [...(marked[data.date]?.events || []), { id: doc.id, ...data }],
        };
      });
      setEvents(marked);
    });
  };

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    const dayData = events[day.dateString];
    setDayEvents(dayData?.events || []);
  };

  const addEvent = async () => {
    if (!memo.trim()) {
      Alert.alert('일정 내용을 입력해요');
      return;
    }
    if (!selected) {
      Alert.alert('날짜를 먼저 선택해요');
      return;
    }
    try {
      const uid = auth.currentUser.uid;
      await addDoc(collection(db, 'events'), {
        date: selected,
        memo: memo.trim(),
        createdBy: uid,
        participants: partnerId ? [uid, partnerId] : [uid],
        createdAt: new Date(),
      });
      setMemo('');
      Alert.alert('일정 추가됐어요! 📅');
    } catch (e) {
      Alert.alert('오류', '다시 시도해요');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...events,
          [selected]: {
            ...events[selected],
            selected: true,
            selectedColor: '#E75480',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#E75480',
          todayTextColor: '#E75480',
          arrowColor: '#E75480',
          dotColor: '#E75480',
        }}
      />

      {selected ? (
        <View style={styles.inputArea}>
          <Text style={styles.dateText}>{selected}</Text>

          {dayEvents.length > 0 && (
            <View style={styles.eventList}>
              {dayEvents.map((e, i) => (
                <View key={i} style={styles.eventItem}>
                  <Text style={styles.eventText}>📅 {e.memo}</Text>
                </View>
              ))}
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="일정 입력해요"
            value={memo}
            onChangeText={setMemo}
          />
          <TouchableOpacity style={styles.button} onPress={addEvent}>
            <Text style={styles.buttonText}>일정 추가</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintText}>날짜를 선택해서 일정을 추가해요</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  inputArea: { padding: 20 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#E75480', marginBottom: 12 },
  eventList: { marginBottom: 12 },
  eventItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0c0d0',
  },
  eventText: { fontSize: 14, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#f0c0d0',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#E75480',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  hint: { padding: 30, alignItems: 'center' },
  hintText: { color: '#ccc', fontSize: 14 },
});
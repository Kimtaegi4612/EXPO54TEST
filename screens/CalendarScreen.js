import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, SafeAreaView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, addDoc, query, where, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const [selected, setSelected] = useState('');
  const [events, setEvents] = useState({});
  const [memo, setMemo] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  useEffect(() => { loadPartner(); }, []);

  const loadPartner = async () => {
    const uid = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const pid = userDoc.data().partnerId;
      setPartnerId(pid);
      loadEvents(uid);
    }
  };

  const loadEvents = (uid) => {
    const q = query(collection(db, 'events'), where('participants', 'array-contains', uid));
    onSnapshot(q, (snapshot) => {
      const marked = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (!marked[data.date]) marked[data.date] = { events: [], marked: true, dotColor: '#C2185B' };
        marked[data.date].events.push({ id: d.id, ...data });
      });
      setEvents(marked);
    });
  };

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    setDayEvents(events[day.dateString]?.events || []);
  };

  const addEvent = async () => {
    if (!memo.trim() || !selected) return;
    const uid = auth.currentUser.uid;
    await addDoc(collection(db, 'events'), {
      date: selected,
      memo: memo.trim(),
      createdBy: uid,
      participants: partnerId ? [uid, partnerId] : [uid],
      createdAt: new Date(),
    });
    setMemo('');
  };

  const deleteEvent = (id) => {
    Alert.alert('일정 삭제', '이 일정을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive', onPress: async () => {
          await deleteDoc(doc(db, 'events', id));
          setDayEvents(prev => prev.filter(e => e.id !== id));
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>캘린더</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...events,
            [selected]: { ...events[selected], selected: true, selectedColor: '#C2185B' },
          }}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            selectedDayBackgroundColor: '#C2185B',
            selectedDayTextColor: '#fff',
            todayTextColor: '#C2185B',
            todayBackgroundColor: '#FCE4EC',
            arrowColor: '#C2185B',
            dotColor: '#C2185B',
            monthTextColor: '#212121',
            textMonthFontWeight: '700',
            textMonthFontSize: 16,
            textDayFontSize: 14,
            dayTextColor: '#212121',
            textSectionTitleColor: '#BDBDBD',
          }}
          style={styles.calendar}
        />

        {selected ? (
          <View style={styles.bottomSheet}>
            <Text style={styles.selectedDate}>{selected}</Text>

            {dayEvents.length > 0 && (
              <FlatList
                data={dayEvents}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 130, marginBottom: 12 }}
                renderItem={({ item }) => (
                  <View style={styles.eventItem}>
                    <View style={styles.eventDot} />
                    <Text style={styles.eventText}>{item.memo}</Text>
                    <TouchableOpacity onPress={() => deleteEvent(item.id)}>
                      <Ionicons name="trash-outline" size={16} color="#BDBDBD" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="일정 추가..."
                placeholderTextColor="#BDBDBD"
                value={memo}
                onChangeText={setMemo}
                onSubmitEditing={addEvent}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addButton} onPress={addEvent}>
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.hint}>
            <Text style={styles.hintText}>날짜를 선택해서 일정을 추가해요</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212121' },
  calendar: { marginHorizontal: 12 },
  bottomSheet: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedDate: { fontSize: 15, fontWeight: '700', color: '#C2185B', marginBottom: 12 },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  eventDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#C2185B', marginRight: 10 },
  eventText: { flex: 1, fontSize: 14, color: '#212121' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#212121',
  },
  addButton: {
    backgroundColor: '#C2185B',
    borderRadius: 12,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hintText: { color: '#BDBDBD', fontSize: 14 },
});
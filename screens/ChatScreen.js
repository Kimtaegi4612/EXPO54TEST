import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => { loadChat(); }, []);

  const loadChat = async () => {
    const uid = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const pid = userDoc.data().partnerId;
      setPartnerId(pid);
      const chatId = [uid, pid].sort().join('_');
      const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
      onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      });
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !partnerId) return;
    const uid = auth.currentUser.uid;
    const chatId = [uid, partnerId].sort().join('_');
    const msg = text.trim();
    setText('');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: msg,
      senderId: uid,
      createdAt: new Date(),
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === auth.currentUser.uid;
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.partnerRow]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Ionicons name="heart" size={14} color="#fff" />
          </View>
        )}
        <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.partnerBubble]}>
            <Text style={[styles.messageText, isMe ? styles.myText : styles.partnerText]}>
              {item.text}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력해요..."
            placeholderTextColor="#BDBDBD"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212121' },
  messageList: { padding: 16, paddingBottom: 16 },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  myRow: { justifyContent: 'flex-end' },
  partnerRow: { justifyContent: 'flex-start' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#C2185B',
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#C2185B',
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: { fontSize: 15, lineHeight: 21 },
  myText: { color: '#fff' },
  partnerText: { color: '#212121' },
  timeText: { fontSize: 10, color: '#BDBDBD', marginTop: 4, marginHorizontal: 4 },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
    maxHeight: 100,
    minHeight: 42,
  },
  sendButton: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#C2185B',
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#E0E0E0' },
});
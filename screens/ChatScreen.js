import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    const uid = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const pid = userDoc.data().partnerId;
      setPartnerId(pid);

      const chatId = [uid, pid].sort().join('_');
      const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      });
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const uid = auth.currentUser.uid;
    const chatId = [uid, partnerId].sort().join('_');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: text.trim(),
      senderId: uid,
      createdAt: new Date(),
    });
    setText('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === auth.currentUser.uid;
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.partnerRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.partnerBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.partnerText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
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
          placeholder="메시지 입력..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  messageList: { padding: 16, paddingBottom: 10 },
  messageRow: { marginBottom: 10, flexDirection: 'row' },
  myRow: { justifyContent: 'flex-end' },
  partnerRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#E75480',
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f0c0d0',
  },
  messageText: { fontSize: 15 },
  myText: { color: '#fff' },
  partnerText: { color: '#333' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0c0d0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#f0c0d0',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#E75480',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
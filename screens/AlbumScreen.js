import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AlbumScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>앨범</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="images-outline" size={40} color="#C2185B" />
          </View>
          <Text style={styles.title}>사진 앨범</Text>
          <Text style={styles.subtitle}>커플 사진을 함께 모아요{'\n'}곧 업데이트 예정이에요 💕</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212121' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 40,
    alignItems: 'center', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  iconBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#FCE4EC', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#212121', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#BDBDBD', textAlign: 'center', lineHeight: 22 },
});
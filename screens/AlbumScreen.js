import { View, Text, StyleSheet } from 'react-native';

export default function AlbumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 앨범</Text>
      <Text style={styles.subtitle}>소중한 사진을 모아요</Text>
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#E75480', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#999' },
});
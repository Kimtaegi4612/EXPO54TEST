import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import ChatScreen from './screens/ChatScreen';
import AlbumScreen from './screens/AlbumScreen';
import LoginScreen from './screens/LoginScreen';
import CoupleConnectScreen from './screens/CoupleConnectScreen';
import NicknameScreen from './screens/NicknameScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserData(snap.data());
          } else {
            setUserData({});
          }
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <View style={styles.splash}>
      <Text style={styles.splashText}>💌</Text>
    </View>
  );

  if (!user) return <LoginScreen />;
  if (!userData?.nickname) return <NicknameScreen onComplete={() => {}} />;
  if (!userData?.partnerId) return <CoupleConnectScreen onConnected={() => {}} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#C2185B',
          tabBarInactiveTintColor: '#BDBDBD',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ focused, color }) => {
            const icons = {
              '홈': focused ? 'home' : 'home-outline',
              '캘린더': focused ? 'calendar' : 'calendar-outline',
              '채팅': focused ? 'chatbubble' : 'chatbubble-outline',
              '앨범': focused ? 'images' : 'images-outline',
            };
            return <Ionicons name={icons[route.name]} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="홈" component={HomeScreen} />
        <Tab.Screen name="캘린더" component={CalendarScreen} />
        <Tab.Screen name="채팅" component={ChatScreen} />
        <Tab.Screen name="앨범" component={AlbumScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  splashText: { fontSize: 60 },
  tabBar: {
    position: 'absolute',
    bottom: 20, left: 20, right: 20,
    borderRadius: 24, height: 65,
    backgroundColor: '#fff', borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 10,
    paddingTop: 8,
  },
});
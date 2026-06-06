import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import ChatScreen from './screens/ChatScreen';
import AlbumScreen from './screens/AlbumScreen';
import LoginScreen from './screens/LoginScreen';
import CoupleConnectScreen from './screens/CoupleConnectScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setPartnerId(snap.data().partnerId || null);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  if (loading) return null;
  if (!user) return <LoginScreen />;
  if (!partnerId) return <CoupleConnectScreen onConnected={() => {}} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#E75480',
          tabBarInactiveTintColor: '#ccc',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#f0f0f0',
            height: 60,
            paddingBottom: 8,
          },
          headerStyle: { backgroundColor: '#FFF5F7' },
          headerTitleStyle: { color: '#E75480', fontWeight: 'bold' },
        }}
      >
        <Tab.Screen
          name="홈"
          component={HomeScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}
        />
        <Tab.Screen
          name="캘린더"
          component={CalendarScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📅</Text> }}
        />
        <Tab.Screen
          name="채팅"
          component={ChatScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>💬</Text> }}
        />
        <Tab.Screen
          name="앨범"
          component={AlbumScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📸</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
import styles from '../styles/all-entries.styles'; // Reusing styles from specific-day for consistency
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView, // Not strictly needed if using FlatList, but kept for context
  Image, // Not directly used in this view, but kept for context
  Alert,
  SafeAreaView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  doc
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { db } from '../../firebaseConfig';
import { useRouter, Stack } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient for a nicer header

import { getEncryptionKey } from '../utils/encryption'; // update path as needed

const MOODS = {
  veryHappy: {
    icon: 'emoticon-excited-outline',
    label: 'Very Happy',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFED4E']
  },
  happy: {
    icon: 'emoticon-happy-outline',
    label: 'Happy',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A']
  },
  content: {
    icon: 'emoticon-outline',
    label: 'Content',
    color: '#7ED6DF',
    gradient: ['#7ED6DF', '#81ECEC']
  },
  neutral: {
    icon: 'emoticon-neutral-outline',
    label: 'Meh',
    color: '#92beb5',
    gradient: ['#92beb5', '#A8C8C0']
  },
  anxious: {
    icon: 'emoticon-frown-outline',
    label: 'Anxious',
    color: '#9b59b6',
    gradient: ['#9b59b6', '#be90d4']
  },
  angry: {
    icon: 'emoticon-angry-outline',
    label: 'Angry',
    color: '#e74c3c',
    gradient: ['#e74c3c', '#f1948a']
  },
  sad: {
    icon: 'emoticon-sad-outline',
    label: 'Sad',
    color: '#7286D3',
    gradient: ['#7286D3', '#8FA4E8']
  },
  verySad: {
    icon: 'emoticon-cry-outline',
    label: 'Very Sad',
    color: '#b44560',
    gradient: ['#b44560', '#C85A75']
  },
  overwhelmed: {
    icon: 'emoticon-confused-outline',
    label: 'Overwhelmed',
    color: '#ffa502',
    gradient: ['#ffa502', '#ffb347']
  },
  tired: {
    icon: 'emoticon-sick-outline',
    label: 'Tired',
    color: '#95a5a6',
    gradient: ['#95a5a6', '#bdc3c7']
  },
  hopeful: {
    icon: 'emoticon-wink-outline',
    label: 'Hopeful',
    color: '#00cec9',
    gradient: ['#00cec9', '#81ecec']
  }
};

export default function AllEntries() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    (async () => {
      const key = await getEncryptionKey();
      setEncryptionKey(key);
    })();
  }, []);

  const decryptData = (encryptedData) => {
  if (!encryptionKey) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted string:', result); // Add this
    if (result) return JSON.parse(result);
  } catch (e) {
    console.log('Decryption error:', e);
  }
  return null;
};


  
  const loadAllEntries = async () => {
    if (!user || !encryptionKey) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const loadedEntries = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent);

        if (decryptedData) {
          loadedEntries.push({
            id: doc.id,
            ...decryptedData,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
          });
        }
      });

      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading all entries:', error);
      Alert.alert('Error', 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (encryptionKey && user) {
      loadAllEntries();
    }
  }, [encryptionKey, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Ensure AM/PM format
    });
  };

  const renderEntry = ({ item: entry }) => (
    <TouchableOpacity
      key={entry.id}
      style={styles.entryCard}
      onPress={() => {
        // Navigate to the specific day page with the entry's date
        // and optionally pass the entry ID if you want to highlight it
        router.push({
          pathname: '/specific-day',
          params: { date: new Date(entry.date).toISOString().split('T')[0] }
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.entryCardHeader}>
        <Text style={styles.entryCardDate}>
          {formatDate(entry.date)}
        </Text>
        <Text style={styles.entryCardTime}>
          {formatTime(entry.createdAt)}
        </Text>
      </View>

      <View style={styles.entryCardBody}>
        <View style={styles.entryCardMood}>
          <MaterialCommunityIcons
            name={MOODS[entry.mood]?.icon || 'emoticon-outline'}
            size={24}
            color={MOODS[entry.mood]?.color || '#92beb5'}
          />
          <Text style={[styles.entryCardMoodText, { color: MOODS[entry.mood]?.color || '#92beb5' }]}>
            {MOODS[entry.mood]?.label || 'Unknown Mood'}
          </Text>
        </View>

        <Text style={styles.entryCardText} numberOfLines={3}>
          {entry.text}
        </Text>

        {entry.images && entry.images.length > 0 && (
          <View style={styles.entryCardImageIndicator}>
            <MaterialCommunityIcons name="image" size={18} color="#777" />
            <Text style={styles.entryCardImageCountText}>
              {entry.images.length} photo{entry.images.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#6B4EFF', '#8A4FFF', '#A855F7']} // Gradient similar to your TabOneScreen hero
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>All Journal Entries</Text>
            <Text style={styles.headerSubtitle}>A complete overview of your journey</Text>
          </View>
        </View>
      </LinearGradient>
   
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={styles.loadingText}>Loading your journey...</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="book-open-page-variant" size={60} color="#bbb" />
          <Text style={styles.emptyStateTitle}>No entries yet!</Text>
          <Text style={styles.emptyStateText}>
            Start your self-discovery journey by adding your first journal entry.
          </Text>
          <TouchableOpacity
            style={styles.addFirstEntryButton}
            onPress={() => router.push({
              pathname: '/specific-day',
              params: { date: new Date().toISOString().split('T')[0], initialTab: 'journal', openForm: 'true' }
            })}
          >
            <Text style={styles.addFirstEntryButtonText}>Add New Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.entriesListContainer} // Changed from entriesContainer for clarity
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
// specific-day.tsx
import styles from '../styles/specific-day.styles';
import React, { useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { getAuth } from 'firebase/auth';

// Import the new components
import JournalScreen from '../../components/JournalScreen';
import HabitsScreen from '../../components/HabitsScreen'; // New Import

const { width } = Dimensions.get('window');

export default function SpecificDay() {
  const { date, initialTab, openForm } = useLocalSearchParams();

  // Change default to 'habits' if you want it to be the initial tab
  const [activeTab, setActiveTab] = useState<'habits' | 'journal'>(initialTab === 'journal' ? 'journal' : 'habits');
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  const isPastDate = new Date(date as string) < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = new Date(date as string).toDateString() === new Date().toDateString();

  const initialOpenHandled = useRef(false);

  useEffect(() => {
    // This effect ensures initialTab and openForm are handled only once on mount
    if (initialTab === 'journal' && activeTab === 'journal' && !initialOpenHandled.current) {
      if (String(openForm).trim() === 'true') {
        initialOpenHandled.current = true; // Mark as handled for journal form
      }
    }
  }, [initialTab, openForm, activeTab]);


  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {isToday ? 'Today' : isPastDate ? 'Past Day' : 'Future Day'}
            </Text>
            <Text style={styles.headerDate}>
              {new Date(date as string).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'habits' && styles.activeTab]}
            onPress={() => setActiveTab('habits')}
          >
            <MaterialCommunityIcons
              name="check-all" // Icon for Habits
              size={20}
              color={activeTab === 'habits' ? '#fff' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'habits' && styles.activeTabText]}>
              Habits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'journal' && styles.activeTab]}
            onPress={() => setActiveTab('journal')}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={20}
              color={activeTab === 'journal' ? '#fff' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'journal' && styles.activeTabText]}>
              Journal
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'habits' ? (
          <HabitsScreen
            date={date as string}
            user={user}
          />
        ) : (
          <JournalScreen
            date={date as string}
            user={user}
            openFormInitially={String(openForm).trim() === 'true' && !initialOpenHandled.current}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
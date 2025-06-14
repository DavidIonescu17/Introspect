import styles from '../styles/specific-day.styles';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator, // Import ActivityIndicator for loading state
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

  const [activeTab, setActiveTab] = useState<'habits' | 'journal'>(initialTab === 'journal' ? 'journal' : 'habits');
  const [quote, setQuote] = useState<{ q: string; a: string } | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();
        if (data && data.length > 0) {
          setQuote(data[0]);
        } else {
          setQuoteError('Nu s-a putut obține citatul.');
        }
      } catch (error) {
        console.error('Eroare la preluarea citatului:', error);
        setQuoteError('Eroare la încărcarea citatului. Vă rugăm să verificați conexiunea la internet.');
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
  }, []); // Empty dependency array means this effect runs once on mount

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

        {/* Quote Section */}
        <View style={styles.quoteContainer}>
          {loadingQuote ? (
            <ActivityIndicator size="small" color="#666" />
          ) : quoteError ? (
            <Text style={styles.quoteErrorText}>{quoteError}</Text>
          ) : quote ? (
            <>
              <Text style={styles.quoteText}>"{quote.q}"</Text>
              <Text style={styles.quoteAuthor}>- {quote.a}</Text>
            </>
          ) : null}
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
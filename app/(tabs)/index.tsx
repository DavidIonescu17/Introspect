import styles from '../styles/index.styles';
import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, ScrollView, Image, View, Dimensions, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router, useFocusEffect } from 'expo-router';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import CryptoJS from 'crypto-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getEncryptionKey } from '../utils/encryption';

const MOODS = {
  veryHappy: { icon: 'emoticon-excited-outline', color: '#FFD93D', label: 'Very Happy' },
  happy: { icon: 'emoticon-happy-outline', color: '#4CAF50', label: 'Happy' },
  content: { icon: 'emoticon-outline', color: '#7ED6DF', label: 'Content' },
  neutral: { icon: 'emoticon-neutral-outline', color: '#92beb5', label: 'Neutral' },
  anxious: { icon: 'emoticon-frown-outline', color: '#9b59b6', label: 'Anxious' },
  angry: { icon: 'emoticon-angry-outline', color: '#e74c3c', label: 'Angry' },
  sad: { icon: 'emoticon-sad-outline', color: '#7286D3', label: 'Sad' },
  verySad: { icon: 'emoticon-cry-outline', color: '#b44560', label: 'Very Sad' },
  overwhelmed: { icon: 'emoticon-confused-outline', color: '#ffa502', label: 'Overwhelmed' },
  tired: { icon: 'emoticon-sick-outline', color: '#95a5a6', label: 'Tired' },
  hopeful: { icon: 'emoticon-wink-outline', color: '#00cec9', label: 'Hopeful' }
};

const { width } = Dimensions.get('window');

export default function TabOneScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<{ [date: string]: string[] }>({});
  const [dailyHabitStats, setDailyHabitStats] = useState<{ [date: string]: { completed: number, total: number } }>({});
  const [loading, setLoading] = useState(true);
  const [isHabitView, setIsHabitView] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null); // Type as string | null
  const [isEncryptionKeyLoaded, setIsEncryptionKeyLoaded] = useState(false); // New state to track key loading
  const user = getAuth().currentUser;

  // Effect to load encryption key
  useEffect(() => {
    const loadKey = async () => {
      const key = await getEncryptionKey();
      setEncryptionKey(key);
      setIsEncryptionKeyLoaded(true); // Set flag when key is loaded
    };
    loadKey();
  }, []); // Run only once on mount

  // Use useEffect for initial auth state observation
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });
    return () => unsubscribe();
  }, []);

  // Use useFocusEffect to re-fetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only load data if user is present AND encryption key is loaded
      if (user && isEncryptionKeyLoaded) {
        loadMoodData();
        fetchDailyHabitStats();
      }
    }, [user, isEncryptionKeyLoaded]) // Depend on isEncryptionKeyLoaded
  );

  const decryptData = (encryptedData: string | undefined | null) => { // Added type for clarity
    // Explicitly check if encryptedData is a string and of sufficient length
    if (!encryptionKey || typeof encryptedData !== 'string' || encryptedData.length < 8) {
      console.log('Skipping decryption: Invalid key, or encryptedData not a string or too short.');
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        console.error('Decryption yielded an empty string. Likely decryption failed due to incorrect key or corrupted data.');
        return null;
      }
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption or JSON parsing error:', error);
      return null;
    }
  };

  const getCleanDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const fetchDailyHabitStats = async () => {
    if (!user) return; // This check is sufficient given useFocusEffect dependency

    try {
      const todayKey = formatLocalYYYYMMDD(new Date());
      const start = new Date();
      start.setDate(start.getDate() - 365);
      const startKey = formatLocalYYYYMMDD(start);

      const q = query(
        collection(db, 'daily_habits'),
        where('userId', '==', user.uid),
        where('date', '>=', startKey),
        where('date', '<=', todayKey)
      );
      const querySnapshot = await getDocs(q);

      const stats: { [date: string]: { completed: number, total: number } } = {};
      querySnapshot.forEach(docSnap => {
        const docData = docSnap.data();
        const habits = docData.habits as { completed: boolean }[] || [];
        const date = docData.date as string;
        const completedCount = habits.filter(h => h.completed).length;
        const totalCount = habits.length;
        stats[date] = { completed: completedCount, total: totalCount };
      });
      setDailyHabitStats(stats);
    } catch (error) {
      console.error('Error fetching daily habit stats:', error);
    }
  };

  const loadMoodData = async () => {
    // This check is redundant if the useCallback depends on isEncryptionKeyLoaded,
    // but it's good for safety if loadMoodData is called elsewhere.
    if (!user || !isEncryptionKeyLoaded || !encryptionKey) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const moodByDate: { [date: string]: string[] } = {}; // Explicitly typed

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Use || to try both fields for backwards compatibility if needed
        const encryptedDataFromFirestore = data.encryptedContent || data.cryptedContent;
        const decryptedData = decryptData(encryptedDataFromFirestore);

        // Robust check: Ensure decryptedData is an object and has a 'mood' property
        if (decryptedData && typeof decryptedData === 'object' && decryptedData.mood) {
          const entryDate = new Date(decryptedData.date).toISOString().split('T')[0];

          if (!moodByDate[entryDate]) {
            moodByDate[entryDate] = [];
          }
          moodByDate[entryDate].push(decryptedData.mood);
        } else {
          // Log a warning for entries that could not be decrypted or had missing mood
          console.warn('Skipping entry due to invalid decrypted data or missing mood:', decryptedData, 'from document ID:', doc.id);
        }
      });

      setMoodData(moodByDate);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day: { dateString: string }) => {
    const now = new Date();
    const todayDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (day.dateString > todayDateString) {
      Alert.alert(
        'Future Date',
        'You cannot view future dates. Focus on today!',
        [{ text: 'OK' }]
      );
      return;
    }

    router.push({
      pathname: '/specific-day',
      params: { date: day.dateString },
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getMarkedDates = useCallback(() => {
    const todayDate = getTodayDate();
    const marked: any = {
      [todayDate]: {
        selected: true,
        selectedColor: '#6B4EFF',
        selectedTextColor: 'white',
      },
    };

    if (isHabitView) {
      Object.keys(dailyHabitStats).forEach(date => {
        const stats = dailyHabitStats[date];
        if (stats) {
          if (date === todayDate) {
            marked[date] = {
              ...marked[date],
              habitStats: stats,
            };
          } else {
            marked[date] = {
              habitStats: stats,
              customStyles: {
                container: {
                  backgroundColor: 'white',
                  borderRadius: 16,
                },
                text: {
                  color: '#2d3436',
                }
              }
            };
          }
        }
      });
    } else { // Moods view
      Object.keys(moodData).forEach(date => {
        const moodsForDay = moodData[date];
        if (moodsForDay && moodsForDay.length > 0) {
          if (date === todayDate) {
            marked[date] = {
              ...marked[date],
              moods: moodsForDay,
            };
          } else {
            marked[date] = {
              moods: moodsForDay,
              customStyles: {
                container: {
                  backgroundColor: 'white',
                  borderRadius: 16,
                },
                text: {
                  color: '#2d3436',
                }
              }
            };
          }
        }
      });
    }
    return marked;
  }, [isHabitView, moodData, dailyHabitStats]);

  const getStreakCount = () => {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];

      if (moodData[dateString] && moodData[dateString].length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getMoodStats = () => {
    const allMoods = Object.values(moodData).flat();
    const moodCounts: { [key: string]: number } = {}; // Explicitly type moodCounts

    allMoods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const topMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b, 'neutral'
    );

    return { topMood, totalEntries: allMoods.length };
  };

  const stats = getMoodStats();
  const streak = getStreakCount();

  const CustomDayWithMultiMoods = ({ date, state, marking, onPress }: any) => { // Use 'any' for marking due to complex type
    const isSelected = marking?.selected;
    const moodsForDay = marking?.moods || [];
    const habitStatsForDay = marking?.habitStats;

    return (
      <TouchableOpacity
        style={[
          styles.dayWrapper,
          isSelected && styles.selectedDayWrapper,
          state === 'disabled' && styles.disabledDayWrapper,
        ]}
        onPress={() => onPress(date)}
        disabled={state === 'disabled'}
      >
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.selectedDayNumber,
            state === 'disabled' && styles.disabledDayNumber,
          ]}
        >
          {date.day}
        </Text>
        {isHabitView ? (
          habitStatsForDay ? (
            <View style={styles.habitCountContainer}>
              <Text style={styles.habitCountText}>
                {habitStatsForDay.completed}/{habitStatsForDay.total}
              </Text>
              <MaterialCommunityIcons name="check-all" size={12} color="#6B4EFF" />
            </View>
          ) : null
        ) : (
          moodsForDay.length > 0 && (
            <View style={styles.multiMoodContainer}>
              {moodsForDay.map((mood: string, index: number) => {
                const moodIcon = MOODS[mood]?.icon;
                const moodColor = MOODS[mood]?.color;
                return (
                  <MaterialCommunityIcons
                    key={`${mood}-${index}`}
                    name={moodIcon || 'emoticon-outline'}
                    size={12}
                    color={moodColor || '#ccc'}
                    style={styles.multiMoodIcon}
                  />
                );
              })}
            </View>
          )
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Image
            source={require('../../assets/images/logo2.png')}
            style={styles.logo}
          />
          <Text style={styles.heroTitle}>Welcome to your Journey of self-discovery</Text>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Tap any day to explore your memories</Text>
          {/* Toggle Button */}
          <TouchableOpacity
            style={styles.toggleViewButton}
            onPress={() => setIsHabitView(!isHabitView)}
          >
            <MaterialCommunityIcons
              name={isHabitView ? "emoticon-outline" : "check-all"}
              size={20}
              color="#6B4EFF"
            />
            <Text style={styles.toggleViewButtonText}>
              {isHabitView ? "Show Moods" : "Show Habits"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
           <Calendar
            onDayPress={handleDayPress}
            style={styles.calendar}
            markingType="custom"
            markedDates={getMarkedDates()}
            dayComponent={CustomDayWithMultiMoods}
            theme={{
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />

          {/* Legend - Conditionally rendered */}
          {!isHabitView && (
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Mood Legend</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendScrollViewContent}>
                {Object.entries(MOODS).map(([key, mood]) => (
                  <View key={key} style={styles.legendItem}>
                    <MaterialCommunityIcons
                      name={mood.icon}
                      size={20}
                      color={mood.color}
                      style={styles.legendIcon}
                    />
                    <Text style={styles.legendText}>{mood.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({
            pathname: '/specific-day',
            params: {
              date: getTodayDate(),
              initialTab: 'journal',
              openForm: 'true'
            }
          })}
        >
          <LinearGradient
            colors={['#6B4EFF', '#8A4FFF']}
            style={styles.actionButtonGradient}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Today's Entry</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/all-entries')}
        >
          <View style={styles.secondaryActionButton}>
            <MaterialCommunityIcons name="book-open" size={24} color="#6B4EFF" />
            <Text style={styles.secondaryActionButtonText}>View All Entries</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

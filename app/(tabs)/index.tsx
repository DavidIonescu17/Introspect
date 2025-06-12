import styles from '../styles/index.styles';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { TouchableOpacity, Text, ScrollView, Image, View, Dimensions, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router, useFocusEffect } from 'expo-router'; // Added useFocusEffect
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

const ENCRYPTION_KEY = 'ezYxGHuBw5W5jKewAnJsmie52Ge14WCzk+mIW8IFD6gzl/ubFlHjGan+LbcJ2M1m';

const MOODS = {
  veryHappy: { icon: 'emoticon-excited-outline', color: '#FFD93D' },
  happy: { icon: 'emoticon-happy-outline', color: '#4CAF50' },
  content: { icon: 'emoticon-outline', color: '#7ED6DF' },
  neutral: { icon: 'emoticon-neutral-outline', color: '#92beb5' },
  anxious: { icon: 'emoticon-frown-outline', color: '#9b59b6' },
  angry: { icon: 'emoticon-angry-outline', color: '#e74c3c' },
  sad: { icon: 'emoticon-sad-outline', color: '#7286D3' },
  verySad: { icon: 'emoticon-cry-outline', color: '#b44560' },
  overwhelmed: { icon: 'emoticon-confused-outline', color: '#ffa502' },
  tired: { icon: 'emoticon-sick-outline', color: '#95a5a6' },
  hopeful: { icon: 'emoticon-wink-outline', color: '#00cec9' }
};

const { width } = Dimensions.get('window');

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export default function TabOneScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<{ [date: string]: string[] }>({}); // Explicitly typed
  const [dailyHabitStats, setDailyHabitStats] = useState<{ [date: string]: { completed: number, total: number } }>({}); // Added
  const [loading, setLoading] = useState(true);
  const [isHabitView, setIsHabitView] = useState(false); // Added

  const user = getAuth().currentUser;

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
      if (user) {
        loadMoodData();
        fetchDailyHabitStats(); // Fetch habit stats on focus
      }
    }, [user]) // Depend on user, so it refetches if user changes (e.g., login/logout)
  );

  const getCleanDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatLocalYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
  };

  // Added fetchDailyHabitStats function
  const fetchDailyHabitStats = async () => {
    if (!user) return;
    try {
      const todayKey = formatLocalYYYYMMDD(new Date());
      const start = new Date();
      start.setDate(start.getDate() - 365);
      const startKey = formatLocalYYYYMMDD(start);

      const q = query(
        collection(db, 'daily_habits'),
        where('userId', '==', user.uid),
        where('date', '>=', startKey),
        where('date', '<=', todayKey)      // <— now truly includes today
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
    if (!user) return;

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
        const decryptedData = decryptData(data.encryptedContent);
        if (decryptedData && decryptedData.mood) {
          const entryDate = new Date(decryptedData.date).toISOString().split('T')[0];

          if (!moodByDate[entryDate]) {
            moodByDate[entryDate] = [];
          }
          moodByDate[entryDate].push(decryptedData.mood);
        }
      });

      setMoodData(moodByDate);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
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

  // Modified getMarkedDates to handle both mood and habit views
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
        if (stats) { // Only mark with habit stats if a record exists in dailyHabitStats
          if (date === todayDate) {
            marked[date] = {
              ...marked[date], // Preserve selected styles for today
              habitStats: stats, // Use actual stats (could be 0/0 if habits array is empty)
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
  }, [isHabitView, moodData, dailyHabitStats]); // Dependencies for useCallback


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
    const moodCounts = {};

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

  // Modified CustomDayWithMultiMoods to conditionally render based on isHabitView
  const CustomDayWithMultiMoods = ({ date, state, marking, onPress }) => {
    const isSelected = marking?.selected;
    const moodsForDay = marking?.moods || [];
    const habitStatsForDay = marking?.habitStats; // Get habit stats for the day

    return (
      <TouchableOpacity
        style={[
          styles.dayWrapper, // Define these styles
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
          habitStatsForDay ? ( // Show habit stats if in habit view and data exists
            <View style={styles.habitCountContainer}>
              <Text style={styles.habitCountText}>
                {habitStatsForDay.completed}/{habitStatsForDay.total}
              </Text>
              <MaterialCommunityIcons name="check-all" size={12} color="#6B4EFF" />
            </View>
          ) : null // If no habit record for the day, show nothing in habit view
        ) : (
          moodsForDay.length > 0 && ( // Show mood icons if in mood view and moods exist
            <View style={styles.multiMoodContainer}>
              {moodsForDay.map((mood, index) => {
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
      <LinearGradient
        colors={['#6B4EFF', '#8A4FFF', '#A855F7']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Image
            source={require('../../assets/images/logo2.png')}
            style={styles.logo}
          />
          <Text style={styles.heroTitle}>Welcome to Introspect</Text>
          <Text style={styles.heroSubtitle}>Your journey of self-discovery</Text>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name={MOODS[stats.topMood]?.icon || 'emoticon-outline'}
              size={24}
              color={MOODS[stats.topMood]?.color || '#ccc'}
            />
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-heart" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{Object.keys(moodData).length}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
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
                    <Text style={styles.legendText}>{key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}</Text>
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
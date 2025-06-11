import styles from '../styles/index.styles';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, ScrollView, Image, View, Dimensions, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
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
  const [moodData, setMoodData] = useState({});
  const [loading, setLoading] = useState(true);

  const user = getAuth().currentUser;

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });

    if (user) {
      loadMoodData();
    }

    return () => unsubscribe();
  }, [user]);

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
      const moodByDate = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent);
        if (decryptedData && decryptedData.mood) {
          const entryDate = new Date(decryptedData.date).toISOString().split('T')[0];

          if (!moodByDate[entryDate]) {
            moodByDate[entryDate] = [];
          }
          // Add the mood to the array for that day
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
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMarkedDates = () => {
    const todayDate = getTodayDate();
    const marked = {
      [todayDate]: {
        selected: true,
        selectedColor: '#6B4EFF',
        selectedTextColor: 'white',
      },
    };

    Object.keys(moodData).forEach(date => {
      const moodsForDay = moodData[date];
      if (moodsForDay && moodsForDay.length > 0) {
        if (date === todayDate) {
          marked[date] = {
            ...marked[date],
            moods: moodsForDay, // Pass the array of moods
          };
        } else {
          marked[date] = {
            moods: moodsForDay, // Pass the array of moods
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

    return marked;
  };


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
  const CustomDayWithMultiMoods = ({ date, state, marking, onPress }) => {
  const isSelected = marking?.selected;
  const moodsForDay = marking?.moods || []; // Get all moods for the day

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
      {moodsForDay.length > 0 && (
        <View style={styles.multiMoodContainer}>
          {moodsForDay.map((mood, index) => {
            const moodIcon = MOODS[mood]?.icon;
            const moodColor = MOODS[mood]?.color;
            return (
              <MaterialCommunityIcons
                key={`${mood}-${index}`} // Unique key
                name={moodIcon || 'emoticon-outline'} // Fallback icon
                size={12} // Very small icons
                color={moodColor || '#ccc'}
                style={styles.multiMoodIcon}
              />
              // Or if you prefer small colored squares:
              // <View
              //   key={`${mood}-${index}`}
              //   style={[styles.miniMoodSquare, { backgroundColor: moodColor || '#ccc' }]}
              // />
            );
          })}
        </View>
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
          {/* Removed Daily Quote Card here */}
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
        </View>

        <View style={styles.calendarContainer}>
           <Calendar
            onDayPress={handleDayPress}
            style={styles.calendar}
            markingType="custom" // Back to "custom"
            markedDates={getMarkedDates()}
            dayComponent={CustomDayWithMultiMoods} // <-- Use the new day component
            theme={{
              // ... existing theme properties ...
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
          

          {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Mood Legend</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendScrollViewContent}>
          {Object.entries(MOODS).map(([key, mood]) => (
            <View key={key} style={styles.legendItem}>
              <MaterialCommunityIcons
                name={mood.icon}
                size={20} // Slightly larger icons for the legend
                color={mood.color}
                style={styles.legendIcon} // Add a style for spacing
              />
              <Text style={styles.legendText}>{key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}</Text>
              {/* The .replace() part above converts 'veryHappy' to 'Very Happy' */}
            </View>
          ))}
        </ScrollView>
      </View>
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
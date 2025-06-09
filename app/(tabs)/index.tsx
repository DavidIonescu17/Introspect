import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView, Image, View, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';
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
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');

  const user = getAuth().currentUser;

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });

    if (user) {
      loadMoodData();
      fetchQuote();
    }

    return () => unsubscribe();
  }, [user]);

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://zenquotes.io/api/random/');
      const data = await response.json();
      if (data && data.length > 0) {
        setCurrentQuote(data[0].q);
        setCurrentAuthor(data[0].a);
      }
    } catch (error) {
      setCurrentQuote('Every day is a new beginning.');
      setCurrentAuthor('Unknown');
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
      const moodByDate = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent);
        if (decryptedData && decryptedData.mood) {
          const entryDate = new Date(decryptedData.date).toISOString().split('T')[0];
          
          // Store multiple moods per day or the most recent one
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

    // Add mood indicators
    Object.keys(moodData).forEach(date => {
      const moods = moodData[date];
      if (moods && moods.length > 0) {
        // Use the most recent mood for the day
        const primaryMood = moods[0];
        const moodColor = MOODS[primaryMood]?.color || '#ccc';
        
        if (date === todayDate) {
          // Keep today's styling but add mood indicator
          marked[date] = {
            ...marked[date],
            dots: [{ color: moodColor, selectedDotColor: 'white' }]
          };
        } else {
          marked[date] = {
            dots: [{ color: moodColor }],
            // Add subtle background for days with entries
            customStyles: {
              container: {
                backgroundColor: moodColor + '20',
                borderRadius: 16,
              },
              text: {
                color: moodColor,
                fontWeight: 'bold'
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
          
          {/* Daily Quote Card */}
          <View style={styles.quoteCard}>
            <MaterialCommunityIcons name="format-quote-open" size={20} color="#6B4EFF" />
            <Text style={styles.quoteText}>"{currentQuote}"</Text>
            <Text style={styles.quoteAuthor}>— {currentAuthor}</Text>
          </View>
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
            markingType="custom"
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'white',
              textSectionTitleColor: '#6B4EFF',
              selectedDayBackgroundColor: '#6B4EFF',
              selectedDayTextColor: 'white',
              todayTextColor: '#6B4EFF',
              dayTextColor: '#2d3436',
              textDisabledColor: '#ddd',
              dotColor: '#6B4EFF',
              selectedDotColor: '#ffffff',
              arrowColor: '#6B4EFF',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#2d3436',
              indicatorColor: '#6B4EFF',
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(MOODS).slice(0, 6).map(([key, mood]) => (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: mood.color }]} />
                  <Text style={styles.legendText}>{key}</Text>
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
          onPress={() => router.push('/specific-day?date=' + getTodayDate())}
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
          onPress={() => router.push('/journal')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 30,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2d3436',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#6B4EFF',
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2d3436',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 4,
    textAlign: 'center',
  },
  calendarSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#636e72',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calendar: {
    borderRadius: 16,
  },
  legend: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#636e72',
    textTransform: 'capitalize',
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButton: {
    marginBottom: 15,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6B4EFF',
  },
  secondaryActionButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
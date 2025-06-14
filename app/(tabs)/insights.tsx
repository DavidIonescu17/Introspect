import { onSnapshot } from 'firebase/firestore'; // Import onSnapshot
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text, // Ensure Text is imported
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator, // For loading indicator
  LayoutAnimation, // For smooth expansion/collapse
  Platform, UIManager, // For LayoutAnimation on Android
  FlatList // Added FlatList for habit selection
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  getDocs, // Re-added getDocs for fetching master habits once
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CryptoJS from 'crypto-js';

// Assuming db is imported from your firebaseConfig; adjust path as necessary.
// This path MUST be correct for Firestore to work.
import { db } from '../../firebaseConfig';
import { getEncryptionKey } from '../utils/encryption';
// Import VADER sentiment library
// You'll need to install it: npm install vader-sentiment
import Sentiment from 'vader-sentiment';

// Import MaterialCommunityIcons for custom icons (you already have this)
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Import your custom styles for InsightsScreen ---
// Make sure this path is correct: e.g., '../styles/insights.styles' if it's in a sibling folder
import styles from '../styles/insights.styles';
import { CLASSIC_HABITS } from '../../constants/habits'; // Assuming this path is correct

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants (copied from profile.tsx for self-containment, ideally centralized in a shared file) ---
const { width: screenWidth } = Dimensions.get('window');

// Mood definitions with values and MaterialCommunityIcons (ensure consistency with your app)
const MOODS = {
  veryHappy: { label: 'Very Happy', color: '#FFD93D', value: 5, icon: 'emoticon-excited-outline' },
  happy: { label: 'Happy', color: '#4CAF50', value: 4, icon: 'emoticon-happy-outline' },
  content: { label: 'Content', color: '#7ED6DF', value: 3, icon: 'emoticon-outline' },
  neutral: { label: 'Meh', color: '#92beb5', value: 2, icon: 'emoticon-neutral-outline' },
  anxious: { label: 'Anxious', color: '#9b59b6', value: 1, icon: 'emoticon-frown-outline' },
  angry: { label: 'Angry', color: '#e74c3c', value: 1, icon: 'emoticon-angry-outline' },
  sad: { label: 'Sad', color: '#7286D3', value: 1, 'icon': 'emoticon-sad-outline' },
  verySad: { label: 'Very Sad', color: '#b44560', value: 0, icon: 'emoticon-cry-outline' },
  overwhelmed: { label: 'Overwhelmed', color: '#ffa502', value: 1, icon: 'emoticon-confused-outline' },
  tired: { label: 'Tired', color: '#95a5a6', value: 2, icon: 'emoticon-sick-outline' }, // FIXED: Added 'Tired' label
  hopeful: { label: 'Hopeful', color: '#00cec9', value: 4, icon: 'emoticon-wink-outline' }
};

const INSIGHT_ICON_SIZE = 18; // Smaller icon size for insights for text flow

// Helper component for displaying moods using MaterialCommunityIcons
const MoodDisplayIcon = ({ moodKey, size = INSIGHT_ICON_SIZE, color }) => {
  const mood = MOODS[moodKey];
  if (!mood || !mood.icon) return null; // Ensure mood and icon exist

  return (
    <MaterialCommunityIcons
      name={mood.icon}
      size={size}
      color={color || mood.color} // Use passed color or default mood color
      style={{ marginRight: 8 }} // Basic spacing
    />
  );
};

interface Habit {
  id: string;
  name: string;
  icon?: string;
  isCustom: boolean;
}

// Calendar component for habit visualization
const HabitCalendar = ({ habitData, habitName, selectedMonth, onMonthChange, selectedHabitDetails }) => {
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth(); // 0-indexed
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = habitData[dateKey]; // This 'habitData' now includes { completed: boolean; wasTracked: boolean; }

    // No need to re-calculate wasTracked or completed here.
    // They are directly available from dayData if dayData exists.
    // If dayData is null (for empty cells before 1st day), handle it gracefully with defaults.
    const completed = dayData?.completed || false;
    const wasTracked = dayData?.wasTracked || false; // Use the wasTracked from habitData

    calendarDays.push({
      day,
      dateKey,
      completed: completed,
      wasTracked: wasTracked
    });
  }

  // Calculate streak and total completion for the displayed month ONLY
  const monthCompletedCount = calendarDays.filter(day => day?.completed).length;
  const monthTrackedCount = calendarDays.filter(day => day?.wasTracked).length;

  // Calculate current month stats from the global habit data
  const getCurrentMonthStats = () => {
    if (!selectedHabitDetails) return { completed: 0, tracked: 0, rate: 0 };
    
    // Filter the habit's completion data for the current displayed month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    let monthCompleted = 0;
    let monthTracked = 0;
    
    // Use the completion data from selectedHabitDetails
    if (selectedHabitDetails.completionData) {
      selectedHabitDetails.completionData.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate >= monthStart && entryDate <= monthEnd) {
          monthTracked++;
          if (entry.completed === 1) {
            monthCompleted++;
          }
        }
      });
    }
    
    return {
      completed: monthCompleted,
      tracked: monthTracked,
      rate: monthTracked > 0 ? (monthCompleted / monthTracked * 100) : 0
    };
  };

  const monthStats = getCurrentMonthStats();

  // Function to navigate months
  const goToPreviousMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarNav}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#6B4EFF" />
        </TouchableOpacity>
        <Text style={styles.calendarTitleMonth}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <MaterialCommunityIcons name="chevron-right" size={30} color="#6B4EFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.calendarHeaderDay}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => (
          <View key={index} style={styles.calendarDay}>
            {dayData && (
              <View style={[
                styles.calendarDayCell,
                dayData.completed && styles.calendarDayCompleted,
                dayData.wasTracked && !dayData.completed && styles.calendarDayIncomplete,
                !dayData.wasTracked && styles.calendarDayUntracked
              ]}>
                <Text style={[
                  styles.calendarDayText,
                  dayData.completed && styles.calendarDayTextCompleted,
                  dayData.wasTracked && !dayData.completed && styles.calendarDayTextIncomplete,
                  !dayData.wasTracked && styles.calendarDayTextUntracked
                ]}>
                  {dayData.day}
                </Text>
                {dayData.completed && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color="#28A745"
                    style={styles.calendarDayIcon}
                  />
                )}
                {dayData.wasTracked && !dayData.completed && (
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={14}
                    color="#DC3545"
                    style={styles.calendarDayIcon}
                  />
                )}
              </View>
            )}
          </View>
        ))}
      </View>
      
      <View style={styles.calendarSummary}>
        <Text style={styles.calendarSummaryText}>
          Completed: <Text style={styles.calendarSummaryCompleted}>{monthStats.completed}</Text> of <Text style={styles.calendarSummaryTracked}>{monthStats.tracked}</Text> tracked days this month.
        </Text>
        {selectedHabitDetails?.longestStreak > 0 && (
          <Text style={styles.calendarSummaryText}>
            Longest Streak: <Text style={styles.calendarSummaryStreak}>{selectedHabitDetails.longestStreak} days</Text>
          </Text>
        )}
        {monthStats.tracked > 0 && (
          <Text style={styles.calendarSummaryText}>
            Monthly Rate: <Text style={styles.calendarSummaryCompleted}>{monthStats.rate.toFixed(1)}%</Text>
          </Text>
        )}
      </View>
    </View>
  );
};


// --- Decryption Function (CRITICAL: Now expects JSON structure from journal.tsx) ---
// --- Decryption Function (acum folosește encryptionKey din state) ---



const InsightsScreen = () => {
  const [processedEntries, setProcessedEntries] = useState([]); // Entries with sentiment and moodValue
  const [habitsData, setHabitsData] = useState([]); // Habits data from Firebase
  const [allMasterHabits, setAllMasterHabits] = useState<Habit[]>([]); // New state for all habits
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('mood'); // 'mood' or 'sentiment' (habit chart removed)
  const [timeframe, setTimeframe] = useState(30); // Default to 30 days
  const [showExplanation, setShowExplanation] = useState(false); // State for explanation visibility
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null); // For calendar view
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // For calendar navigation
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);
  const [user, setUser] = useState(null);
useEffect(() => {
  const unsubscribe = getAuth().onAuthStateChanged(u => {
      setUser(u);
    });
    return unsubscribe;
  }, []);
  const userId = user?.uid;
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

  useEffect(() => {
    getEncryptionKey()
      .then(key => {
        setEncryptionKey(key);
        setIsKeyLoaded(true);
      })
      .catch(err => {
        console.error('Nu am putut obține cheia de cripare:', err);
        setIsKeyLoaded(true);
      });
  }, []);
  
  // Function to toggle explanation visibility with animation
  const toggleExplanation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowExplanation(!showExplanation);
  };

  // Fetch all classic and custom habits
  const fetchAllMasterHabits = useCallback(async () => {
    if (!userId) return;
    try {
      const customHabitsQuery = query(
        collection(db, 'master_habits'),
        where('userId', '==', userId)
      );
      const customHabitsSnapshot = await getDocs(customHabitsQuery);
      const customHabits: Habit[] = customHabitsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        icon: doc.data().icon,
        isCustom: true,
      }));

      // Combine classic and custom habits
      const combinedHabits: Habit[] = [...CLASSIC_HABITS.map(h => ({ ...h, isCustom: false })), ...customHabits];
      setAllMasterHabits(combinedHabits);
    } catch (error) {
      console.error('Error fetching all master habits:', error);
    }
  }, [userId]);

  // --- Habits Data Fetching ---
  const setupHabitsListener = useCallback(() => {
    if (!userId) {
      console.warn('setupHabitsListener: No user ID found.');
      setHabitsData([]);
      return () => { };
    }

    const q = query(
      collection(db, 'daily_habits'), // Corrected collection name
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habits = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        habits.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        });
      });

      setHabitsData(habits);
    }, (error) => {
      console.error('onSnapshot (habits): Error listening to habits:', error);
    });

    return unsubscribe;
  }, [userId]);

  // --- Data Fetching and Processing ---
  const setupRealtimeListener = useCallback(() => {
   

    setLoading(true); // Indicate loading has started
    const q = query(
      collection(db, 'journal_entries'), // Ensure 'journal_entries' matches your Firestore collection name
      where('userId', '==', userId), // Ensure 'userId' field exists in your documents and matches the auth user's UID
      orderBy('createdAt', 'asc') // Order by date for correct trend calculation (oldest to newest)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const processed = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent);

        if (!decryptedData) {
          console.warn(`Decryption failed or returned null for entry ${doc.id}. Skipping this entry.`);
          return;
        }
        if (typeof decryptedData !== 'object') {
          console.warn(`Decrypted data for entry ${doc.id} is not an object (type: ${typeof decryptedData}). Skipping this entry.`);
          return;
        }
        if (!decryptedData.mood || !MOODS.hasOwnProperty(decryptedData.mood)) {
          console.warn(`Decrypted data for entry ${doc.id} is missing 'mood' field or has an invalid mood: '${decryptedData.mood}'. Skipping for mood/sentiment analysis.`);
          return;
        }
        if (!decryptedData.text) {
          console.warn(`Decrypted data for entry ${doc.id} is missing 'text' field or it's empty. Sentiment analysis for this entry will be neutral.`);
        }

        if (decryptedData && typeof decryptedData === 'object') {
          let entryDate;
          if (data.createdAt instanceof Timestamp) {
            entryDate = data.createdAt.toDate();
          } else if (data.createdAt && typeof data.createdAt === 'object' && 'seconds' in data.createdAt) {
            entryDate = new Date(data.createdAt.seconds * 1000);
          } else if (decryptedData.date) {
            entryDate = new Date(decryptedData.date);
          } else {
            console.warn(`Entry ${doc.id} missing valid date in Firestore 'createdAt' and decrypted data. Skipping this entry.`);
            return;
          }

          const journalText = decryptedData.text || '';
          const moodKey = (decryptedData.mood && MOODS[decryptedData.mood])
            ? decryptedData.mood
            : 'neutral';
          const moodValue = MOODS[moodKey]?.value || 0;

          let sentimentCompound = 0;
          if (journalText) {
            try {
              const sentimentResult = Sentiment.SentimentIntensityAnalyzer.polarity_scores(journalText);
              sentimentCompound = sentimentResult.compound;
            } catch (sentimentError) {
              console.error(`Sentiment analysis failed for entry ${doc.id}:`, sentimentError);
              sentimentCompound = 0;
            }
          }

          processed.push({
            id: doc.id,
            ...decryptedData,
            createdAt: entryDate,
            date: entryDate.toISOString().split('T')[0],
            journalText: journalText,
            sentimentScore: sentimentCompound,
            moodValue: moodValue,
            mood: moodKey,
          });
        } else {
          console.warn(`Entry ${doc.id} resulted in invalid decryptedData (null or not object) after initial check. Skipping this entry.`);
        }
      });

      setProcessedEntries(processed);
      setLoading(false); // Stop loading once data is processed

    }, (error) => {
      console.error('onSnapshot: Error listening to entries:', error);
      setLoading(false);
    });

    // Return the unsubscribe function from the useCallback.
    // This will be used by the useEffect's cleanup.
    return unsubscribe;
  }, [userId]); // Dependency: userId
useEffect(() => {
  // don’t start until we have both a logged-in user and the encryption key
  if (!userId || !isKeyLoaded) return;

  const unsubJournal = setupRealtimeListener();
  const unsubHabits  = setupHabitsListener();
  fetchAllMasterHabits();

  return () => {
    unsubJournal();
    unsubHabits();
  };
}, [
  userId,
  isKeyLoaded,
  setupRealtimeListener,
  setupHabitsListener,
  fetchAllMasterHabits
]);

    // Cleanup function: this will be called when the component unmounts
    // or before the effect re-runs (if dependencies change).

  // --- Habit Analytics Functions ---
  const getHabitAnalytics = useMemo(() => {
    if (habitsData.length === 0) return {
      habitsByDate: {},
      habitCompletionRates: {},
      habitPerformanceOverTime: {},
      habitLoadAnalysis: {},
      allHabits: []
    };

    // Group habits by date and habit name
    const habitsByDate: { [date: string]: { [habitName: string]: { completed: boolean; name: string; icon?: string; isCustom: boolean; } } } = {};
    const allHabits = new Set<string>(); // Use Set to store unique habit names

    habitsData.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!habitsByDate[dateKey]) {
        habitsByDate[dateKey] = {};
      }

      if (entry.habits && Array.isArray(entry.habits)) {
        entry.habits.forEach(habit => {
          allHabits.add(habit.name); // Add habit name to the set
          habitsByDate[dateKey][habit.name] = {
            completed: habit.completed || false,
            name: habit.name,
            icon: habit.icon, // Store icon
            isCustom: habit.isCustom // Store isCustom
          };
        });
      }
    });

    // Calculate completion rates for each habit
    const habitCompletionRates: { [habitName: string]: { rate: number; completedDays: number; totalDays: number; completionData: { date: string; completed: number; }[]; currentStreak: number; longestStreak: number; details: Habit; } } = {};
    const habitPerformanceOverTime: { [habitName: string]: { date: string; completed: number; }[] } = {};
    const habitLoadAnalysis: { [habitName: string]: { date: string; totalHabits: number; completedHabits: number; thisHabitCompleted: boolean; }[] } = {};

    // Replace the habit analytics calculation section in your getHabitAnalytics useMemo
// This goes around line 280 in your InsightsScreen component

Array.from(allHabits).forEach(habitName => {
  const completionData = [];
  const loadData = [];
  let totalDaysTrackedForHabit = 0;
  let completedDaysForHabit = 0; // This was never being incremented!

  // Filter allMasterHabits to get details for the current habitName
  const habitDetails = allMasterHabits.find(h => h.name === habitName);

  const sortedDates = Object.keys(habitsByDate).sort(); // Sort dates for streak calculation

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // First pass: collect all completion data and calculate totals
  sortedDates.forEach(dateKey => {
    const dayHabits = habitsByDate[dateKey];
    
    if (dayHabits[habitName]) {
      totalDaysTrackedForHabit++;
      const completed = dayHabits[habitName].completed;
      
      // THIS WAS MISSING - increment completed days counter
      if (completed) {
        completedDaysForHabit++;
      }

      // Add to completion data for performance chart
      completionData.push({
        date: dateKey,
        completed: completed ? 1 : 0
      });

      // Calculate streaks in chronological order
      if (completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0; // Reset streak on incomplete day
      }
    }

    // Add to load data (regardless of whether this habit was tracked)
    const totalHabitsForDay = Object.keys(dayHabits).length;
    const completedHabitsForDay = Object.values(dayHabits).filter(h => h.completed).length;
    loadData.push({
      date: dateKey,
      totalHabits: totalHabitsForDay,
      completedHabits: completedHabitsForDay,
      thisHabitCompleted: dayHabits[habitName]?.completed || false
    });
  });

  // Calculate current streak (from most recent date backwards)
  // Calculate current streak (from most recent date backwards)
currentStreak = 0;
let streakOngoing = true;
const today = new Date();
today.setHours(0, 0, 0, 0);
let reversedDates = [...sortedDates].reverse();

for (let i = 0; i < reversedDates.length && streakOngoing; i++) {
  const dateKey = reversedDates[i];
  const dateObj = new Date(dateKey);
  dateObj.setHours(0, 0, 0, 0);

  // Only count days up to today, ignore future days
  if (dateObj.getTime() > today.getTime()) continue;

  const dayRecord = habitsByDate[dateKey]?.[habitName];

  if (dayRecord && dayRecord.completed) {
    // Only count completed days for the streak
    currentStreak++;
  } else if (dayRecord && !dayRecord.completed) {
    // If day was tracked but not completed, streak ends
    streakOngoing = false;
  } else if (!dayRecord) {
    // If day is not tracked and it's before today, streak ends
    if (dateObj.getTime() < today.getTime()) {
      streakOngoing = false;
    }
  }
  // If today is not tracked, we just won't count it as part of the streak (just like longest)
}

  habitCompletionRates[habitName] = {
    rate: totalDaysTrackedForHabit > 0 ? (completedDaysForHabit / totalDaysTrackedForHabit) * 100 : 0,
    completedDays: completedDaysForHabit,
    totalDays: totalDaysTrackedForHabit,
    completionData: completionData, // Already in chronological order
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    details: habitDetails || { id: '', name: habitName, isCustom: false }
  };

  habitPerformanceOverTime[habitName] = completionData;
  habitLoadAnalysis[habitName] = loadData;
});

    return {
      habitsByDate,
      habitCompletionRates,
      habitPerformanceOverTime,
      habitLoadAnalysis,
      allHabits: Array.from(allHabits).map(name => allMasterHabits.find(h => h.name === name) || { id: name, name: name, isCustom: false }) // Return full habit objects
    };
  }, [habitsData, allMasterHabits]); // Depends on habitsData and allMasterHabits

  // --- Chart Data Preparation Function ---
  const getTrendData = useCallback((type, days) => {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);

    // This section related to 'habits' chart type is removed as per request.
    // if (type === 'habits' && selectedHabit && getHabitAnalytics.habitPerformanceOverTime) {
    //   // ... (removed habit trend chart data logic) ...
    // }

    const dailyAggregates: { [date: string]: { sum: number; count: number; } } = {};
    // Initialize aggregates for all days in the timeframe
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyAggregates[dateKey] = { sum: 0, count: 0 };
    }

    // Populate aggregates with actual entry data that falls within the timeframe
    processedEntries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      const dateKey = entryDate.toISOString().split('T')[0];

      // Ensure entryDate is within the desired range [startDate, endDate]
      if (entryDate >= startDate && entryDate <= endDate) {
        if (dailyAggregates[dateKey]) {
          if (type === 'mood') {
            dailyAggregates[dateKey].sum += entry.moodValue;
          } else if (type === 'sentiment') {
            dailyAggregates[dateKey].sum += entry.sentimentScore;
          }
          dailyAggregates[dateKey].count++;
        }
      }
    });

    const labels = [];
    const dataValues = [];

    // Extract labels and calculated averages for the chart, handling missing data points
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      const avg = dailyAggregates[dateKey].count > 0 ? (dailyAggregates[dateKey].sum / dailyAggregates[dateKey].count) : null;
      dataValues.push(avg);
    }

    return {
      labels,
      datasets: [{
        data: dataValues,
        color: (opacity = 1) => {
          if (type === 'mood') return `rgba(107, 78, 255, ${opacity})`; // Purple for mood
          if (type === 'sentiment') return `rgba(0, 188, 212, ${opacity})`; // Cyan for sentiment
          return `rgba(0,0,0,${opacity})`;
        },
        strokeWidth: 2,
      }]
    };
  }, [processedEntries]); // Removed selectedHabit and getHabitAnalytics as dependencies

  // --- Data for Chart Width Calculation ---
  const moodTrendData = getTrendData('mood', timeframe);
  const sentimentTrendData = getTrendData('sentiment', timeframe);
  // Removed habitTrendData as it's no longer used for the main chart


  // Calculate dynamic chart width based on the number of labels
  const chartWidth = useMemo(() => {
    const minScreenWidthPadding = 40; // Total padding from screen edges (20px left + 20px right)
    const baseChartWidth = screenWidth - minScreenWidthPadding;

    // Estimate width needed per label to avoid overlap
    const widthPerDay = 50; // Pixels per day/label

    let currentData;
    switch (chartType) {
      case 'mood':
        currentData = moodTrendData;
        break;
      case 'sentiment':
        currentData = sentimentTrendData;
        break;
      // case 'habits': // Removed
      //   currentData = habitTrendData;
      //   break;
      default:
        currentData = moodTrendData;
    }

    const currentLabelsLength = currentData.labels.length;
    const calculatedWidth = currentLabelsLength * widthPerDay;

    // Ensure the chart is at least screenWidth minus padding, but expands for more data
    return Math.max(baseChartWidth, calculatedWidth);
  }, [timeframe, chartType, moodTrendData, sentimentTrendData]); // Removed habitTrendData as dependency

  // Use useMemo for dailyInsights to ensure it recalculates when dependencies change
  const dailyInsights = useMemo(() => {
    const insights: {
      title: string;
      text: string;
      iconComponent?: React.ReactNode;
    }[] = [];
    const totalEntries = processedEntries.length;
    if (totalEntries === 0 && habitsData.length === 0) {
      insights.push({
        title: '🚀 Ready to Start Your Journey',
        text: `It looks like you haven't logged any entries or habits yet. Once you start journaling and tracking habits, we'll begin to unlock personalized insights and trend data for you here!`
      });
      return insights.map(insight => ({
        ...insight,
        title: String(insight.title || ''),
        text: String(insight.text || ''),
        iconComponent: insight.iconComponent || null
      }));
    }

    // Add habit-specific insights
    if (getHabitAnalytics.allHabits && getHabitAnalytics.allHabits.length > 0) {
      const topHabits = Object.entries(getHabitAnalytics.habitCompletionRates)
        .sort(([, a], [, b]) => b.rate - a.rate)
        .slice(0, 3);

      if (topHabits.length > 0) {
        const [topHabitName, topHabitData] = topHabits[0];
        insights.push({
          title: '🏆 Your Top Performing Habit',
          text: `**${topHabitName}** is your most consistent habit with a **${topHabitData.rate.toFixed(1)}%** completion rate (${topHabitData.completedDays}/${topHabitData.totalDays} days).`,
          iconComponent: <MaterialCommunityIcons name="trophy" size={INSIGHT_ICON_SIZE} color="#FFD700" style={styles.insightIcon} />
        });
      }

      // Habit load analysis
      const avgHabitsPerDay = habitsData.reduce((sum, day) => {
        return sum + (day.habits ? day.habits.length : 0);
      }, 0) / Math.max(habitsData.length, 1);

      const avgCompletionRate = Object.values(getHabitAnalytics.habitCompletionRates)
        .reduce((sum, habit) => sum + habit.rate, 0) / Object.keys(getHabitAnalytics.habitCompletionRates).length;

      if (!isNaN(avgHabitsPerDay) && !isNaN(avgCompletionRate)) {
        insights.push({
          title: '📊 Habit Load Analysis',
          text: `You track an average of **${avgHabitsPerDay.toFixed(1)} habits per day** with an overall completion rate of **${avgCompletionRate.toFixed(1)}%**. ${avgHabitsPerDay > 5 ? 'Consider focusing on fewer habits for better consistency.' : 'You have a manageable habit load!'}`
        });
      }
    }

    // Calculate journaling streak (adapted for insights screen)
    let currentStreak = 0;
    if (processedEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const entryDates = new Set(processedEntries.map(entry => {
        const d = new Date(entry.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }));

      let checkDate = new Date(today);
      let hasEntryToday = entryDates.has(checkDate.getTime());

      if (hasEntryToday) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (entryDates.has(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    if (currentStreak > 0) {
      if (currentStreak >= 100) {
        insights.push({
          title: '🔥 Incredible Consistency',
          text: `You're on a phenomenal **${currentStreak}-day streak!** This dedication to self-reflection is truly inspiring.`,
          iconComponent: <MaterialCommunityIcons name="fire" size={INSIGHT_ICON_SIZE} color="#FF4500" style={styles.insightIcon} />
        });
      } else if (currentStreak >= 30) {
        insights.push({
          title: '🎯 Building a Powerful Habit',
          text: `Fantastic! Your **${currentStreak}-day streak** shows strong commitment. You're building a valuable habit.`,
          iconComponent: <MaterialCommunityIcons name="target" size={INSIGHT_ICON_SIZE} color="#28A745" style={styles.insightIcon} />
        });
      } else if (currentStreak >= 7) {
        insights.push({
          title: '📈 Momentum Gained',
          text: `Great job on your **${currentStreak}-day streak!** You're maintaining good consistency.`,
          iconComponent: <MaterialCommunityIcons name="trending-up" size={INSIGHT_ICON_SIZE} color="#00BFFF" style={styles.insightIcon} />
        });
      } else {
        insights.push({
          title: '🌱 Starting Strong',
          text: `You're **${currentStreak} days** into your journaling journey. Every entry contributes to your growth!`,
          iconComponent: <MaterialCommunityIcons name="leaf" size={INSIGHT_ICON_SIZE} color="#8BC34A" style={styles.insightIcon} />
        });
      }
    } else if (totalEntries > 0) {
      insights.push({
        title: '💡 Time to Reflect',
        text: `No active streak right now. Remember, consistency is key! Log an entry to start your streak.`,
        iconComponent: <MaterialCommunityIcons name="lightbulb-on-outline" size={INSIGHT_ICON_SIZE} color="#FFC107" style={styles.insightIcon} />
      });
    }

    // Mood trend analysis
    if (totalEntries > 0) {
      const avgMoodValueOverall = processedEntries.reduce((sum, entry) => sum + entry.moodValue, 0) / totalEntries;
      let moodTrendLabel = 'neutral';
      let moodIcon = MOODS.neutral.icon;
      let moodColor = MOODS.neutral.color;

      // Using the mood value scale (0-5)
      if (avgMoodValueOverall >= 4.0) {
        moodTrendLabel = 'predominantly positive';
        moodIcon = MOODS.veryHappy.icon;
        moodColor = MOODS.veryHappy.color;
      } else if (avgMoodValueOverall >= 3.0) {
        moodTrendLabel = 'generally content';
        moodIcon = MOODS.content.icon;
        moodColor = MOODS.content.color;
      } else if (avgMoodValueOverall <= 1.0) {
        moodTrendLabel = 'leaning towards negative';
        moodIcon = MOODS.verySad.icon;
        moodColor = MOODS.verySad.color;
      } else if (avgMoodValueOverall < 2.0) {
        moodTrendLabel = 'somewhat low';
        moodIcon = MOODS.sad.icon;
        moodColor = MOODS.sad.color;
      }

      insights.push({
        title: 'Overall Mood Trend',
        text: `Your average mood over the tracked period has been **${moodTrendLabel}**. This is based on your mood selections.`,
        iconComponent: <MaterialCommunityIcons name={moodIcon} size={INSIGHT_ICON_SIZE} color={moodColor} style={styles.insightIcon} />
      });

      // Sentiment analysis from text
      const avgSentimentScoreOverall = processedEntries.reduce((sum, entry) => sum + entry.sentimentScore, 0) / totalEntries;
      let sentimentLabel = 'neutral';
      let sentimentColor = '#92beb5'; // Neutral color
      let sentimentIcon = 'comment-text-multiple-outline';

      if (avgSentimentScoreOverall > 0.2) {
        sentimentLabel = 'positive';
        sentimentColor = '#4CAF50'; // Happy color
        sentimentIcon = 'emoticon-happy';
      } else if (avgSentimentScoreOverall < -0.2) {
        sentimentLabel = 'negative';
        sentimentColor = '#e74c3c'; // Angry color
        sentimentIcon = 'emoticon-sad';
      }

      insights.push({
        title: 'Journal Sentiment',
        text: `The sentiment in your journal entries has been predominantly **${sentimentLabel}**. This indicates the emotional tone of your writing.`,
        iconComponent: <MaterialCommunityIcons name={sentimentIcon} size={INSIGHT_ICON_SIZE} color={sentimentColor} style={styles.insightIcon} />
      });
    }

    return insights;
  }, [processedEntries, habitsData, getHabitAnalytics]);


  // Handler for habit selection
  const handleHabitSelect = useCallback((habit: Habit) => {
    setSelectedHabit(habit);
    setSelectedMonth(new Date()); // Reset calendar to current month when new habit is selected
  }, []);

  // Handler for month change in habit calendar
  const handleMonthChange = useCallback((newMonth: Date) => {
    setSelectedMonth(newMonth);
  }, []);

  const renderChart = () => {
  let data;
  let chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(45, 52, 54, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6B4EFF',
    },
    linejoinType: 'round' as const,
    propsForBackgroundLines: {
      strokeDasharray: '0',
      stroke: '#e0e0e0',
    },
    paddingLeft: 70, // Keep this increased for now
    paddingRight: 20,
  };

  let yAxisLabel = '';
  let hasData = true;
  let lineChartSpecificProps: {
    yAxisInterval?: number;
    yAxisMin?: number;
    yAxisMax?: number;
    fromZero: boolean;
    segments: number;
    formatYLabel?: (label: string) => string;
    withCustomYAxisLabels?: boolean; // Add this prop to the type definition
    yAxisLabels?: string[];         // Add this prop to the type definition
  };

  // --- DECLARE CUSTOM Y-AXIS LABEL ARRAYS HERE (OUTSIDE SWITCH) ---
  let customSentimentYLabels: string[] | undefined;
  let customMoodYLabels: string[] | undefined; // If you plan to use it for mood too

  switch (chartType) {
    case 'mood':
      data = moodTrendData;
      chartConfig.decimalPlaces = 0;
      chartConfig.color = (opacity = 1) => `rgba(107, 78, 255, ${opacity})`;
      chartConfig.propsForDots.stroke = '#6B4EFF';

      // --- MOOD: Prepare custom labels if needed (optional for mood, but good for consistency) ---
      customMoodYLabels = ['0', '1', '2', '3', '4', '5'];

      lineChartSpecificProps = {
        fromZero: true,
        segments: 4,
        yAxisMin: 0,
        yAxisMax: 5,
        yAxisInterval: 1,
        formatYLabel: (label) => {
            return Math.round(parseFloat(label)).toString();
        },
        // withCustomYAxisLabels: true, // Uncomment if you want to force these for mood too
        // yAxisLabels: customMoodYLabels,
      };
      break;

    case 'sentiment':
      data = sentimentTrendData;
      chartConfig.decimalPlaces = 1;
      chartConfig.color = (opacity = 1) => `rgba(0, 188, 212, ${opacity})`;
      chartConfig.propsForDots.stroke = '#00BCD4';

      // --- SENTIMENT: Prepare custom labels ---
      customSentimentYLabels = ['-1.0', '-0.5', '0.0', '0.5', '1.0']; // Explicit strings

      lineChartSpecificProps = {
        fromZero: false,
        segments: 4,
        yAxisMin: -1,
        yAxisMax: 1,
        yAxisInterval: 0.5,
        formatYLabel: (label) => {
            return parseFloat(label).toFixed(1);
        },
        withCustomYAxisLabels: true, // Activate custom labels for sentiment
        yAxisLabels: customSentimentYLabels, // Assign the prepared labels
      };
      hasData = data.datasets[0].data.some(val => val !== null);
      break;

    default:
      data = { labels: [], datasets: [{ data: [] }] };
      hasData = false;
      lineChartSpecificProps = {
        fromZero: true,
        segments: 1,
      };
  }

  if (!hasData) {
    return (
      <View style={styles.noDataContainer}>
        <MaterialCommunityIcons name="chart-line-variant" size={50} color="#ccc" />
        <Text style={styles.noDataText}>
          No {chartType} data available for this period. Add entries to see your trends!
        </Text>
      </View>
    );
  }
  // Remove the global formatYLabel as it's now part of lineChartSpecificProps
  // const formatYLabel = (label) => { /* ... */ };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentOffset={{ x: chartWidth - (screenWidth - 40), y: 0 }}
    >
      <LineChart
        data={data}
        width={chartWidth}
        height={220}
        yAxisLabel={yAxisLabel}
        yAxisSuffix=""
        yLabelsOffset={1.3} 
        fromZero={true}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        {...lineChartSpecificProps}
        
        // Note: The `withCustomYAxisLabels` and `yAxisLabels` are now spread from `lineChartSpecificProps`
        // so you don't need to explicitly list them here again.
      />
    </ScrollView>
  );
};
  const getHabitCalendarData = useMemo(() => {
    if (!selectedHabit || !getHabitAnalytics.habitsByDate) return {};

    // Change the type to include 'wasTracked'
    const calendarData: { [date: string]: { completed: boolean; wasTracked: boolean; } } = {};
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    // Iterate through all days in the selected month
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayHabitsForDate = getHabitAnalytics.habitsByDate[dateKey]; // All habits recorded on this date

      // Check if the SPECIFIC selected habit was tracked on this day
      const specificHabitEntry = dayHabitsForDate ? dayHabitsForDate[selectedHabit.name] : null;

      if (specificHabitEntry) {
        // If the specific habit entry exists for this day
        calendarData[dateKey] = {
          completed: specificHabitEntry.completed,
          wasTracked: true // It was definitely tracked
        };
      } else {
        // If no specific habit entry exists for this day
        calendarData[dateKey] = {
          completed: false, // It was not completed (default for untracked)
          wasTracked: false // It was NOT tracked for this specific habit
        };
      }
    }
    return calendarData;
  }, [selectedHabit, selectedMonth, getHabitAnalytics.habitsByDate]);


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <ActivityIndicator size="large" color="#6B4EFF" style={{ marginTop: 50 }} />
      ) : (
        <>
          {/* Mood/Sentiment Trend Chart Section */}
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#6B4EFF" style={styles.insightsHeaderIcon} />
              <Text style={styles.insightsTitle}>Your Trends Over Time</Text>
            </View>

            <View style={styles.chartTypeButtons}>
              <TouchableOpacity
                style={[styles.chartTypeButton, chartType === 'mood' && styles.chartTypeButtonActive]}
                onPress={() => setChartType('mood')}
              >
                <Text style={[styles.chartTypeButtonText, chartType === 'mood' && styles.chartTypeButtonTextActive]}>Mood</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartTypeButton, chartType === 'sentiment' && styles.chartTypeButtonActive]}
                onPress={() => setChartType('sentiment')}
              >
                <Text style={[styles.chartTypeButtonText, chartType === 'sentiment' && styles.chartTypeButtonTextActive]}>Sentiment</Text>
              </TouchableOpacity>
              {/* Removed Habits Chart Type Button */}
            </View>

            {/* Removed Habits Chart Selector */}

            <View style={styles.dateRangeButtons}>
              {['7d', '30d', '90d', '1y', 'all'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[styles.dateRangeButton, timeframe === parseInt(range.replace('d', '').replace('y', '365')) && styles.dateRangeButtonActive]}
                  onPress={() => {
                    let days;
                    switch (range) {
                      case '7d': days = 7; break;
                      case '30d': days = 30; break;
                      case '90d': days = 90; break;
                      case '1y': days = 365; break;
                      case 'all': days = 365 * 5; break; // A large number for 'all'
                      default: days = 30;
                    }
                    setTimeframe(days);
                  }}
                >
                  <Text style={[styles.dateRangeButtonText, timeframe === parseInt(range.replace('d', '').replace('y', '365')) && styles.dateRangeButtonTextActive]}>
                    {range === '1y' ? '1 Year' : range.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {renderChart()}

            <TouchableOpacity onPress={toggleExplanation} style={styles.explanationToggle}>
              <Text style={styles.explanationToggleText}>
                {showExplanation ? 'Hide Explanation' : 'What do these charts mean?'}
              </Text>
              <MaterialCommunityIcons
                name={showExplanation ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B4EFF"
              />
            </TouchableOpacity>

            {showExplanation && (
              <View style={styles.explanationContent}>
                <Text style={styles.explanationTitle}>Mood Trend Chart:</Text>
                <Text style={styles.explanationText}>
                  This chart shows your average mood score over time. Moods are mapped to a scale from 0 (very sad) to 5 (very happy). Higher values indicate a more positive mood.
                </Text>
                <Text style={styles.explanationTitle}>Sentiment Trend Chart:</Text>
                <Text style={styles.explanationText}>
                  This chart visualizes the sentiment of your journal entries, from -1 (very negative) to 1 (very positive). It reflects the emotional tone of your writing.
                </Text>
                {/* Removed Habit Completion Chart explanation */}
              </View>
            )}

          </View>

          {/* Habit Calendar Section - MOVED TO HERE */}
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#6B4EFF" style={styles.insightsHeaderIcon} />
              <Text style={styles.insightsTitle}>Habit Calendar View</Text>
            </View>

            {getHabitAnalytics.allHabits.length === 0 ? (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="check-all" size={50} color="#ccc" />
                <Text style={styles.noDataText}>
                  No habits found. Add some from the home screen to view their calendar!
                </Text>
              </View>
            ) : (
              <>
                {!selectedHabit ? (
                  <View style={styles.habitListContainer}>
                    <Text style={styles.sectionSubtitle}>Select a habit to view its calendar:</Text>
                    <FlatList scrollEnabled={false} // Prevents nested scroll view error
                      data={getHabitAnalytics.allHabits}
                      keyExtractor={(item) => `${item.id}-${item.isCustom ? 'custom' : 'classic'}`}
                      renderItem={({ item: habit }) => (
                        <TouchableOpacity
                          style={styles.habitSelectItem}
                          onPress={() => handleHabitSelect(habit)}
                        >
                          <MaterialCommunityIcons name={habit.icon || 'star'} size={20} color="#6B4EFF" />
                          <Text style={styles.habitSelectItemText}>{habit.name}</Text>
                          <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
                        </TouchableOpacity>
                      )}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                ) : (
                  <View style={styles.selectedHabitCalendarContainer}>
                    <TouchableOpacity onPress={() => setSelectedHabit(null)} style={styles.backButton}>
                      <MaterialCommunityIcons name="arrow-left" size={24} color="#6B4EFF" />
                      <Text style={styles.backButtonText}>Back to All Habits</Text>
                    </TouchableOpacity>

                    <View style={styles.selectedHabitHeader}>
                      <MaterialCommunityIcons name={selectedHabit.icon || 'check-all'} size={30} color="#6B4EFF" />
                      <Text style={styles.selectedHabitName}>{selectedHabit.name}</Text>
                    </View>

                    {/* Display basic stats for the selected habit */}
                    {getHabitAnalytics.habitCompletionRates[selectedHabit.name] && (
                      <View style={styles.habitStatsContainer}>
                        <View style={styles.habitStatItem}>
                          <Text style={styles.habitStatValue}>{getHabitAnalytics.habitCompletionRates[selectedHabit.name].completedDays}</Text>
                          <Text style={styles.habitStatLabel}>Completed</Text>
                        </View>
                        <View style={styles.habitStatItem}>
                          <Text style={styles.habitStatValue}>{getHabitAnalytics.habitCompletionRates[selectedHabit.name].totalDays}</Text>
                          <Text style={styles.habitStatLabel}>Tracked</Text>
                        </View>
                        <View style={styles.habitStatItem}>
                          <Text style={styles.habitStatValue}>{getHabitAnalytics.habitCompletionRates[selectedHabit.name].rate.toFixed(1)}%</Text>
                          <Text style={styles.habitStatLabel}>Rate</Text>
                        </View>
                        <View style={styles.habitStatItem}>
                          <Text style={styles.habitStatValue}>{getHabitAnalytics.habitCompletionRates[selectedHabit.name].currentStreak}</Text>
                          <Text style={styles.habitStatLabel}>Current Streak</Text>
                        </View>
                      </View>
                    )}


                    <HabitCalendar
                      habitData={getHabitCalendarData}
                      habitName={selectedHabit.name}
                      selectedMonth={selectedMonth}
                      onMonthChange={handleMonthChange}
                      selectedHabitDetails={getHabitAnalytics.habitCompletionRates[selectedHabit.name]}
                    />
                  </View>
                )}
              </>
            )}
          </View>


          {/* Enhanced Personalized Insights Section - MOVED AFTER HABIT CALENDAR */}
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsHeaderIcon}>⚡</Text>
              <Text style={styles.insightsTitle}>Personalized Insights</Text>
            </View>
            <View style={styles.insightsContainer}>
              {dailyInsights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <View style={styles.insightItemHeader}>
                    {insight.iconComponent || null}
                    <Text style={styles.insightItemTitle}>{insight.title}</Text>
                  </View>
                  <Text style={styles.insightText}>
                    {insight.text.split('**').map((part, i) => (
                      i % 2 === 1 ? <Text key={i} style={{ fontWeight: 'bold' }}>{part}</Text> : <Text key={i}>{part}</Text>
                    ))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default InsightsScreen;
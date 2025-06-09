import styles from "../styles/profile.styles"
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { db } from '../../firebaseConfig'; // Adjust path as needed
import { getAuth } from 'firebase/auth';

const { width: screenWidth } = Dimensions.get('window');

// Encryption key - should match the one from your journal component
const ENCRYPTION_KEY = 'ezYxGHuBw5W5jKewAnJsmie52Ge14WCzk+mIW8IFD6gzl/ubFlHjGan+LbcJ2M1m';

// Decryption function
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Mock mood data - this would come from your Firebase entries
const MOODS = {
  veryHappy: { label: 'Very Happy', color: '#FFD93D', value: 5, icon: '😄' },
  happy: { label: 'Happy', color: '#4CAF50', value: 4, icon: '😊' },
  content: { label: 'Content', color: '#7ED6DF', value: 3, icon: '😌' },
  neutral: { label: 'Meh', color: '#92beb5', value: 2, icon: '😐' },
  anxious: { label: 'Anxious', color: '#9b59b6', value: 1, icon: '😰' },
  angry: { label: 'Angry', color: '#e74c3c', value: 1, icon: '😠' },
  sad: { label: 'Sad', color: '#7286D3', value: 1, icon: '😢' },
  verySad: { label: 'Very Sad', color: '#b44560', value: 0, icon: '😭' },
  overwhelmed: { label: 'Overwhelmed', color: '#ffa502', value: 1, icon: '😵' },
  tired: { label: 'Tired', color: '#95a5a6', value: 2, icon: '😴' },
  hopeful: { label: 'Hopeful', color: '#00cec9', value: 4, icon: '🤗' }
};

// Mock data for demonstration (fallback when no real data is available)
const generateMockData = () => {
  const moods = Object.keys(MOODS);
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const mood = moods[Math.floor(Math.random() * moods.length)];
    data.push({
      date: date.toISOString().split('T')[0],
      mood: mood,
      value: MOODS[mood].value,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  return data;
};

const MoodProfileDashboard = () => {
  const [moodData, setMoodData] = useState([]);
  const [currentMood, setCurrentMood] = useState('happy');
  const [streak, setStreak] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [totalEntries, setTotalEntries] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState(['first_entry', 'week_streak', 'mood_explorer']);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  // Load real entries from Firebase
  const loadEntries = async () => {
    if (!user) return;
    
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
            createdAt: data.createdAt
          });
        }
      });
      
      setEntries(loadedEntries);
      setTotalEntries(loadedEntries.length);
      
      // Convert entries to mood data format
      const moodDataFromEntries = loadedEntries.map(entry => {
        const entryDate = entry.createdAt?.seconds 
          ? new Date(entry.createdAt.seconds * 1000) 
          : new Date(entry.date);
        
        return {
          date: entryDate.toISOString().split('T')[0],
          mood: entry.mood,
          value: MOODS[entry.mood]?.value || 3,
          dayName: entryDate.toLocaleDateString('en-US', { weekday: 'short' }),
          createdAt: entryDate
        };
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setMoodData(moodDataFromEntries.length > 0 ? moodDataFromEntries : generateMockData());
      
      // Set current mood to the most recent entry
      if (loadedEntries.length > 0) {
        setCurrentMood(loadedEntries[0].mood);
      }
      
    } catch (error) {
      console.error('Error loading entries:', error);
      // Fallback to mock data if there's an error
      setMoodData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // Calculate streak from real data
  const calculateStreak = async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      let currentStreak = 0;
      let checkDate = new Date(startOfToday);
      
      const entriesByDate = new Map();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const entryDate = data.createdAt?.seconds 
          ? new Date(data.createdAt.seconds * 1000)
          : new Date();
        const dateKey = entryDate.toDateString();
        if (!entriesByDate.has(dateKey)) {
          entriesByDate.set(dateKey, true);
        }
      });
      
      // Check consecutive days starting from today
      while (true) {
        const dateKey = checkDate.toDateString();
        if (entriesByDate.has(dateKey)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (checkDate.toDateString() === startOfToday.toDateString()) {
          // No entry today, but check yesterday
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
      setStreak(0);
    }
  };

  useEffect(() => {
    if (user) {
      loadEntries();
      calculateStreak();
    } else {
      // If no user, use mock data
      setMoodData(generateMockData());
    }
  }, [user]);

  // Calculate mood statistics
  const getMoodStats = () => {
    const moodCounts = {};
    Object.keys(MOODS).forEach(mood => moodCounts[mood] = 0);
    
    moodData.forEach(entry => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });

    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: moodData.length > 0 ? ((count / moodData.length) * 100).toFixed(1) : 0,
        ...MOODS[mood]
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getAverageMood = () => {
    if (moodData.length === 0) return 0;
    const sum = moodData.reduce((acc, entry) => {
      const moodValue = MOODS[entry.mood]?.value || 3;
      return acc + moodValue;
    }, 0);
    return (sum / moodData.length).toFixed(1);
  };

  // Update badges based on real data
  const updateBadges = () => {
    const newBadges = [];
    
    if (totalEntries > 0) newBadges.push('first_entry');
    if (streak >= 7) newBadges.push('week_streak');
    if (getMoodStats().filter(mood => mood.count > 0).length >= 5) newBadges.push('mood_explorer');
    if (totalEntries >= 30) newBadges.push('month_warrior');
    if (totalEntries >= 100) newBadges.push('reflection_guru');
    
    // Check for positivity (70% positive moods)
    const positiveMoods = ['veryHappy', 'happy', 'content', 'hopeful'];
    const positiveCount = moodData.filter(entry => positiveMoods.includes(entry.mood)).length;
    if (moodData.length > 0 && (positiveCount / moodData.length) >= 0.7) {
      newBadges.push('positivity_champion');
    }
    
    setUnlockedBadges(newBadges);
  };

  useEffect(() => {
    updateBadges();
  }, [totalEntries, streak, moodData]);

  const badges = [
    { id: 'first_entry', name: 'First Steps', description: 'Created your first journal entry', icon: '🌱', color: '#4CAF50' },
    { id: 'week_streak', name: 'Consistency', description: '7-day journaling streak', icon: '🔥', color: '#FF9800' },
    { id: 'mood_explorer', name: 'Emotional Range', description: 'Logged 5 different moods', icon: '🎭', color: '#9C27B0' },
    { id: 'month_warrior', name: 'Month Warrior', description: '30 journal entries', icon: '⚔️', color: '#2196F3' },
    { id: 'positivity_champion', name: 'Positivity Champion', description: '70% positive moods', icon: '☀️', color: '#FFD93D' },
    { id: 'self_care', name: 'Self Care Master', description: 'Added 50 photos to entries', icon: '💝', color: '#E91E63' },
    { id: 'reflection_guru', name: 'Reflection Guru', description: '100 journal entries', icon: '🧠', color: '#6B4EFF' },
    { id: 'mindful_moments', name: 'Mindful Moments', description: 'Journaled for 3 months', icon: '🧘', color: '#00BCD4' }
  ];

  const moodTrendData = moodData.slice(-7).map(entry => MOODS[entry.mood]?.value || 3);
  const moodTrendLabels = moodData.slice(-7).map(entry => entry.dayName);

  const moodDistribution = getMoodStats().slice(0, 5);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(107, 78, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6B4EFF'
    }
  };

  const StatCard = ({ icon, value, label, gradient }) => (
    <View style={[styles.statCard, { backgroundColor: gradient }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MoodButton = ({ moodKey, mood, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.moodButton,
        isSelected && styles.moodButtonSelected
      ]}
      onPress={() => onPress(moodKey)}
    >
      <Text style={styles.moodButtonIcon}>{mood.icon}</Text>
    </TouchableOpacity>
  );

  const BadgeCard = ({ badge, isUnlocked }) => (
    <View style={[
      styles.badgeCard,
      isUnlocked ? styles.badgeUnlocked : styles.badgeLocked
    ]}>
      <Text style={[
        styles.badgeIcon,
        !isUnlocked && styles.badgeIconLocked
      ]}>
        {badge.icon}
      </Text>
      <Text style={[
        styles.badgeName,
        !isUnlocked && styles.badgeTextLocked
      ]}>
        {badge.name}
      </Text>
      <Text style={[
        styles.badgeDescription,
        !isUnlocked && styles.badgeTextLocked
      ]}>
        {badge.description}
      </Text>
      {isUnlocked && (
        <Text style={styles.badgeStar}>⭐</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading your mood profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Current Mood */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Mood Profile</Text>
            <Text style={styles.subtitle}>Track your emotional journey</Text>
          </View>
          <View style={styles.currentMoodContainer}>
            <Text style={styles.currentMoodIcon}>{MOODS[currentMood]?.icon || '😊'}</Text>
            <View>
              <Text style={styles.currentMoodLabel}>Currently</Text>
              <Text style={[styles.currentMoodText, { color: MOODS[currentMood]?.color || '#4CAF50' }]}>
                {MOODS[currentMood]?.label || 'Happy'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats - Now using real data */}
        <View style={styles.statsContainer}>
          <StatCard icon="🔥" value={streak} label="Day Streak" gradient="#8B5CF6" />
          <StatCard icon="📅" value={totalEntries} label="Total Entries" gradient="#3B82F6" />
          <StatCard icon="📈" value={getAverageMood()} label="Avg Mood" gradient="#10B981" />
          <StatCard icon="🏆" value={unlockedBadges.length} label="Badges" gradient="#F59E0B" />
        </View>
      </View>

      {/* Mood Trend Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>7-Day Mood Trend</Text>
          <View style={styles.periodSelector}>
            {['7d', '30d', '90d'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonSelected
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextSelected
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {moodTrendData.length > 0 && (
          <LineChart
            data={{
              labels: moodTrendLabels,
              datasets: [{ data: moodTrendData.length > 0 ? moodTrendData : [3] }]
            }}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* Mood Distribution */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Mood Distribution</Text>
        <View style={styles.moodDistributionContainer}>
          {moodDistribution.map((mood, index) => (
            <View key={mood.mood} style={styles.moodDistributionItem}>
              <Text style={styles.moodDistributionIcon}>{mood.icon}</Text>
              <View style={styles.moodDistributionContent}>
                <View style={styles.moodDistributionHeader}>
                  <Text style={styles.moodDistributionLabel}>{mood.label}</Text>
                  <Text style={styles.moodDistributionPercentage}>{mood.percentage}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${mood.percentage}%`, 
                        backgroundColor: mood.color 
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Today's Mood Meter */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Today's Mood Meter</Text>
        <View style={styles.moodMeterContainer}>
          <View style={styles.moodMeterCenter}>
            <Text style={styles.moodMeterIcon}>{MOODS[currentMood]?.icon || '😊'}</Text>
            <Text style={styles.moodMeterPercentage}>
              {(((MOODS[currentMood]?.value || 4) / 5) * 100).toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.moodMeterLabel}>{MOODS[currentMood]?.label || 'Happy'}</Text>
          <View style={styles.moodButtonsContainer}>
            {Object.entries(MOODS).slice(0, 5).map(([key, mood]) => (
              <MoodButton
                key={key}
                moodKey={key}
                mood={mood}
                isSelected={currentMood === key}
                onPress={setCurrentMood}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Badges & Achievements */}
      <View style={styles.chartCard}>
        <View style={styles.badgesHeader}>
          <Text style={styles.badgesHeaderIcon}>🏆</Text>
          <Text style={styles.chartTitle}>Achievements & Badges</Text>
        </View>
        <View style={styles.badgesContainer}>
          {badges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isUnlocked={isUnlocked}
              />
            );
          })}
        </View>
      </View>

      {/* Period Comparison */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Period Comparison</Text>
        <View style={styles.comparisonContainer}>
          <View style={[styles.comparisonCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.comparisonIcon}>🧠</Text>
            <Text style={styles.comparisonTitle}>This Week</Text>
            <Text style={[styles.comparisonValue, { color: '#3B82F6' }]}>{getAverageMood()}</Text>
            <Text style={styles.comparisonSubtitle}>Average Mood</Text>
          </View>
          <View style={[styles.comparisonCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.comparisonIcon}>❤️</Text>
            <Text style={styles.comparisonTitle}>Total</Text>
            <Text style={[styles.comparisonValue, { color: '#10B981' }]}>{totalEntries}</Text>
            <Text style={styles.comparisonSubtitle}>Journal Entries</Text>
          </View>
          <View style={[styles.comparisonCard, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.comparisonIcon}>📈</Text>
            <Text style={styles.comparisonTitle}>Streak</Text>
            <Text style={[styles.comparisonValue, { color: '#8B5CF6' }]}>{streak}</Text>
            <Text style={styles.comparisonSubtitle}>Days in a row</Text>
          </View>
        </View>
      </View>

      {/* Daily Insights */}
      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsHeaderIcon}>⚡</Text>
          <Text style={styles.insightsTitle}>Daily Insights</Text>
        </View>
        <View style={styles.insightsContainer}>
          <View style={styles.insightItem}>
            <Text style={styles.insightTitle}>🌟 Journaling Progress</Text>
            <Text style={styles.insightText}>
              {streak > 0 
                ? `Amazing! You're on a ${streak}-day streak. Keep up the great work!`
                : "Start your journaling journey today and build a healthy habit!"
              }
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightTitle}>📈 Mood Tracking</Text>
            <Text style={styles.insightText}>
              {totalEntries > 0 
                ? `You've recorded ${totalEntries} entries with an average mood of ${getAverageMood()}/5.0`
                : "Begin tracking your moods to see patterns and insights over time!"
              }
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MoodProfileDashboard;
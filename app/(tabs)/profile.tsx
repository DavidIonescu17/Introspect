import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router'; 
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import styles from "../styles/profile.styles";

// Import MaterialCommunityIcons for custom mood icons
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

// Encryption key - should match the one from your journal component
const ENCRYPTION_KEY = 'ezYxGHuBw5W5jKewAnJsmie52Ge14WCzk+mIW8IFD6gzl/ubFlHjGan+LbcJ2M1m';

// Decryption function
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      console.warn('Decryption resulted in empty string, returning null.');
      return null;
    }
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Mood definitions with values and MaterialCommunityIcons
const MOODS = {
  veryHappy: { label: 'Very Happy', color: '#FFD93D', value: 5, icon: 'emoticon-excited-outline' },
  happy: { label: 'Happy', color: '#4CAF50', value: 4, icon: 'emoticon-happy-outline' },
  content: { label: 'Content', color: '#7ED6DF', value: 3, icon: 'emoticon-outline' },
  neutral: { label: 'Meh', color: '#92beb5', value: 2, icon: 'emoticon-neutral-outline' },
  anxious: { label: 'Anxious', color: '#9b59b6', value: 1, icon: 'emoticon-frown-outline' },
  angry: { label: 'Angry', color: '#e74c3c', value: 1, icon: 'emoticon-angry-outline' },
  sad: { label: 'Sad', color: '#7286D3', value: 1, icon: 'emoticon-sad-outline' },
  verySad: { label: 'Very Sad', color: '#b44560', value: 0, icon: 'emoticon-cry-outline' },
  overwhelmed: { label: 'Overwhelmed', color: '#ffa502', value: 1, icon: 'emoticon-confused-outline' },
  tired: { label: 'Tired', color: '#95a5a6', value: 2, icon: 'emoticon-sick-outline' },
  hopeful: { label: 'Hopeful', color: '#00cec9', value: 4, icon: 'emoticon-wink-outline' }
};


// Available avatars for selection
const AVATAR_OPTIONS = ['😊', '😎', '😇', '😌', '🚀', '🌟', '🌈', '🧠', '💡', '🌳', '🐱', '🐶', '🦊', '🐻', '🐼', '🐯'];

// Define all possible badges and their properties (moved outside component for consistency)
const ALL_BADGES = [
  { id: 'first_entry', name: 'First Steps', description: 'Created your first journal entry', icon: '🌱', color: '#4CAF50' },
  { id: 'consistent_logger', name: 'Consistent Logger', description: 'Recorded 7 journal entries', icon: '📝', color: '#607D8B' },
  { id: 'dedicated_writer', name: 'Dedicated Writer', description: '50 journal entries', icon: '✍️', color: '#2196F3' },
  { id: 'month_warrior', name: 'Month Conqueror', description: '100 journal entries', icon: '⚔️', color: '#FF5722' },
  { id: 'reflection_guru', name: 'Reflection Guru', description: '200 journal entries', icon: '🧠', color: '#6B4EFF' },
  { id: 'journal_master', name: 'Journal Master', description: '365 journal entries', icon: '👑', color: '#FFD700' },
  { id: 'thousand_thoughts', name: 'Thousand Thoughts', description: '1000 journal entries', icon: '💎', color: '#8E24AA' },

  { id: 'three_day_streak', name: 'Momentum Builder', description: '3-day journaling streak', icon: '✨', color: '#FFEB3B' },
  { id: 'week_streak', name: 'Weekly Warrior', description: '7-day journaling streak', icon: '🔥', color: '#FF9800' },
  { id: 'month_streak', name: 'Monthly Master', description: '30-day journaling streak', icon: '🗓️', color: '#E91E63' },
  { id: 'century_streak', name: 'Century Streaker', description: '100-day journaling streak', icon: '💯', color: '#9C27B0' },
  { id: 'year_streak', name: 'Year Champion', description: '365-day journaling streak', icon: '🏆', color: '#FF6B6B' },
  { id: 'eternal_scribe', name: 'Eternal Scribe', description: '1000-day journaling streak', icon: '📜', color: '#8E24AA' },

  { id: 'mood_explorer', name: 'Emotional Range', description: 'Logged 5 different moods', icon: '🎭', color: '#9C27B0' },
  { id: 'emotional_spectrum', name: 'Full Spectrum', description: 'Logged all available moods', icon: '�', color: '#3F51B5' },
  { id: 'mood_master', name: 'Mood Master', description: 'Logged each mood at least 10 times', icon: '🎨', color: '#795548' },

  { id: 'positivity_champion', name: 'Positivity Champion', description: 'Achieved 70%+ positive moods overall', icon: '☀️', color: '#FFD93D' },
  { id: 'sunshine_soul', name: 'Sunshine Soul', description: '80%+ positive moods overall', icon: '🌞', color: '#FFC107' },
  { id: 'beacon_of_light', name: 'Beacon of Light', description: '90%+ positive moods overall', icon: '💫', color: '#FF9800' },

  { id: 'calm_collector', name: 'Calm Collector', description: '50%+ entries are content/neutral', icon: '🧘‍♀️', color: '#8BC34A' },
  { id: 'zen_master', name: 'Zen Master', description: '70%+ entries are content/neutral', icon: '☯️', color: '#4CAF50' },
  { id: 'balanced_mind', name: 'Balanced Mind', description: 'Equal positive and challenging moods', icon: '⚖️', color: '#FFB74D' },

  { id: 'emotional_resilience', name: 'Emotional Resilience', description: 'Experienced all challenging moods', icon: '💪', color: '#F44336' },
  { id: 'growth_mindset', name: 'Growth Mindset', description: 'Improved mood trend over 30 days (mock)', icon: '📈', color: '#009688' },
  { id: 'comeback_king', name: 'Comeback Champion', description: 'Bounced back from sad to happy within 3 days (mock)', icon: '🎯', color: '#FF5722' },

  { id: 'early_bird', name: 'Early Bird', description: 'Journaled before 8 AM for 7 days', icon: '🌅', color: '#FFC107' },
  { id: 'night_owl', name: 'Night Owl', description: 'Journaled after 10 PM for 7 days', icon: '🦉', color: '#673AB7' },
  { id: 'midnight_writer', name: 'Midnight Writer', description: 'Journaled after midnight 5 times', icon: '🌙', color: '#3F51B5' },
  { id: 'dawn_patrol', name: 'Dawn Patrol', description: 'Journaled before 6 AM 10 times', icon: '🌄', color: '#FF9800' },

  { id: 'grateful_heart', name: 'Grateful Heart', description: 'Logged "hopeful" mood 20 times', icon: '💖', color: '#E91E63' },
  { id: 'joy_seeker', name: 'Joy Seeker', description: 'Logged "very happy" mood 25 times', icon: '🎉', color: '#4CAF50' },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Journaled every weekend for a month (mock)', icon: '🎊', color: '#9C27B0' },
  { id: 'monthly_champion', name: 'Monthly Champion', description: 'Journaled every day in a month (mock)', icon: '🏅', color: '#FFD700' },
  { id: 'seasons_chronicler', name: 'Seasons Chronicler', description: 'Journaled in all 4 seasons (mock)', icon: '🍂', color: '#8BC34A' },
  { id: 'mood_scientist', name: 'Mood Scientist', description: 'Tracked moods for 6 months', icon: '🔬', color: '#607D8B' },
  { id: 'reflection_sage', name: 'Reflection Sage', description: 'Journaled for a full year', icon: '🧙‍♂️', color: '#795548' },

  { id: 'mindfulness_master', name: 'Mindfulness Master', description: 'Unlocked all other achievements', icon: '🌟', color: '#FF6B6B' },
];

// Consistent icon size for moods (MaterialCommunityIcons now)
const MOOD_ICON_SIZE = 24;
const INSIGHT_ICON_SIZE = 18; // Smaller icon for insights for text flow

// Helper component for displaying moods using MaterialCommunityIcons
const MoodDisplayIcon = ({ moodKey, size = MOOD_ICON_SIZE, color }) => {
  const mood = MOODS[moodKey];
  if (!mood || !mood.icon) return null; // Ensure mood and icon exist

  return (
    <MaterialCommunityIcons
      name={mood.icon}
      size={size}
      color={color || mood.color} // Use passed color or default mood color
      style={styles.moodIconSpacing} // Add spacing if needed
    />
  );
};

// Helper component for displaying badges
const BadgeCard = ({ badge, isUnlocked }) => (
  <View style={[
    styles.badgeCard,
    isUnlocked ? styles.badgeUnlocked : styles.badgeLocked
  ]}>
    <Text style={[
      styles.badgeIcon,
      { color: isUnlocked ? badge.color : styles.badgeIconLocked.color }
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

// New component for the dedicated Badges Screen
const BadgesScreen = ({ badges, unlockedBadges, onClose }) => (
  <Modal animationType="slide" transparent={false} visible={true}>
    <ScrollView style={styles.fullScreenModalContainer}>
      <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
        <Text style={styles.modalCloseButtonText}>← Back to Profile</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle}>All Achievements & Badges</Text>
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
        {unlockedBadges.length === 0 && (
          <Text style={styles.noDataText}>No badges unlocked yet! Keep journaling to earn your first ones.</Text>
        )}
      </View>
    </ScrollView>
  </Modal>
);

const MoodProfileDashboard = ({ navigation }) => {
  const [moodData, setMoodData] = useState([]);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); // State for month navigation
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [showBadgesScreen, setShowBadgesScreen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [chartViewMode, setChartViewMode] = useState('pieChart'); // 'pieChart' or 'breakdown'

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  // Function to load user profile from Firestore
  const loadUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'user_profiles', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserName(data.name || 'Your Name');
        setUserAvatar(data.avatar || '👤');
      } else {
        const defaultName = user.displayName || 'New User';
        const defaultAvatar = '👤';
        setUserName(defaultName);
        setUserAvatar(defaultAvatar);
        if (userId) {
            await setDoc(userDocRef, { name: defaultName, avatar: defaultAvatar, userId }, { merge: true });
            console.log('Initial user profile created.');
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserName('Guest User');
      setUserAvatar('👤');
    }
  }, [userId, user]);

  // Function to save user profile to Firestore
  const saveUserProfile = useCallback(async (name, avatar) => {
    if (!userId || isSavingProfile) {
      console.log('Save profile skipped: No user ID or already saving.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const userDocRef = doc(db, 'user_profiles', userId);
      await setDoc(userDocRef, { name, avatar, userId }, { merge: true });
      setUserName(name);
      setUserAvatar(avatar);
      console.log('User profile saved successfully!');
    } catch (error) {
      console.error('Error saving user profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  }, [userId, isSavingProfile]);

  // Load real entries from Firebase and calculate streak
  const loadEntriesAndCalculateStats = useCallback(async () => {
    if (!userId) {
      setMoodData(generateMockData());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const loadedEntries = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent);
        if (decryptedData) {
          let entryDate;
          if (data.createdAt instanceof Timestamp) {
            entryDate = data.createdAt.toDate();
          } else if (data.createdAt && data.createdAt.seconds) {
            entryDate = new Date(data.createdAt.seconds * 1000);
          } else {
            entryDate = new Date(decryptedData.date);
          }

          loadedEntries.push({
            id: doc.id,
            ...decryptedData,
            createdAt: entryDate,
            date: entryDate.toISOString().split('T')[0]
          });
        }
      });

      const sortedLoadedEntries = [...loadedEntries].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      setMoodData(sortedLoadedEntries);
      setTotalEntries(sortedLoadedEntries.length);

      // Calculate journaling streak
      let currentStreak = 0;
      if (sortedLoadedEntries.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const entryDates = new Set(sortedLoadedEntries.map(entry => {
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
      setStreak(currentStreak);

    } catch (error) {
      console.error('Error loading entries or calculating stats:', error);
      setMoodData(generateMockData());
      setStreak(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Get filtered data for selected month based on currentDisplayDate
  const getMonthlyData = useCallback(() => {
    const displayMonth = currentDisplayDate.getMonth();
    const displayYear = currentDisplayDate.getFullYear();
    return moodData.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.getMonth() === displayMonth && entryDate.getFullYear() === displayYear;
    });
  }, [moodData, currentDisplayDate]);

  // Calculate mood statistics for distribution chart for the selected month
  const getMoodStatsForMonth = useCallback(() => {
    const monthlyData = getMonthlyData();
    const moodCounts = {};
    Object.keys(MOODS).forEach(mood => moodCounts[mood] = 0);

    monthlyData.forEach(entry => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });

    const totalMoodsInMonth = monthlyData.length;
    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: totalMoodsInMonth > 0 ? ((count / totalMoodsInMonth) * 100).toFixed(1) : 0,
        ...MOODS[mood]
      }))
      .filter(m => m.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [getMonthlyData]);

  const moodDistributionData = getMoodStatsForMonth(); // This line now comes after getMoodStatsForMonth is defined


  // Initial data load and profile load effect
  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadEntriesAndCalculateStats();
    } else {
      setMoodData(generateMockData());
      setLoading(false);
      setUserName('Guest User');
      setUserAvatar('👤');
    }
  }, [userId, loadUserProfile, loadEntriesAndCalculateStats]);


  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };


  // Get most frequent mood across ALL entries (for general insights)
  const getMostFrequentMoodGlobal = useCallback(() => {
    if (totalEntries === 0) return { label: 'N/A', icon: '❓', color: '#92beb5' };
    const moodCounts = {};
    moodData.forEach(entry => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });
    const sortedMoods = Object.entries(moodCounts).sort(([, countA], [, countB]) => countB - countA);
    if (sortedMoods.length === 0 || sortedMoods[0][1] === 0) return { label: 'N/A', icon: '❓', color: '#92beb5' };
    return MOODS[sortedMoods[0][0]];
  }, [moodData, totalEntries]);

  // Get least frequent mood (among those logged) across ALL entries (for general insights)
  const getLeastFrequentMoodGlobal = useCallback(() => {
    if (totalEntries === 0) return { label: 'N/A', icon: '❓', color: '#92beb5' };
    const moodCounts = {};
    moodData.forEach(entry => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });
    const loggedMoods = Object.entries(moodCounts).filter(([, count]) => count > 0);
    const sortedMoods = loggedMoods.sort(([, countA], [, countB]) => countA - countB);
    if (sortedMoods.length === 0) return { label: 'N/A', icon: '❓', color: '#92beb5' };
    return MOODS[sortedMoods[0][0]];
  }, [moodData, totalEntries]);

  // Enhanced badge calculation logic
  const updateBadges = useCallback(() => {
    const newBadges = [];

    // Entry count badges
    if (totalEntries > 0) newBadges.push('first_entry');
    if (totalEntries >= 7) newBadges.push('consistent_logger');
    if (totalEntries >= 50) newBadges.push('dedicated_writer');
    if (totalEntries >= 100) newBadges.push('month_warrior');
    if (totalEntries >= 200) newBadges.push('reflection_guru');
    if (totalEntries >= 365) newBadges.push('journal_master');
    if (totalEntries >= 1000) newBadges.push('thousand_thoughts');
    if (totalEntries >= 5000) newBadges.push('legend_status');

    // Streak badges
    if (streak >= 3) newBadges.push('three_day_streak');
    if (streak >= 7) newBadges.push('week_streak');
    if (streak >= 30) newBadges.push('month_streak');
    if (streak >= 100) newBadges.push('century_streak');
    if (streak >= 365) newBadges.push('year_streak');
    if (streak >= 1000) newBadges.push('eternal_scribe');

    // Mood variety badges
    const distinctMoodsCount = new Set(moodData.map(entry => entry.mood)).size;
    if (distinctMoodsCount >= 5) newBadges.push('mood_explorer');
    if (distinctMoodsCount === Object.keys(MOODS).length) newBadges.push('emotional_spectrum');

    const moodCounts = {};
    moodData.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    const allMoodsLogged10Times = Object.keys(MOODS).every(mood => (moodCounts[mood] || 0) >= 10);
    if (allMoodsLogged10Times && distinctMoodsCount === Object.keys(MOODS).length) {
      newBadges.push('mood_master');
    }

    // Positivity badges
    const positiveMoods = ['veryHappy', 'happy', 'content', 'hopeful'];
    const totalPositiveCount = moodData.filter(entry => positiveMoods.includes(entry.mood)).length;
    const positivePercentage = moodData.length > 0 ? totalPositiveCount / moodData.length : 0;

    if (positivePercentage >= 0.7) newBadges.push('positivity_champion');
    if (positivePercentage >= 0.8) newBadges.push('sunshine_soul');
    if (positivePercentage >= 0.9) newBadges.push('beacon_of_light');

    // Calm badges
    const calmMoods = ['content', 'neutral', 'tired'];
    const totalCalmCount = moodData.filter(entry => calmMoods.includes(entry.mood)).length;
    const calmPercentage = moodData.length > 0 ? totalCalmCount / moodData.length : 0;

    if (calmPercentage >= 0.5) newBadges.push('calm_collector');
    if (calmPercentage >= 0.7) newBadges.push('zen_master');

    // Special mood count badges
    const hopefulCount = moodData.filter(entry => entry.mood === 'hopeful').length;
    const veryHappyCount = moodData.filter(entry => entry.mood === 'veryHappy').length;

    if (hopefulCount >= 20) newBadges.push('grateful_heart');
    if (veryHappyCount >= 25) newBadges.push('joy_seeker');

    // Time-based badges
    const earlyBirdDays = new Set();
    const nightOwlDays = new Set();
    const midnightCount = moodData.filter(entry => {
      const hour = new Date(entry.createdAt).getHours();
      return hour >= 0 && hour < 6;
    }).length;
    const dawnCount = moodData.filter(entry => {
      const hour = new Date(entry.createdAt).getHours();
      return hour >= 0 && hour < 6;
    }).length;

    moodData.forEach(entry => {
      const hour = new Date(entry.createdAt).getHours();
      const dateKey = new Date(entry.createdAt).toDateString();

      if (hour < 8) earlyBirdDays.add(dateKey);
      if (hour >= 22) nightOwlDays.add(dateKey);
    });

    if (earlyBirdDays.size >= 7) newBadges.push('early_bird');
    if (nightOwlDays.size >= 7) newBadges.push('night_owl');
    if (midnightCount >= 5) newBadges.push('midnight_writer');
    if (dawnCount >= 10) newBadges.push('dawn_patrol');

    // Resilience badges
    const challengingMoodKeys = ['sad', 'verySad', 'angry', 'anxious', 'overwhelmed'];
    const hasAllChallenging = challengingMoodKeys.every(mood => moodData.some(entry => entry.mood === mood));
    if (hasAllChallenging) newBadges.push('emotional_resilience');

    // Balanced mind badge
    const challengingCount = moodData.filter(entry => challengingMoodKeys.includes(entry.mood)).length;
    if (totalEntries > 10 && Math.abs(totalPositiveCount - challengingCount) <= Math.ceil(totalEntries * 0.15)) {
      newBadges.push('balanced_mind');
    }

    // Long-term tracking badges
    const uniqueMonths = new Set(moodData.map(entry => `${new Date(entry.createdAt).getFullYear()}-${new Date(entry.createdAt).getMonth()}`)).size;
    if (uniqueMonths >= 6) newBadges.push('mood_scientist');
    if (uniqueMonths >= 12) newBadges.push('reflection_sage');

    // Consistent Calm: 3-day streak of only happy/content moods (strict consecutive days)
    let consistentCalmStreak = 0;
    const happyContentStrictMoods = ['happy', 'content', 'veryHappy'];
    if (moodData.length > 0) {
      const sortedMoodData = [...moodData].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      for (let i = sortedMoodData.length - 1; i >= 0; i--) {
        const entry = sortedMoodData[i];
        if (happyContentStrictMoods.includes(entry.mood)) {
          consistentCalmStreak++;
          if (i > 0) {
            const prevEntry = sortedMoodData[i - 1];
            const diffDays = Math.round(Math.abs(entry.createdAt.getTime() - prevEntry.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1 && happyContentStrictMoods.includes(prevEntry.mood)) {
            } else {
              break;
            }
          }
        } else {
          break;
        }
        if (consistentCalmStreak >= 3) {
          newBadges.push('consistent_calm');
          break;
        }
      }
    }

    // Reflection Pro: Wrote entries on 5 different days of the week
    const distinctDaysOfWeek = new Set(moodData.map(entry => new Date(entry.createdAt).getDay())).size;
    if (distinctDaysOfWeek >= 5) newBadges.push('reflection_pro');

    // Adaptive Spirit: Logged 7 different moods in one week (any 7 day rolling window)
    const sortedMoodDataForAdaptive = [...moodData].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (let i = 0; i < sortedMoodDataForAdaptive.length; i++) {
      const sevenDaysLater = new Date(sortedMoodDataForAdaptive[i].createdAt);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const moodsInWindow = new Set();
      for (let j = i; j < sortedMoodDataForAdaptive.length; j++) {
        if (sortedMoodDataForAdaptive[j].createdAt < sevenDaysLater) {
          moodsInWindow.add(sortedMoodDataForAdaptive[j].mood);
        } else {
          break;
        }
      }
      if (moodsInWindow.size >= 7) {
        newBadges.push('adaptive_spirit');
        break;
      }
    }

    // Mindfulness Master (All other achievements unlocked)
    const nonMasterBadges = ALL_BADGES.filter(badge => badge.id !== 'mindfulness_master');
    const allOtherBadgesUnlocked = nonMasterBadges.every(badge => newBadges.includes(badge.id));
    if (allOtherBadgesUnlocked) {
      newBadges.push('mindfulness_master');
    }

    setUnlockedBadges(Array.from(new Set(newBadges)));
  }, [totalEntries, streak, moodData]);

  useEffect(() => {
    if (!loading) {
      updateBadges();
    }
  }, [totalEntries, streak, moodData, loading, updateBadges]);

  // Enhanced daily insights
  const getDailyInsights = useCallback(() => {
    const insights = [];
    const monthlyData = getMonthlyData();
    const currentMonthName = currentDisplayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const distinctMoodsCount = new Set(moodData.map(entry => entry.mood)).size;

    // Streak insights
    if (streak > 0) {
      if (streak >= 100) {
        insights.push({
          title: '🔥 Incredible Dedication',
          text: `Wow! You're on a **${streak}-day streak!** This level of consistency is truly inspiring and shows incredible commitment to self-reflection.`
        });
      } else if (streak >= 30) {
        insights.push({
          title: '🎯 Consistency Champion',
          text: `Amazing! Your **${streak}-day streak** shows real dedication. You're building a powerful habit that will serve you well.`
        });
      } else if (streak >= 7) {
        insights.push({
          title: '📈 Building Momentum',
          text: `Great job on your **${streak}-day streak!** You're developing a fantastic habit. Keep going!`
        });
      } else {
        insights.push({
          title: '🌱 Growing Habit',
          text: `You're **${streak} days** into your journaling journey. Every day counts toward building this valuable habit!`
        });
      }
    } else {
      insights.push({
        title: '🚀 Ready to Start',
        text: `Today is a perfect day to start your journaling journey! Even a few minutes of reflection can make a big difference.`
      });
    }

    // Monthly insights
    if (monthlyData.length > 0) {
      const avgMoodValue = monthlyData.reduce((sum, entry) => sum + entry.value, 0) / monthlyData.length;
      let moodTrendLabel = 'neutral';
      if (avgMoodValue >= 3.5) moodTrendLabel = 'positive';
      else if (avgMoodValue <= 1.5) moodTrendLabel = 'challenging';

      insights.push({
        title: `📊 ${currentMonthName} Overview`,
        text: `You logged **${monthlyData.length} entries** in ${currentMonthName}. Your overall mood trend was **${moodTrendLabel}**. ${avgMoodValue >= 3.5 ? 'Keep up the great work!' : 'Remember, all emotions are valid and temporary.'}`
      });

      // Mood pattern insights
      const mostCommonMoodInMonth = monthlyData.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {});
      const dominantMoodEntry = Object.entries(mostCommonMoodInMonth).sort(([, a], [, b]) => b - a)[0];

      if (dominantMoodEntry && dominantMoodEntry[1] > 0) {
        const dominantMoodKey = dominantMoodEntry[0];
        const moodInfo = MOODS[dominantMoodKey];
        insights.push({
          title: '🎭 Monthly Mood Pattern',
          iconComponent: <MaterialCommunityIcons name={moodInfo.icon} size={INSIGHT_ICON_SIZE} color={moodInfo.color} />,
          text: `In ${currentMonthName}, you felt **${moodInfo.label}** most often. Understanding your patterns helps you recognize what influences your well-being.`
        });
      }
    }

    // Achievement insights
    if (unlockedBadges.length > 0) {
      insights.push({
        title: '🏆 Your Achievements',
        text: `You've unlocked **${unlockedBadges.length} amazing badges** so far! Your dedication to self-reflection is paying off. Tap the Badges card to see them all!`
      });
    }

    // Motivational insights based on total entries
    if (totalEntries >= 365) {
      insights.push({
        title: '🌟 Journaling Veteran',
        text: `With over **${totalEntries} entries**, you're a true journaling veteran! Your commitment to self-awareness is admirable. Consider reviewing your journey from the beginning.`
      });
    } else if (totalEntries >= 100) {
      insights.push({
        title: '💡 Developing Wisdom',
        text: `You've written **${totalEntries} entries**! This wealth of self-reflection is building your emotional intelligence and self-awareness.`
      });
    } else if (totalEntries >= 30) {
      insights.push({
        title: '📝 Habit Forming',
        text: `**${totalEntries} entries** shows you're serious about journaling! You're well on your way to making this a lasting, beneficial habit.`
      });
    }

    // Seasonal or time-based insights
    const today = new Date();
    const currentSeasonMap = {
      0: 'Winter', 1: 'Winter', 2: 'Spring', 3: 'Spring', 4: 'Spring',
      5: 'Summer', 6: 'Summer', 7: 'Summer', 8: 'Fall', 9: 'Fall', 10: 'Fall', 11: 'Winter'
    };
    const currentSeason = currentSeasonMap[today.getMonth()];

    if (currentDisplayDate.getMonth() === today.getMonth() && currentDisplayDate.getFullYear() === today.getFullYear()) {
      insights.push({
        title: `🍂 ${currentSeason} Reflection`,
        text: `${currentSeason} can be a time of change and reflection. How has this season affected your mood and perspective recently?`
      });
    }

    // Growth and improvement insights (if sufficient data for the month)
    if (monthlyData.length >= 14) {
      const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
      const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));

      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.value, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.value, 0) / secondHalf.length;

      let trendInsight = '';
      if (secondHalfAvg > firstHalfAvg + 0.2) {
        trendInsight = 'Your mood trend seems to be **improving** this month! Keep focusing on what brings you joy.';
      } else if (secondHalfAvg < firstHalfAvg - 0.2) {
        trendInsight = 'It looks like your mood trend has **slightly declined** this month. Take some time for self-care and re-evaluation.';
      } else {
        trendInsight = 'Your mood has been relatively **stable** this month. Consistent reflection can help you maintain your well-being.';
      }
      insights.push({
        title: '📊 Monthly Mood Trend',
        text: trendInsight
      });
    }

    // Early Bird / Night Owl specific insights
    if (unlockedBadges.includes('early_bird')) {
      insights.push({
        title: '☀️ Morning Ritual',
        text: `You're an **Early Bird**! Journaling early in the day can greatly influence your mindset. Keep up this powerful morning ritual.`
      });
    }
    if (unlockedBadges.includes('night_owl')) {
      insights.push({
        title: '🌙 Evening Reflection',
        text: `The **Night Owl** badge is yours! Reflecting in the evening can help you process your day and wind down. This is a great habit for emotional processing.`
      });
    }
    if (unlockedBadges.includes('grateful_heart')) {
        insights.push({
            title: '💖 Heart Full of Hope',
            text: `Your **Grateful Heart** badge shows how often you embrace hopefulness. This positive outlook is a true strength!`
        });
    }

    // General insights about mood variety
    if (distinctMoodsCount > 5 && !unlockedBadges.includes('emotional_spectrum')) {
        insights.push({
            title: '🌈 Broad Emotional Range',
            text: `You've explored a wide range of emotions in your journaling. This demonstrates great emotional awareness. Keep embracing all your feelings!`
        });
    }

    return insights;
  }, [totalEntries, streak, moodData, currentDisplayDate, getMonthlyData, unlockedBadges]);

  const dailyInsights = getDailyInsights(); // This line now comes after getDailyInsights is defined.


  const pieChartData = moodDistributionData.map(mood => ({
    name: mood.label, // Use full label for legend
    population: parseInt(mood.count), // Count of entries
    color: mood.color,
    legendFontColor: '#7F7F7F', // Default legend font color (won't be shown in custom legend)
    legendFontSize: 15, // Default legend font size (won't be shown in custom legend)
  }));

  const chartConfig = {
    backgroundGradientFrom: '#F0F0FF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(107, 78, 255, ${opacity})`, // Purple for text on slices
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // This typically affects labels on axis, less relevant for PieChart
    propsForLabels: { // Styling for labels directly on PieChart slices
      fontSize: 12,
      fontWeight: 'bold',
      fill: `rgba(255, 255, 255, 1)`, // White text on slices for better contrast with dark colors
    },
    decimalPlaces: 0,
    hasLegend: false, // Explicitly disable built-in legend
  };


  const StatCard = ({ icon, value, label, gradient, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: gradient }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Display loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading your mood profile...</Text>
      </View>
    );
  }

  // If showing badges screen, render it
  if (showBadgesScreen) {
    return <BadgesScreen badges={ALL_BADGES} unlockedBadges={unlockedBadges} onClose={() => setShowBadgesScreen(false)} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Customization Section */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileAvatar}>{userAvatar}</Text>
          <View style={styles.profileInfo}>
            <TextInput
              style={styles.profileNameInput}
              onChangeText={setUserName}
              value={userName}
              placeholder="Your Name"
              onBlur={() => saveUserProfile(userName, userAvatar)}
              placeholderTextColor="#A0AEC0"
              maxLength={25}
              editable={!isSavingProfile}
            />
            <Text style={styles.profileEditHint}>{isSavingProfile ? 'Saving...' : 'Tap to edit name'}</Text>
          </View>
        </View>

        {/* Avatar Selection */}
        <View style={styles.avatarSelectionContainer}>
          <Text style={styles.avatarSelectionTitle}>Choose Your Avatar:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarOptionsScroll}>
            {AVATAR_OPTIONS.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  userAvatar === avatar && styles.avatarOptionSelected
                ]}
                onPress={() => saveUserProfile(userName, avatar)}
                disabled={isSavingProfile}
              >
                <Text style={styles.avatarText}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Header (without Current Mood) */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Your Mood Journey</Text>
            <Text style={styles.subtitle}>Track your emotional patterns</Text>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard icon="🔥" value={streak} label="Day Streak" gradient="#8B5CF6" />
          <StatCard icon="📅" value={totalEntries} label="Total Entries" gradient="#3B82F6" />
          <StatCard icon="🏆" value={unlockedBadges.length} label="Badges" gradient="#F59E0B" onPress={() => setShowBadgesScreen(true)} />
        </View>
      </View>

      {/* Monthly Mood Distribution Chart/Breakdown Section */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Monthly Mood Distribution</Text>
          {/* Month Navigation Buttons */}
          <View style={styles.monthNavigationContainer}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthNavigationButton}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text style={styles.currentMonthText}>
              {currentDisplayDate.toLocaleString('en-US', { month: 'short', year: '2-digit' })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavigationButton}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#4A5568" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle Buttons for Chart/Breakdown */}
        <View style={styles.toggleButtonsContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, chartViewMode === 'pieChart' && styles.toggleButtonSelected]}
            onPress={() => setChartViewMode('pieChart')}
          >
            <Text style={[styles.toggleButtonText, chartViewMode === 'pieChart' && styles.toggleButtonTextSelected]}>View Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, chartViewMode === 'breakdown' && styles.toggleButtonSelected]}
            onPress={() => setChartViewMode('breakdown')}
          >
            <Text style={[styles.toggleButtonText, chartViewMode === 'breakdown' && styles.toggleButtonTextSelected]}>View Breakdown</Text>
          </TouchableOpacity>
        </View>

        {/* Conditional Rendering for Chart or Breakdown */}
        {moodDistributionData.length > 0 ? (
          <>
            {chartViewMode === 'pieChart' ? (
              // Pie Chart and its custom legend in a row
              <View style={styles.chartAndLegendContainer}>
                <PieChart
                  data={pieChartData}
                  width={screenWidth * 0.55} // Adjusted width to make space for legend
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="50"
                  absolute
                  hasLegend={false} // Ensure built-in legend is off
                />
                {/* Custom Mood Legend for Pie Chart */}
                <View style={styles.moodLegendContainer}>
                  {moodDistributionData.map(mood => (
                    <View key={mood.mood} style={styles.moodLegendItem}>
                      <MoodDisplayIcon moodKey={mood.mood} size={MOOD_ICON_SIZE * 0.8} color={mood.color} />
                      <Text style={styles.moodLegendText}>{mood.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : ( // chartViewMode === 'breakdown'
              <View style={styles.moodDistributionContainer}>
                {moodDistributionData.map((mood, index) => (
                  <View key={mood.mood} style={styles.moodDistributionItem}>
                    <MoodDisplayIcon moodKey={mood.mood} size={MOOD_ICON_SIZE} color={mood.color} />
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
            )}
          </>
        ) : (
          <Text style={styles.noDataText}>No mood data available for {currentDisplayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}. Start journaling!</Text>
        )}
      </View>

      {/* Daily Insights Section */}
      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsHeaderIcon}>⚡</Text>
          <Text style={styles.insightsTitle}>Recent Insights</Text>
        </View>
        <View style={styles.insightsContainer}>
          {dailyInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightItemHeader}>
                {/* Render the icon component directly if it exists */}
                {insight.iconComponent}
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
          {dailyInsights.length === 0 && (
            <Text style={styles.noDataText}>No insights available yet. Start journaling to unlock personalized insights!</Text>
          )}
        </View>
        <TouchableOpacity
           style={styles.viewAllInsightsButton}
          onPress={() => navigation.navigate('Insights')} // OLD: navigation.navigate
          onPress={() => router.push({ // NEW: Use router.push
            pathname: '/insights', // Assuming your InsightsScreen is at app/(tabs)/insights.tsx
          })}
         >
           <Text style={styles.viewAllInsightsButtonText}>View All Trends & Insights →</Text>
         </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MoodProfileDashboard;

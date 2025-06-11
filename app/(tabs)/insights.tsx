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
  Platform, UIManager // For LayoutAnimation on Android
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  // Removed getDocs as we'll use onSnapshot
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CryptoJS from 'crypto-js';

// Assuming db is imported from your firebaseConfig; adjust path as necessary.
// This path MUST be correct for Firestore to work.
import { db } from '../../firebaseConfig';

// Import VADER sentiment library
// You'll need to install it: npm install vader-sentiment
// FIX: Adjusted import and usage for vader-sentiment to correctly access its analysis function.
import Sentiment from 'vader-sentiment';

// Import MaterialCommunityIcons for custom icons (you already have this)
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Import your custom styles for InsightsScreen ---
// Make sure this path is correct: e.g., '../styles/insights.styles' if it's in a sibling folder
import styles from '../styles/insights.styles';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants (copied from profile.tsx for self-containment, ideally centralized in a shared file) ---
const { width: screenWidth } = Dimensions.get('window');

// Ensure this key matches the one used for encryption in your journal component
const ENCRYPTION_KEY = 'ezYxGHuBw5W5jKewAnJsmie52Ge14WCzk+mIW8IFD6gzl/ubFlHjGan+LbcJ2M1m';

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
  tired: { label: 'Tired', color: '#95a5a6', value: 2, icon: 'emoticon-sick-outline' },
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

// --- Decryption Function (CRITICAL: Now expects JSON structure from journal.tsx) ---
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      console.warn('Decryption resulted in empty string or failed to decrypt for some reason.');
      return null;
    }
    // Now we expect it to always be a JSON string based on your saveEntry function
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Decryption or JSON parsing error. Data might be malformed or key is wrong:', error);
    console.error('Problematic encrypted data (first 50 chars):', String(encryptedData).substring(0, 50) + '...');
    return null;
  }
};


const InsightsScreen = () => {
  const [processedEntries, setProcessedEntries] = useState([]); // Entries with sentiment and moodValue
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('mood'); // 'mood' or 'sentiment'
  const [timeframe, setTimeframe] = useState(30); // Default to 30 days
  const [showExplanation, setShowExplanation] = useState(false); // State for explanation visibility

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  // Function to toggle explanation visibility with animation
  const toggleExplanation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowExplanation(!showExplanation);
  };

  // --- Data Fetching and Processing ---
  // When using useCallback with a real-time listener,
  // this function itself won't be called repeatedly.
  // Instead, the returned unsubscribe function is important.
  const setupRealtimeListener = useCallback(() => {
    console.log('setupRealtimeListener called.');
    if (!userId) {
      console.warn('setupRealtimeListener: No user ID found. User might not be authenticated. Displaying no data.');
      setProcessedEntries([]);
      setLoading(false);
      return () => {}; // Return a no-op unsubscribe function
    }
    console.log('setupRealtimeListener: User ID found:', userId);

    setLoading(true); // Indicate loading has started
    const q = query(
      collection(db, 'journal_entries'), // Ensure 'journal_entries' matches your Firestore collection name
      where('userId', '==', userId), // Ensure 'userId' field exists in your documents and matches the auth user's UID
      orderBy('createdAt', 'asc') // Order by date for correct trend calculation (oldest to newest)
    );

    console.log('setupRealtimeListener: Setting up real-time listener for journal entries...');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const processed = [];
      console.log(`onSnapshot: Found ${querySnapshot.docs.length} raw journal entry documents.`);

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

      console.log(`onSnapshot: Successfully processed ${processed.length} valid entries. Updating state.`);
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
    // Call the setup function and store the unsubscribe function
    let unsubscribe = () => {}; // Initialize with a no-op
    if (userId) {
      unsubscribe = setupRealtimeListener();
    } else {
      setLoading(false);
      setProcessedEntries([]);
      console.log("useEffect: No user ID, skipping data load and listener setup.");
    }

    // Cleanup function: this will be called when the component unmounts
    // or before the effect re-runs (if dependencies change).
    return () => {
      console.log("useEffect cleanup: Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, [userId, setupRealtimeListener]); // Dependencies: userId and the memoized setup function

  // --- Chart Data Preparation Function ---
  const getTrendData = useCallback((type, days) => {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);

    const dailyAggregates = {};
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

    console.log(`getTrendData for ${type} over ${days} days. Labels: ${labels.length}, Data points: ${dataValues.length}.`);
    console.log(`Chart data for ${type}:`, { labels, datasets: [{ data: dataValues }] });

    return {
      labels,
      datasets: [{
        data: dataValues,
      }]
    };
  }, [processedEntries]);

  // --- Data for Chart Width Calculation ---
  const moodTrendData = getTrendData('mood', timeframe);
  const sentimentTrendData = getTrendData('sentiment', timeframe);

  // Calculate dynamic chart width based on the number of labels
  const chartWidth = useMemo(() => {
    const minScreenWidthPadding = 32; // Total padding from screen edges (16px left + 16px right)
    const baseChartWidth = screenWidth - minScreenWidthPadding;

    // Estimate width needed per label to avoid overlap
    const widthPerDay = 50; // Pixels per day/label

    const currentLabelsLength = (chartType === 'mood' ? moodTrendData : sentimentTrendData).labels.length;
    const calculatedWidth = currentLabelsLength * widthPerDay;

    // Ensure the chart is at least screenWidth minus padding, but expands for more data
    return Math.max(baseChartWidth, calculatedWidth);
  }, [timeframe, chartType, moodTrendData, sentimentTrendData]);

  // Use useMemo for dailyInsights to ensure it recalculates when dependencies change
  const dailyInsights = useMemo(() => {
    const insights = [];
    const totalEntries = processedEntries.length;

    console.log(`getInsights: Processing ${totalEntries} entries for insights.`);

    if (totalEntries === 0) {
        insights.push({
            title: '🚀 Ready to Start Your Journey',
            text: `It looks like you haven't logged any entries yet. Once you start journaling, we'll begin to unlock personalized insights and trend data for you here!`
        });
        console.log("getInsights: No entries found. Displaying default insight.");
        return insights.map(insight => ({
            ...insight,
            title: String(insight.title || ''),
            text: String(insight.text || ''),
            iconComponent: insight.iconComponent || null
        }));
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
                text: `You're on a phenomenal **${currentStreak}-day streak!** This dedication to self-reflection is truly inspiring.`
            });
        } else if (currentStreak >= 30) {
            insights.push({
                title: '🎯 Building a Powerful Habit',
                text: `Fantastic! Your **${currentStreak}-day streak** shows strong commitment. You're building a valuable habit.`
            });
        } else if (currentStreak >= 7) {
            insights.push({
                title: '📈 Momentum Gained',
                text: `Great job on your **${currentStreak}-day streak!** You're maintaining good consistency.`
            });
        } else {
            insights.push({
                title: '🌱 Starting Strong',
                text: `You're **${currentStreak} days** into your journaling journey. Every entry contributes to your growth!`
            });
        }
    } else {
        insights.push({
            title: '💡 Time to Reflect',
            text: `No active streak right now. Remember, consistency is key! Log an entry to start your streak.`
        });
    }

    if (totalEntries > 0) {
      const avgMoodValueOverall = processedEntries.reduce((sum, entry) => sum + entry.moodValue, 0) / totalEntries;
      let moodTrendLabel = 'neutral';
      if (avgMoodValueOverall >= 3.5) moodTrendLabel = 'generally positive';
      else if (avgMoodValueOverall <= 1.5) moodTrendLabel = 'leans towards challenging';
      else moodTrendLabel = 'balanced';

      insights.push({
        title: `📊 Your Overall Emotional Footprint`,
        text: `With **${totalEntries} entries** logged, your overall mood trend is **${moodTrendLabel}**. This long-term view helps you understand your baseline well-being.`
      });

      const mostCommonMoodOverall = processedEntries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {});
      const dominantMoodEntry = Object.entries(mostCommonMoodOverall).sort(([, a], [, b]) => b - a)[0];

      if (dominantMoodEntry && dominantMoodEntry[1] > 0) {
        const dominantMoodKey = dominantMoodEntry[0];
        const moodInfo = MOODS[dominantMoodKey];
        insights.push({
          title: '🎭 Your Most Frequent Mood',
          iconComponent: <MoodDisplayIcon moodKey={dominantMoodKey} size={INSIGHT_ICON_SIZE} color={moodInfo.color} />,
          text: `You've most often expressed feeling **${moodInfo.label}**. Understanding your most frequent mood can reveal underlying patterns.`
        });
      }
    }

    if (totalEntries > 0) {
        const totalPositiveSentiment = processedEntries.filter(entry => entry.sentimentScore > 0.1).length;
        const totalNegativeSentiment = processedEntries.filter(entry => entry.sentimentScore < -0.1).length;
        const totalNeutralSentiment = processedEntries.filter(entry => entry.sentimentScore >= -0.1 && entry.sentimentScore <= 0.1).length;

        const positiveSentimentPercentage = (totalPositiveSentiment / totalEntries * 100).toFixed(1);
        const negativeSentimentPercentage = (totalNegativeSentiment / totalEntries * 100).toFixed(1);
        const neutralSentimentPercentage = (totalNeutralSentiment / totalEntries * 100).toFixed(1);

        insights.push({
            title: '✍️ Journal Content Sentiment Breakdown',
            text: `Your journal entries, when analyzed, show: **${positiveSentimentPercentage}% Positive**, **${neutralSentimentPercentage}% Neutral**, and **${negativeSentimentPercentage}% Negative** sentiment. This offers a textual perspective on your emotional state.`
        });

        const misalignedEntries = processedEntries.filter(entry => {
            const isLoggedPositive = MOODS[entry.mood]?.value > 3;
            const isSentimentPositive = entry.sentimentScore > 0.1;
            const isLoggedNegative = MOODS[entry.mood]?.value < 2;
            const isSentimentNegative = entry.sentimentScore < -0.1;

            return (isLoggedPositive && isSentimentNegative) || (isLoggedNegative && isSentimentPositive);
        });

        if (misalignedEntries.length > 0 && (misalignedEntries.length / totalEntries) > 0.05) {
            insights.push({
                title: '🧐 Decoding Discrepancies',
                text: `You've had **${misalignedEntries.length} entries** where your self-reported mood and the sentiment of your writing had notable differences. This could indicate nuanced emotions or areas for deeper self-exploration.`
            });
        }
    }

    if (totalEntries >= timeframe / 2) {
      const entriesForTimeframe = processedEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const endDate = new Date();
        endDate.setHours(0,0,0,0);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - timeframe);
        return entryDate >= startDate && entryDate <= endDate;
      });

      if (entriesForTimeframe.length > 1) {
        const firstHalfCount = Math.floor(entriesForTimeframe.length / 2);
        const firstHalf = entriesForTimeframe.slice(0, firstHalfCount);
        const secondHalf = entriesForTimeframe.slice(firstHalfCount);

        if (firstHalf.length > 0 && secondHalf.length > 0) {
          const firstHalfAvgMood = firstHalf.reduce((sum, entry) => sum + entry.moodValue, 0) / firstHalf.length;
          const secondHalfAvgMood = secondHalf.reduce((sum, entry) => sum + entry.moodValue, 0) / secondHalf.length;

          const firstHalfAvgSentiment = firstHalf.reduce((sum, entry) => sum + entry.sentimentScore, 0) / firstHalf.length;
          const secondHalfAvgSentiment = secondHalf.reduce((sum, entry) => sum + entry.sentimentScore, 0) / secondHalf.length;

          let trendMoodText = '';
          if (secondHalfAvgMood > firstHalfAvgMood + 0.2) {
            trendMoodText = 'Your mood has been **improving**';
          } else if (secondHalfAvgMood < firstHalfAvgMood - 0.2) {
            trendMoodText = 'Your mood has **declined**';
          } else {
            trendMoodText = 'Your mood has been relatively **stable**';
          }

          let trendSentimentText = '';
          if (secondHalfAvgSentiment > firstHalfAvgSentiment + 0.1) {
            trendSentimentText = 'and your journal sentiment is also **more positive**';
          } else if (secondHalfAvgSentiment < firstHalfAvgSentiment - 0.1) {
            trendSentimentText = 'and your journal sentiment is **more negative**';
          } else {
            trendSentimentText = 'with your journal sentiment remaining **stable**';
          }

          insights.push({
            title: `📈 Recent Progress (Last ${timeframe} Days)`,
            text: `${trendMoodText} ${trendSentimentText}. This detailed look at your recent trends can offer valuable self-awareness.`
          });
        }
      }
    }

    const today = new Date();
    const currentSeasonMap = {
      0: 'Winter', 1: 'Winter', 2: 'Spring', 3: 'Spring', 4: 'Spring',
      5: 'Summer', 6: 'Summer', 7: 'Summer', 8: 'Fall', 9: 'Fall', 10: 'Fall', 11: 'Winter'
    };
    const currentSeason = currentSeasonMap[today.getMonth()];

    insights.push({
        title: `🍂 Reflecting on ${currentSeason}`,
        text: `${currentSeason} can bring unique emotional landscapes. Take a moment to consider how this season might be influencing your overall well-being and insights.`
    });

    // Ensure all titles and texts are strings, providing defaults if necessary
    return insights.map(insight => ({
      ...insight,
      title: String(insight.title || ''),
      text: String(insight.text || ''),
      // Ensure iconComponent is a valid React element or null
      iconComponent: insight.iconComponent || null
    }));

  }, [processedEntries, timeframe]); // Now uses useMemo instead of useCallback


  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(107, 78, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#6B4EFF'
    },
    propsForBackgroundLines: {
        strokeDasharray: '',
    },
    yAxisSuffix: '',
    yAxisInterval: chartType === 'mood' ? 1 : 0.5,
    yAxisMax: chartType === 'mood' ? 5 : 1,
    yAxisMin: chartType === 'mood' ? 0 : -1,
    formatYLabel: (yLabel) => {
      if (chartType === 'mood') {
        return Math.round(Number(yLabel)).toString();
      } else {
        return Number(yLabel).toFixed(2);
      }
    },
    formatXLabel: (label) => {
        const parts = label.split(' ');
        if (parts.length > 1) {
            return parts[0];
        }
        return label;
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={styles.loadingText}>Loading your insights and trends...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Emotional Landscape</Text>
        <Text style={styles.subtitle}>Explore trends and gain deeper insights from your journaling journey.</Text>
      </View>

      {/* Mood/Sentiment Trend Chart Section */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{chartType === 'mood' ? 'Average Mood Trend' : 'Average Sentiment Trend'}</Text>

        {/* Chart Type Toggle Buttons */}
        <View style={styles.toggleButtonsContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, chartType === 'mood' && styles.toggleButtonSelected]}
            onPress={() => setChartType('mood')}
          >
            <Text style={[styles.toggleButtonText, chartType === 'mood' && styles.toggleButtonTextSelected]}>Mood Trend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, chartType === 'sentiment' && styles.toggleButtonSelected]}
            onPress={() => setChartType('sentiment')}
          >
            <Text style={[styles.toggleButtonText, chartType === 'sentiment' && styles.toggleButtonTextSelected]}>Sentiment Trend</Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Toggle Buttons */}
        <View style={styles.toggleButtonsContainer}>
          {[7, 30, 90].map(days => (
            <TouchableOpacity
              key={days}
              style={[styles.toggleButton, timeframe === days && styles.toggleButtonSelected]}
              onPress={() => setTimeframe(days)}
            >
              <Text style={[styles.toggleButtonText, timeframe === days && styles.toggleButtonTextSelected]}>{days} Days</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Render Line Chart or No Data Message */}
        {processedEntries.length > 0 && (chartType === 'mood' ? moodTrendData.datasets[0].data.some(d => d !== null) : sentimentTrendData.datasets[0].data.some(d => d !== null)) ? (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
            <LineChart
              data={chartType === 'mood' ? moodTrendData : sentimentTrendData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 8 }}
              yLabelsOffset={10}
              fromZero={chartType === 'mood' ? true : false}
            />
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>Not enough data available to show trends for the selected timeframe. Keep journaling!</Text>
        )}
      </View>

      {/* New: Explanation Section */}
      <View style={styles.explanationCard}>
        <TouchableOpacity onPress={toggleExplanation} style={styles.explanationHeader}>
          <MaterialCommunityIcons
            name={showExplanation ? "chevron-up" : "information-outline"}
            size={24}
            color="#4C51BF"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.explanationTitle}>How are Insights Calculated?</Text>
          <MaterialCommunityIcons
            name={showExplanation ? "chevron-up" : "chevron-down"}
            size={24}
            color="#4C51BF"
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>

        {showExplanation && (
          <View style={styles.explanationContent}>
            <Text style={styles.explanationText}>
              <Text style={styles.explanationSubtitle}>Understanding Your Mood Trend:</Text>{'\n'}
              Your app tracks your mood using a defined scale. Each mood you select (e.g., 'veryHappy', 'sad') is assigned a numerical value from <Text style={{fontWeight: 'bold'}}>0 to 5</Text> (where 0 is 'verySad' and 5 is 'veryHappy').
              {'\n\n'}
              When you view your mood trend over a timeframe, the app calculates the <Text style={{fontWeight: 'bold'}}>average mood value</Text> of all your journal entries logged on each specific day.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>What the numbers mean:</Text>{'\n'}
              <Text style={{fontWeight: 'bold'}}>• Higher average (closer to 5):</Text> Indicates a generally more positive emotional state.{'\n'}
              <Text style={{fontWeight: 'bold'}}>• Lower average (closer to 0):</Text> Suggests a more challenging or negative emotional state.{'\n'}
              <Text style={{fontWeight: 'bold'}}>• Around 2-3 (Neutral/Content):</Text> Represents a balanced or moderate emotional state.
              {'\n\n'}
              <Text style={styles.explanationSubtitle}>Understanding Your Sentiment Trend:</Text>{'\n'}
              This analyzes the actual words you use in your journal entries using the <Text style={{fontWeight: 'bold'}}>VADER sentiment analysis library</Text>.
              {'\n\n'}
              VADER produces a <Text style={{fontWeight: 'bold'}}>compound score</Text> for each entry, ranging from <Text style={{fontWeight: 'bold'}}>-1 (most negative)</Text> to <Text style={{fontWeight: 'bold'}}>+1 (most positive)</Text>. The app then calculates the <Text style={{fontWeight: 'bold'}}>average compound sentiment score</Text> for all entries on each day.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>What the numbers mean (VADER Compound Score):</Text>{'\n'}
              <Text style={{fontWeight: 'bold'}}>• Positive Sentiment:</Text> Scores typically greater than $0.05$. Closer to $+1$ means stronger positive sentiment.{'\n'}
              <Text style={{fontWeight: 'bold'}}>• Neutral Sentiment:</Text> Scores between $-0.05$ and $0.05$ (inclusive).{'\n'}
              <Text style={{fontWeight: 'bold'}}>• Negative Sentiment:</Text> Scores typically less than $-0.05$. Closer to $-1$ means stronger negative sentiment.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>Gaps in the Graph:</Text>{'\n'}
              If you see broken lines in the graph, it means there were <Text style={{fontWeight: 'bold'}}>no journal entries logged</Text> on those specific days. This provides a clear visual distinction for days with no data.
            </Text>
          </View>
        )}
      </View>

      {/* Enhanced Personalized Insights Section */}
      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsHeaderIcon}>⚡</Text>
          <Text style={styles.insightsTitle}>Personalized Insights</Text>
        </View>
        <View style={styles.insightsContainer}>
          {dailyInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightItemHeader}>
                {/* Render the icon component directly if it exists, ensuring it's a valid React element */}
                {insight.iconComponent || null}
                <Text style={styles.insightsTitle}>{insight.title}</Text>
              </View>
              {/* FIX: Ensure all children inside a Text component are Text components */}
              <Text style={styles.insightText}>
                 {insight.text.split('**').map((part, i) => (
                    // If it's an odd index, it's the bolded part, otherwise it's regular text
                    i % 2 === 1 ? <Text key={i} style={{fontWeight: 'bold'}}>{part}</Text> : <Text key={i}>{part}</Text>
                 ))}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default InsightsScreen;

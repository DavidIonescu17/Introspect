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

const { width: screenWidth } = Dimensions.get('window');

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

// Mock data for demonstration
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
  const [streak, setStreak] = useState(7);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [totalEntries, setTotalEntries] = useState(127);
  const [unlockedBadges, setUnlockedBadges] = useState(['first_entry', 'week_streak', 'mood_explorer']);

  useEffect(() => {
    setMoodData(generateMockData());
  }, []);

  // Calculate mood statistics
  const getMoodStats = () => {
    const moodCounts = {};
    Object.keys(MOODS).forEach(mood => moodCounts[mood] = 0);
    
    moodData.forEach(entry => {
      moodCounts[entry.mood]++;
    });

    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: ((count / moodData.length) * 100).toFixed(1),
        ...MOODS[mood]
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getAverageMood = () => {
    if (moodData.length === 0) return 0;
    const sum = moodData.reduce((acc, entry) => acc + MOODS[entry.mood].value, 0);
    return (sum / moodData.length).toFixed(1);
  };

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

  const moodTrendData = moodData.slice(-7).map(entry => MOODS[entry.mood].value);
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
            <Text style={styles.currentMoodIcon}>{MOODS[currentMood].icon}</Text>
            <View>
              <Text style={styles.currentMoodLabel}>Currently</Text>
              <Text style={[styles.currentMoodText, { color: MOODS[currentMood].color }]}>
                {MOODS[currentMood].label}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
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
              datasets: [{ data: moodTrendData }]
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
            <Text style={styles.moodMeterIcon}>{MOODS[currentMood].icon}</Text>
            <Text style={styles.moodMeterPercentage}>
              {((MOODS[currentMood].value / 5) * 100).toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.moodMeterLabel}>{MOODS[currentMood].label}</Text>
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
            <Text style={[styles.comparisonValue, { color: '#3B82F6' }]}>3.2</Text>
            <Text style={styles.comparisonSubtitle}>Average Mood</Text>
          </View>
          <View style={[styles.comparisonCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.comparisonIcon}>❤️</Text>
            <Text style={styles.comparisonTitle}>Last Week</Text>
            <Text style={[styles.comparisonValue, { color: '#10B981' }]}>2.8</Text>
            <Text style={styles.comparisonSubtitle}>Average Mood</Text>
          </View>
          <View style={[styles.comparisonCard, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.comparisonIcon}>📈</Text>
            <Text style={styles.comparisonTitle}>Improvement</Text>
            <Text style={[styles.comparisonValue, { color: '#8B5CF6' }]}>+14%</Text>
            <Text style={styles.comparisonSubtitle}>Better than last week</Text>
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
            <Text style={styles.insightTitle}>🌟 Mood Pattern</Text>
            <Text style={styles.insightText}>
              You tend to feel happiest on weekends and most productive on Tuesdays!
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightTitle}>📈 Progress</Text>
            <Text style={styles.insightText}>
              Your mood has improved by 14% compared to last week. Keep it up!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  currentMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentMoodIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  currentMoodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentMoodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextSelected: {
    color: '#8B5CF6',
  },
  chart: {
    borderRadius: 16,
  },
  moodDistributionContainer: {
    marginTop: 16,
  },
  moodDistributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodDistributionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moodDistributionContent: {
    flex: 1,
  },
  moodDistributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moodDistributionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  moodDistributionPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  moodMeterContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  moodMeterCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodMeterIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodMeterPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  moodMeterLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  moodButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  moodButtonSelected: {
    backgroundColor: '#EDE9FE',
    transform: [{ scale: 1.1 }],
  },
  moodButtonIcon: {
    fontSize: 24,
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  badgesHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeUnlocked: {
    borderColor: '#C7D2FE',
    backgroundColor: '#F3F4F6',
  },
  badgeLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  badgeTextLocked: {
    color: '#9CA3AF',
  },
  badgeStar: {
    fontSize: 16,
    marginTop: 8,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  comparisonCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  comparisonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comparisonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  insightsCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default MoodProfileDashboard;
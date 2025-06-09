
import { StyleSheet } from 'react-native';
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
export default styles;
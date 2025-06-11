import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light background
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B4EFF',
    fontFamily: 'System', // Use default system font
  },
  // --- Profile Customization Styles ---
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileAvatar: {
    fontSize: 50,
    marginRight: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    width: 80,
    height: 80,
    textAlign: 'center',
    lineHeight: 80, // Center emoji vertically
    overflow: 'hidden', // Ensure emoji fits
  },
  profileInfo: {
    flex: 1,
  },
  profileNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    marginBottom: 5,
    fontFamily: 'System',
  },
  profileEditHint: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  avatarSelectionContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'flex-start', // Align title to left
    width: '100%',
  },
  avatarSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 10,
    fontFamily: 'System',
    marginLeft: 5, // Small indent
  },
  avatarOptionsScroll: {
    paddingHorizontal: 5,
    alignItems: 'center', // Center items vertically in scroll view
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarOptionSelected: {
    borderColor: '#6B4EFF', // Highlight color for selected avatar
    backgroundColor: '#D1FAE5', // Light green background
  },
  avatarText: {
    fontSize: 28,
  },
  // --- Header & Quick Stats Styles ---
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748', // Darker text for titles
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096', // Muted text for subtitles
    marginTop: 5,
    fontFamily: 'System',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute items evenly
    flexWrap: 'wrap',
    // gap: 10, // React Native doesn't universally support `gap` in `flex`
  },
  statCard: {
    width: (screenWidth - 60) / 3.2, // Adjusted for 3 columns with some margin
    borderRadius: 15,
    padding: 10, // Reduced padding
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginHorizontal: 2, // Small horizontal margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statIcon: {
    fontSize: 24, // Smaller icon size
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20, // Smaller value font size
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12, // Smaller label font size
    color: '#F7FAFC',
    textAlign: 'center',
    fontFamily: 'System',
  },
  // --- Chart & Mood Distribution Styles ---
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center', // Center content horizontally
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10, // Adjust for inner padding
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'System',
    flexShrink: 1, // Allow title to shrink
    marginRight: 10, // Space from selector
  },
  monthSelector: {
    paddingVertical: 5,
  },
  monthButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F7FAFC',
  },
  monthButtonSelected: {
    backgroundColor: '#6B4EFF', // Highlight color
  },
  monthButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    fontFamily: 'System',
  },
  monthButtonTextSelected: {
    color: '#FFFFFF',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'System',
  },
  moodDistributionContainer: {
    width: '100%',
    marginTop: 10,
  },
  moodDistributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodDistributionIcon: {
    fontSize: 24,
    marginRight: 10,
    width: 30, // Fixed width for alignment
    textAlign: 'center',
  },
  moodDistributionContent: {
    flex: 1,
  },
  moodDistributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  moodDistributionLabel: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
    fontFamily: 'System',
  },
  moodDistributionPercentage: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  // --- Badges Styles (for main page preview and modal) ---
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  badgesHeaderIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Distribute items evenly
    width: '100%',
  },
  badgeCard: {
    width: (screenWidth - 80) / 2, // Two columns layout, adjusted for smaller stat cards
    aspectRatio: 0.9, // Maintain aspect ratio, slightly taller to fit text
    borderRadius: 15,
    padding: 15,
    margin: 8, // Spacing between cards
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6B4EFF', // Border for unlocked badges
  },
  badgeLocked: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0', // Lighter border for locked badges
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  badgeIconLocked: {
    color: '#A0AEC0', // Muted color for locked icons
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'System',
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#718096',
    fontFamily: 'System',
  },
  badgeTextLocked: {
    color: '#A0AEC0',
  },
  badgeStar: {
    fontSize: 18,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  // --- Daily Insights Styles ---
  insightsCard: {
    backgroundColor: '#E0F2FE', // Light blue background for insights
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightsHeaderIcon: {
    fontSize: 28,
    marginRight: 10,
    color: '#2196F3', // Blue color for icon
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'System',
  },
  insightsContainer: {
    // No specific styles needed for container, items handle layout
  },
  insightItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 5,
    fontFamily: 'System',
  },
  insightText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    fontFamily: 'System',
  },
  // --- Modal Specific Styles for BadgesScreen ---
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
    paddingTop: 50, // Adjust for status bar
  },
  modalCloseButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    fontFamily: 'System',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default styles;

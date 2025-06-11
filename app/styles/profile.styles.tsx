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
    elevation: 2,
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
  // --- Month Navigation Styles ---
  monthNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthNavigationButton: {
    padding: 5,
  },
  currentMonthText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#4A5568',
    fontFamily: 'System',
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'System',
  },
  // --- Chart and Legend Layout (for Pie Chart) ---
  chartAndLegendContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align chart and legend vertically in the center
    justifyContent: 'space-around', // Distribute space evenly
    width: '100%', // Take full width of the parent card
    paddingHorizontal: 0, // Let child components handle their own spacing
    marginTop: 10, // Add some top margin to separate from toggle buttons
    minHeight: 220, // Ensure enough height even if no data for the chart, keeps layout stable
  },
  moodDistributionContainer: { // This is for the breakdown list, not the chart legend
    width: '100%',
    marginTop: 10,
  },
  moodDistributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodDistributionContent: {
    flex: 1,
    marginLeft: 10, // Add some spacing from the icon
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
  // --- Mood Legend Styles (for Pie Chart custom legend, on the right) ---
  moodLegendContainer: {
    flexDirection: 'column', // Stack legend items vertically
    justifyContent: 'center', // Center items vertically within the column
    alignItems: 'flex-start', // Align items to the start (left) of the legend column
    width: screenWidth * 0.35, // Adjust width as a percentage of screenWidth
    paddingLeft: 10, // Small padding from the chart
    flexShrink: 0, // Prevent shrinking
    flexGrow: 1, // Allow growing if space is available
  },
  moodLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4, // Spacing between legend items
  },
  moodLegendText: {
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'System',
    marginLeft: 4, // Add small space after icon for text
  },
  // --- Toggle Buttons Styles ---
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: '#E2E8F0', // Light grey for unselected
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButtonSelected: {
    backgroundColor: '#6B4EFF', // Your signature purple
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568', // Dark text for unselected
    fontFamily: 'System',
  },
  toggleButtonTextSelected: {
    color: '#FFFFFF', // White text for selected
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
    justifyContent: 'space-around',
    width: '100%',
  },
  badgeCard: {
    width: (screenWidth - 80) / 2,
    aspectRatio: 0.9,
    borderRadius: 15,
    padding: 15,
    margin: 8,
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
    borderColor: '#6B4EFF',
  },
  badgeLocked: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  badgeIconLocked: {
    color: '#A0AEC0',
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
    backgroundColor: '#E0F2FE',
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
    color: '#2196F3',
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'System',
    marginLeft: 8,
  },
  insightsContainer: {
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
  insightItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    fontFamily: 'System',
  },
  moodIconSpacing: { // For icons within text flow (e.g., in insights or legend)
    marginRight: 2, // Small margin to separate icon from text
  },
  // --- Modal Specific Styles for BadgesScreen ---
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
    paddingTop: 50,
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
  insightsButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6B4EFF', // A vibrant color for the button
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
    marginTop: 10, // Add some space above the button
  },
  insightsButtonText: {
      color: '#fff', // White text for contrast on the button
      fontWeight: 'bold',
      marginTop: 10, // Space above the text
      fontSize: 16,
  },
});

export default styles;

import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF', // Light purple background, merged from new design
    padding: 20, // Increased padding for better spacing
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF', // Consistent with new background
  },
  loadingText: {
    fontSize: 18,
    color: '#6B4EFF', // Primary accent color
    marginTop: 10,
  },
  header: {
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  chartCard: { // Renamed to insightsCard for consistency
    backgroundColor: '#ffffff',
    borderRadius: 20, // More rounded
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6B4EFF', // Primary accent color for shadow
    shadowOffset: { width: 0, height: 8 }, // Larger shadow
    shadowOpacity: 0.1,
    shadowRadius: 16, // Larger shadow radius
    elevation: 5,
  },
  chartTitle: { // Merged into insightsTitle, but kept for clarity
    fontSize: 22,
    fontWeight: '700', // Bolder
    color: '#2d3436', // Dark gray
    marginBottom: 15,
  },
  toggleButtonsContainer: { // Renamed to chartTypeButtons
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: { // Renamed to chartTypeButton
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#E2E8F0',
  },
  toggleButtonSelected: { // Renamed to chartTypeButtonActive
    backgroundColor: '#6B4EFF',
  },
  toggleButtonText: { // Renamed to chartTypeButtonText
    color: '#4A5568',
    fontWeight: '600',
  },
  toggleButtonTextSelected: { // Renamed to chartTypeButtonTextActive
    color: '#fff',
  },
  insightsCard: { // Main card style for sections, harmonized with chartCard
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightsHeaderIcon: {
    fontSize: 24, // Consistent icon size
    marginRight: 10,
    color: '#6B4EFF', // Primary accent color
  },
  insightsTitle: {
    fontSize: 22, // Larger title
    fontWeight: '700',
    color: '#2d3436',
  },
  insightItem: {
    backgroundColor: '#F8F8FF', // Lighter background for individual insights
    borderRadius: 15, // More rounded
    padding: 15,
    marginBottom: 10,
    borderWidth: 1, // Added border
    borderColor: '#e4e4fc', // Light border
  },
  insightItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Added margin
  },
  insightItemTitle: { // Added for individual insight titles
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  insightIcon: { // Specific icon style for insights
    marginRight: 10,
  },
  insightText: {
    fontSize: 15, // Slightly larger font
    color: '#555',
    lineHeight: 22, // Better line height
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // --- NEW STYLES BELOW ---
  sectionSubtitle: { // Re-defined for general use
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#F3F0FF', // Light purple background
    borderRadius: 15,
    padding: 5,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  dateRangeButtonActive: {
    backgroundColor: '#6B4EFF',
  },
  dateRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4EFF',
  },
  dateRangeButtonTextActive: {
    color: '#ffffff',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 20, // Space for label
    marginLeft: 10
  },
  noDataContainer: { // Expanded, for charts as well
    alignItems: 'center',
    paddingVertical: 30,
  },
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#F3F0FF',
  },
  explanationToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4EFF',
    marginRight: 5,
  },
  explanationContent: {
    backgroundColor: '#F8F8FF',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e4e4fc',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
    marginTop: 5,
  },
  explanationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  habitListContainer: {
    paddingVertical: 10,
  },
  habitSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFBFF',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  habitSelectItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
  selectedHabitCalendarContainer: { // Renamed for clarity for the calendar part of habit insights
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 5,
  },
  backButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  selectedHabitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  selectedHabitName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginLeft: 10,
  },
  // Calendar specific styles (harmonized with primary app theme)
  calendar: {
    borderRadius: 15,
    paddingBottom: 10,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dayWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    position: 'relative',
  },
  selectedDayWrapper: {
    backgroundColor: '#6B4EFF',
  },
  disabledDayWrapper: {
    backgroundColor: 'transparent',
  },
  dayNumber: {
    fontSize: 14,
    color: '#2d3436',
  },
  selectedDayNumber: {
    color: 'white',
  },
  disabledDayNumber: {
    color: '#ccc',
  },
  habitCalendarIcon: { // Icon for specific habit calendar
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  chartTypeButtons: { // For Mood/Sentiment/Habit chart toggles
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#F3F0FF',
    borderRadius: 15,
    padding: 5,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  chartTypeButtonActive: {
    backgroundColor: '#6B4EFF',
  },
  chartTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4EFF',
  },
  chartTypeButtonTextActive: {
    color: '#ffffff',
  },
  habitChartSelector: { // For selecting habit below chart
    marginBottom: 15,
    alignItems: 'center',
  },
  habitChartSelectorLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  habitSelectScroll: {
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  habitSelectChip: {
    backgroundColor: '#E0E7FF', // Light blue/purple
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 4,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  habitSelectChipActive: {
    backgroundColor: '#6B4EFF',
    borderColor: '#6B4EFF',
  },
  habitSelectChipText: {
    color: '#6B4EFF',
    fontSize: 14,
    fontWeight: '600',
  },
  habitSelectChipTextActive: {
    color: '#FFFFFF',
  },
  // Styles for the inner HabitCalendar component (the custom one)
  calendarContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  calendarTitleMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  calendarHeaderDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#718096',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1, // Keep cells square
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
   calendarDayCell: {
    width: '100%',
    aspectRatio: 1, // Makes the cell square
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent', // Default to transparent
  },
  calendarDayCompleted: {
    backgroundColor: '#D4EDDA', // Light green
    borderColor: '#28A745', // Green border
  },
  calendarDayIncomplete: {
    backgroundColor: '#F8D7DA', // Light red
    borderColor: '#DC3545', // Red border
  },
  calendarDayUntracked: {
  backgroundColor: 'transparent', // No background color
  borderColor: 'transparent',    // No border
  // You might set a lighter text color for untracked days
},
  calendarDayText: {
    fontSize: 14,
    color: '#333',
    position: 'absolute', // Position text to allow icon beside it
    top: 5,
  },
  calendarDayTextCompleted: {
    color: '#28A745', // Green text for completed days
    fontWeight: 'bold',
  },
  calendarDayTextIncomplete: {
    color: '#DC3545', // Red text for incomplete days
    fontWeight: 'bold',
  },
  calendarDayTextUntracked: {
  color: '#A0A0A0', // A light grey for untracked days
},
  calendarDayIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  calendarSummary: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  calendarSummaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  calendarSummaryCompleted: {
    fontWeight: 'bold',
    color: '#28A745',
  },
  calendarSummaryTracked: {
    fontWeight: 'bold',
    color: '#6B4EFF',
  },
  calendarSummaryStreak: {
    fontWeight: 'bold',
    color: '#FF4500',
  },
  habitStatsContainer: { // For the small stats below selected habit name
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#F8F8FF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e4e4fc',
  },
  habitStatItem: {
    alignItems: 'center',
  },
  habitStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4EFF',
  },
  habitStatLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
});

export default styles;

import { StyleSheet } from 'react-native';
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
    width: 230,
    height: 230,
    marginBottom: -20,
    marginTop: -60,
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
    paddingHorizontal: 15, // Reduce horizontal padding if it's too much
    paddingVertical: 10,
    marginTop: -20, // Pull it up slightly if there's a gap after hero/stats
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
    padding: 10, // Reduce overall padding inside the calendar container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  calendar: {
    
    
  },
  legendIcon: {
    marginRight: 3, 
  },
  legend: {
    marginTop: -20,
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
    fontSize: 14,
    color: '#333',
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
   dayWrapper: {
    width: 40, // Reduced width
    height: 55, // Reduced height, balance between number and icons
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 8,
    paddingTop: 4, // Slightly less padding at the top
    paddingBottom: 2,
    marginHorizontal: 1, // Reduced horizontal margin between days
  },
  selectedDayWrapper: {
    backgroundColor: 'rgba(43, 0, 255, 0.5)',
  },
  disabledDayWrapper: {
    // styles
  },
  dayNumber: {
    fontSize: 15, // Slightly smaller font size for day number
    color: '#2d3436',
    marginBottom: 2, // Reduced space between number and mood icons
  },
  selectedDayNumber: {
    color: 'white',
  },
  disabledDayNumber: {
    color: '#ddd',
  },
  multiMoodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    maxHeight: 35, // You might need to uncomment and adjust this if icons overflow too much
    // overflow: 'hidden', // and this if maxHeight is set
  },
  multiMoodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    maxHeight: 30, // Set a max height to control vertical space taken by moods
     // Hide content that overflows the max height
  },
  multiMoodIcon: {
    marginHorizontal: -1.1, // Further reduced horizontal spacing
    marginBottom: -0.5, // Further reduced vertical spacing
  },
});
export default styles;
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light background for the entire page
  },
  container: { // General container style, used for the main scrollview in specific-day, but here safeArea is main
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header Styles (New/Modified)
  headerGradient: {
    paddingTop: 50, // Adjust for SafeArea, give more space
    paddingBottom: 20,
    borderBottomLeftRadius: 25, // Rounded bottom corners
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10, // Space below header content
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Entries List Container (New/Modified)
  entriesListContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 40, // More space at the bottom of the list
  },

  // Entry Card Styles (New/Modified)
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15, // Space between cards
    overflow: 'hidden', // Ensures rounded corners clip content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F0F2F5', // Light background for header
    borderBottomWidth: 1,
    borderBottomColor: '#E0E2E5',
  },
  entryCardDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  entryCardTime: {
    fontSize: 13,
    color: '#666',
  },
  entryCardBody: {
    padding: 15,
  },
  entryCardMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryCardMoodText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  entryCardText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 10,
  },
  entryCardImageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: '#F5F5F5', // Subtle background for indicator
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: 'flex-start', // Only take space needed
  },
  entryCardImageCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },

  // Loading and Empty States (New/Modified)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50, // Push down from header
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addFirstEntryButton: {
    backgroundColor: '#6B4EFF', // Primary button color
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  addFirstEntryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  }
});

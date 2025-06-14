import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF', // Light purple background
  },
  scrollView: {
    flex: 1,
  },

  // Header Section
  header: {
    backgroundColor: '#6B4EFF', // Deep purple
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40, // More padding for status bar area
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6, // Android shadow
    shadowColor: '#6B4EFF', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
    borderRadius: 20,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: '#E0D9FF', // Lighter purple text
  },

  // Quote Container (from previous request)
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20, // Add some margin to separate from header
    padding: 24,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80, // Ensure minimum height
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#2D3748', // Darker text for readability
    marginBottom: 12,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280', // Slightly lighter text
    textAlign: 'right',
    width: '100%',
    paddingRight: 10,
  },
  quoteErrorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 6, // Padding inside the tab container
    elevation: 4,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Vertical padding for each tab
    borderRadius: 16, // Rounded corners for each tab button
    // No transition property in React Native StyleSheet directly
  },
  activeTab: {
    backgroundColor: '#6B4EFF', // Active tab background
    elevation: 2,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#9991B1', // Inactive tab text color
  },
  activeTabText: {
    color: '#FFFFFF', // Active tab text color
  },

  // Objectives Container (for HabitsScreen)
  objectivesContainer: {
    padding: 20,
  },

  // Past Date Notice (for HabitsScreen)
  pastDateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0D9FF', // Light purple
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  pastDateNoticeText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B4EFF', // Deep purple text
    flex: 1,
    fontWeight: '500',
  },

  // Objective Items (for HabitsScreen)
  objectiveItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    flexDirection: 'row', // To align text and checkbox/actions
    alignItems: 'center', // Vertically center items
    justifyContent: 'space-between', // Space out text and actions
    borderWidth: 0, // No border for a cleaner look
  },
  objectiveContent: {
    flex: 1, // Allows text to take available space
    marginRight: 15, // Space between text and buttons
  },
  addedLaterLabel: {
    fontSize: 11,
    color: '#6B4EFF',
    fontWeight: '600',
    marginBottom: 8,
    backgroundColor: '#F0EBFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    alignSelf: 'flex-start', // Align to the start of its container
  },
  objectiveText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  completedObjectiveText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  objectiveActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center', // Center icons vertically
  },
  actionButton: { // Base style for action buttons
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completeButton: {
    backgroundColor: '#E0D9FF', // Light purple for complete button background
  },
  // No specific style for completeButtonIcon, icon color will be passed directly
  deleteButton: {
    padding: 8,
    backgroundColor: '#FFF5F5', // Light red background
    borderWidth: 1,
  borderRadius: 12,
    borderColor: '#FCDCDC', // Light red border
  },

  deleteButtonIcon: {
    color: '#FF4E4E', // Red icon color for delete
  },

  // Empty State (for HabitsScreen and JournalScreen)
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9991B1',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },

  // Add Objective Button (for HabitsScreen)
  addObjectiveButtonContainer: {
    padding: 20,
    paddingTop: 0, // Remove top padding if it's directly below list
  },
  addObjectiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4EFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addObjectiveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Modal Styles (for HabitsScreen forms)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(107, 78, 255, 0.3)', // Semi-transparent purple overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  objectiveInput: {
    borderWidth: 2,
    borderColor: '#E0D9FF',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
    color: '#2D3748',
    backgroundColor: '#F5F3FF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: '#E0D9FF',
  },
  cancelButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Note: saveButton and saveButtonText from formActions can be reused here

  // Journal Container (for JournalScreen)
  journalContainer: {
    flex: 1,
    padding: 20,
  },
  // FAB (Floating Action Button) - can be used for both if needed
   fab: {
    position: 'relative',
    bottom: 0,
    alignSelf: 'center',  // Centers horizontally
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 1000000,
  },

  // Entry Form (for JournalScreen)
  entryForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 0,
  },
  formContent: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F0F2F5',
    borderRadius: 15,
  },

  // Mood Selector (for JournalScreen)
  moodSelectorContainer: {
    marginBottom: 24,
  },
  moodSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodScrollView: {
    flexDirection: 'row',
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0D9FF',
    marginRight: 12,
    minWidth: 85,
    backgroundColor: '#F8F9FA',
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    color: '#2D3748',
    fontWeight: '500',
  },

  // Text Input (for JournalScreen)
  entryTextInput: {
    borderWidth: 2,
    borderColor: '#E0D9FF',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 24,
    color: '#2D3748',
    backgroundColor: '#F5F3FF',
  },

  // Image Section (for JournalScreen)
  imageSection: {
    marginBottom: 24,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#6B4EFF',
    borderRadius: 16,
    borderStyle: 'dashed',
    backgroundColor: '#F5F3FF',
  },
  addImageText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6B4EFF',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4E4E',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form Actions (for JournalScreen and Modals)
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 140,
    elevation: 3,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Entries Container (for JournalScreen)
  entriesContainer: {
    marginTop: 20,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0EBFF',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D9FF',
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  entryMoodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  entryText: {
    fontSize: 15,
    color: '#2D3748',
    lineHeight: 22,
    marginBottom: 8,
  },
  entryImageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EBFF',
  },
  imageCountText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Entry View Modal (for JournalScreen)
  entryViewModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 500,
    elevation: 10,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  entryViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBFF',
    backgroundColor: '#F5F3FF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  entryViewDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4EFF',
  },
  entryViewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  entryViewContent: {
    padding: 24,
  },
  entryViewMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  entryViewMoodText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  entryViewText: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 26,
    marginBottom: 24,
  },
  entryViewImages: {
    flexDirection: 'row',
  },
  entryViewImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
    marginRight: 12,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
  },
  entryContent: {
    // Add this style for the clickable content area if needed
  },
   sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Updated habit item styles to work with colored backgrounds
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5', // This will be overridden by the color
    borderRadius: 12,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  habitContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  habitIcon: {
    marginRight: 12,
  },
  
  habitText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  
  deleteHabitButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Keep your existing styles for other elements
  habitsContainer: {
    flex: 1,
    
  },
  
  dailyHabitsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  
});

export default styles;

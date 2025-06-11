import { StyleSheet } from 'react-native';
const styles = {
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header Section
  header: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: '#E0D9FF',
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 6,
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
    paddingVertical: 14,
    borderRadius: 16,
    transition: 'all 0.3s ease',
  },
  activeTab: {
    backgroundColor: '#6B4EFF',
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
    color: '#9991B1',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // Objectives Container
  objectivesContainer: {
    padding: 20,
  },

  // Quote Container
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0EBFF',
  },
  quoteLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B4EFF',
    marginBottom: 12,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2D3748',
    marginBottom: 12,
    lineHeight: 26,
  },
  author: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '500',
  },

  // Past Date Notice
  pastDateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0D9FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  pastDateNoticeText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B4EFF',
    flex: 1,
    fontWeight: '500',
  },

  // Objective Items
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
    borderWidth: 0,
  },
  objectiveContent: {
    flex: 1,
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
    alignSelf: 'flex-start',
  },
  objectiveText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  completedObjectiveText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  objectiveActions: {
    flexDirection: 'row',
    gap: 10, // Adjusted gap for the new button size
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: { // Renaming to `actionButton` as a general base for these
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center', // This centers content horizontally
    justifyContent: 'center', // This centers content vertically
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
 completeButton: {
    backgroundColor: '#E0D9FF', // Light purple background
  },
  completeButtonIcon: { // New style to hold the specific icon color
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4CAF50', // Green icon color for complete
  },
  deleteButton: {
  padding: 8,
  backgroundColor: '#FFF5F5',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#FCDCDC',
},

  // Empty State
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

  // Journal Container
  journalContainer: {
    flex: 1,
    padding: 20,
  },

  // FAB (Floating Action Button)
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

  // Entry Form
  entryForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // A bit less aggressive curve, more professional
    marginBottom: 20,
    marginHorizontal: 15, // Add horizontal margin to not touch screen edges
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // More subtle shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 0, // No border, rely on shadow for depth
  },
  formContent: {
    padding: 20, // Consistent internal padding
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Good spacing below header
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Slightly darker for better contrast
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F0F2F5', // Lighter, neutral background
    borderRadius: 15, // Consistent with form
  },

  // Mood Selector
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

  // Text Input
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

  // Image Section
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

  // Form Actions
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

  // Entries Container
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

  // Add Objective Button
  addObjectiveButtonContainer: {
    padding: 20,
    paddingTop: 0,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(107, 78, 255, 0.3)',
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

  // Entry View Modal
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
  // Add this style for the clickable content area
},
};
export default styles;
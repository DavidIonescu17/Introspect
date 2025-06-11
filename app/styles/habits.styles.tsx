// styles/habits.styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  habitsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f3ff', // Light purple background
  },
  dailyHabitsList: {
    flex: 1,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    marginRight: 16,
    padding: 8,
    backgroundColor: '#f3f0ff',
    borderRadius: 12,
  },
  habitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f1937',
    flexShrink: 1,
    lineHeight: 22,
  },
  completedHabitText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    opacity: 0.7,
  },
  deleteHabitButton: {
    paddingLeft: 12,
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 24,
    lineHeight: 24,
  },
  addHabitButtonContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  addHabitButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6', // Primary purple
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    // Gradient effect will need to be implemented with LinearGradient component
    // This is a fallback solid color
  },
  addHabitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 12, 41, 0.6)', // Dark purple overlay
  },
  addHabitModalContent: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f3f0ff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f1937',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4c1d95',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.25,
  },
  habitOptionsList: {
    // This style might not be directly used if using FlatList for all content
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#fefefe',
  },
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f3ff',
  },
  customHabitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
    paddingRight: 12,
  },
  habitOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#374151',
    fontWeight: '500',
  },
  habitOptionWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f3ff',
  },
  addNewCustomHabitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#c4b5fd',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  customHabitInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1f1937',
    fontWeight: '500',
  },
  addCustomHabitButton: {
    backgroundColor: '#10b981', // Emerald green
    paddingHorizontal: 20,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    flexDirection: 'row',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addCustomHabitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 28,
    gap: 12,
  },
  modalButton: {
    // Adjusted for close button in header
    padding: 8,
    borderRadius: 20, // Make it circular
    backgroundColor: '#f0f0f0', // Light background for close button
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  // Master Habits Manager Styles
  masterHabitsManagerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f3ff',
  },
  masterHabitsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  masterHabitsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f1937',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  masterHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    // No borderBottomWidth here if it's the last item in a list, FlatList item separator is better
    // For individual items rendered directly, keep it
    borderBottomWidth: 1,
    borderBottomColor: '#f5f3ff',
  },
  masterHabitName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
    marginLeft: 12, // Added margin for icon
  },
  addRemoveMasterHabitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addMasterHabitButton: {
    backgroundColor: '#10b981',
  },
  removeMasterHabitButton: {
    backgroundColor: '#ef4444',
  },
  addRemoveMasterHabitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  masterHabitsScrollView: {
    // Removed maxHeight here to allow outer FlatList to scroll.
    // If you need a max height for *visual grouping*, wrap it in a View with a max height.
    // For now, removing it so the main FlatList can scroll seamlessly.
    // maxHeight: 220,
  },
  addCustomHabitSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  addCustomHabitHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: 12,
    letterSpacing: -0.25,
  },
  customHabitsListContainer: {
    // Removed maxHeight for same reason as masterHabitsScrollView
    // maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  // Icon Picker Styles
  iconPickerContainer: {
    marginBottom: 20,
  },
  iconPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: 12,
    letterSpacing: -0.25,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping for better layout on smaller screens
    justifyContent: 'flex-start',
    // Removed maxHeight here to allow outer FlatList to scroll naturally for icon list
    // maxHeight: 140,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fefefe',
  },
  iconOption: {
    padding: 12,
    margin: 6,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconOptionSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f3f0ff',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  flatListContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom of the entire scrollable content
  },

  // Additional modern components
  gradientButton: {
    // This style is for reference - actual gradients require LinearGradient component
    backgroundColor: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
    //backgroundColor: '#8b5cf6', // Fallback
    borderRadius: 50,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4fc',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  purpleAccent: {
    color: '#8b5cf6',
  },

  darkPurpleText: {
    color: '#4c1d95',
  },

  lightPurpleBackground: {
    backgroundColor: '#f3f0ff',
  },
});

export default styles;
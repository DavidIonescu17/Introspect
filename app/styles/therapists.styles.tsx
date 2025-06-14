import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF', // Light purple background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4EFF', // Deep purple text
    textAlign: 'center',
    paddingVertical: 20,
    marginTop: 20, // Add some top margin
    marginBottom: 10,
  },
  searchSection: {
    marginBottom: 0, // Keep some margin for spacing after the whole section
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0D9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0D9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
  },
  // NEW Picker Styles to match search input fields
  pickerInputWrapper: {
    // We apply the core visual styles here to match searchContainer's appearance
    flexDirection: 'row', // Important for layout of picker and icon
    alignItems: 'center', // Vertically center content
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0D9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    height: 50, // Match input height for consistency
    overflow: 'hidden', // Ensure content respects border radius
  },
  picker: {
    flex: 1, // Make picker take all available space
    height: 50, // Standard height for picker
    color: '#2D3748', // Text color for selected item
    // Add horizontal padding directly to the picker for consistent spacing
    paddingHorizontal: 15, // Match searchInput's padding
  },
  

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 0, // ListHeaderComponent will handle top spacing
    paddingBottom: 20, // Ensure bottom padding for FlatList content
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 5,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0EBFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flexShrink: 1,
    marginRight: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxWidth: '50%',
  },
  badge: {
    backgroundColor: '#F0EBFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 5,
    marginBottom: 5,
  },
  badgeText: {
    fontSize: 12,
    color: '#6B4EFF',
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 10,
    flexShrink: 1, // Allow text to wrap
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B4EFF',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 5,
    fontSize: 14,
    color: '#6B4EFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 0, // Removed horizontal margin to fit FlatList's padding
    borderWidth: 1,
    borderColor: '#E0D9FF',
  },
  noResults: {
    marginTop: 15,
    fontSize: 16,
    color: '#9991B1',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Modal styles (already existing, ensuring they are here)
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#6B4EFF',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;

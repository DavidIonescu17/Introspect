// --- Styles (simplified for this example, you should merge with your existing profile.styles or create a new Insights.styles) ---
import { StyleSheet, Dimensions } from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#4A5568',
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
  chartCard: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#E2E8F0',
  },
  toggleButtonSelected: {
    backgroundColor: '#6B4EFF', // Primary accent color
  },
  toggleButtonText: {
    color: '#4A5568',
    fontWeight: '600',
  },
  toggleButtonTextSelected: {
    color: '#fff',
  },
  insightsCard: {
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
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightsHeaderIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  insightItem: {
    backgroundColor: '#F7FAFC', // Lighter background for individual insights
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6B4EFF', // Accent color for left border
  },
  insightItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  noDataText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default styles;
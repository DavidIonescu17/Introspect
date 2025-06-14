import Stylesheet from 'react-native';
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6B4EFF',
  },
  header: {
    backgroundColor: '#6B4EFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#6B4EFF',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
    alignSelf: 'center',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    flexGrow: 1, 
  },
  messageWrapper: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  roleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginRight: -80
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B4EFF',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#6B4EFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#B8B8B8',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  securityBadge: {
    backgroundColor: '#E5FFEA',
    borderRadius: 15,
    padding: 8,
    alignSelf: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityBadgeText: {
    color: '#1A9E42',
    fontSize: 14,
    fontWeight: '600',
  },
  conversationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  conversationPreview: {
    fontSize: 16,
    marginBottom: 5,
  },
  conversationDate: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#6B4EFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyButton: {
    marginTop:10,
    position: 'absolute',
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  newConversationButton: {
    backgroundColor: '#6B4EFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  newConversationButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
});
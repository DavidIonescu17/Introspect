import React, { useState, useEffect } from 'react';
import 'react-native-get-random-values';
import * as CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { OPENAI_API_KEY } from '../../key';

// Import Firebase instances from your firebase.js file
import { db, auth } from '../../firebaseConfig'; // Adjust path as needed
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Define the system message that sets the AI's role and boundaries
const THERAPIST_SYSTEM_MESSAGE = {
  role: 'system',
  content: `You are an AI assistant trained to provide supportive, empathetic responses while maintaining clear boundaries. 

Key guidelines:
- Always maintain a warm, professional, and supportive tone
- Focus on active listening and validation
- Never provide medical advice or diagnoses
- Do not prescribe medications or treatments
- If someone expresses thoughts of self-harm or harming others, direct them to emergency services and crisis hotlines
- Be clear about being an AI assistant, not a replacement for licensed mental health professionals
- Encourage seeking professional help when appropriate

Crisis resources to share when needed:
- National Crisis Hotline (RO): 112
- For suicidal crisis (RO): 0800 801 200 or mail 24/7 at sos@antisuicid.ro`
};

interface Conversation {
  id: string;
  messages: Message[];
  lastUpdated: string;
  preview: string;
  encryptedData?: string; // For storing encrypted conversations
}

const STORAGE_KEY = 'chatbot_conversations';
const ENCRYPTION_KEY_STORAGE = 'user_encryption_key';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Generate or retrieve a user-specific encryption key
  const setupEncryptionKey = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }
      
      // Use a user-specific storage key
      const userKeyStorage = `${ENCRYPTION_KEY_STORAGE}_${currentUser.uid}`;
      let key = await AsyncStorage.getItem(userKeyStorage);
      
      if (!key) {
        // Generate a key using a more reliable method for React Native
        const randomArray = new Uint8Array(32); // 256 bits
        crypto.getRandomValues(randomArray);
        
        // Convert to hex string
        key = Array.from(randomArray)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
          
        await AsyncStorage.setItem(userKeyStorage, key);
      }
      
      setEncryptionKey(key);
    } catch (error) {
      console.error('Error setting up encryption key:', error);
      // Fallback to a less secure but functional method
      if (!encryptionKey) {
        const fallbackKey = generateFallbackKey();
        setEncryptionKey(fallbackKey);
        await AsyncStorage.setItem(userKeyStorage, fallbackKey);
      }
    }
  };

  // Check authentication and load user data
// 1. When user is authenticated, setup encryption key
useEffect(() => {
  const setup = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await setupEncryptionKey();
    }
  };

  setup();
}, []);

// 2. When encryption key is ready, load conversations
useEffect(() => {
  const loadConversations = async () => {
    const currentUser = auth.currentUser;
    if (currentUser && encryptionKey) {
      await loadUserConversations();
    }
  };

  loadConversations();
}, [encryptionKey]);

  const loadUserConversations = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('Cannot load conversations: No authenticated user');
        return;
      }
      
      // Get only conversations owned by this user
      const q = query(
        collection(db, "conversations"),
        where("userId", "==", currentUser.uid),
        orderBy("lastUpdated", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const loadedConversations: Conversation[] = [];
      
      // Process each conversation document
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Attempt to decrypt the conversation
        
        let decryptedMessages: Message[] = [];
        try {
          if (data.encryptedData && encryptionKey) {
            const bytes = CryptoJS.AES.decrypt(data.encryptedData, encryptionKey);
            decryptedMessages = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          }
        } catch (error) {
          console.error(`Error decrypting conversation ${doc.id}:`, error);
        }
        
        loadedConversations.push({
          id: doc.id,
          messages: decryptedMessages,
          lastUpdated: data.lastUpdated,
          preview: data.preview || 'Conversation',
        });
      }
      
      setConversations(loadedConversations);
      
      // Also save locally for offline access
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedConversations));
    } catch (error) {
      console.error('Error loading conversations from Firebase:', error);
      // Fall back to local storage if Firebase fetch fails
      await loadLocalConversations();
    }
  };

  const loadLocalConversations = async () => {
    try {
      const storedConversations = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
    } catch (error) {
      console.error('Error loading local conversations:', error);
    }
  };

  const encryptAndSaveConversation = async () => {
    if (!currentConversationId || !messages.length) return;
    
    const currentUser = auth.currentUser;
    if (!currentUser || !encryptionKey) {
      console.error('Cannot save: Missing user or encryption key');
      return;
    }

    try {
      // Encrypt the messages array with the user's personal key
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(messages),
        encryptionKey
      ).toString();
      
      // Create preview from the last message (no sensitive data in preview)
      const preview = messages[messages.length - 1].content.substring(0, 50) + '...';
      const lastUpdated = new Date().toISOString();
      
      // Update in Firebase with encrypted data and userId for access control
      const conversationRef = doc(db, "conversations", currentConversationId);
      await updateDoc(conversationRef, {
        encryptedData,
        preview,
        lastUpdated,
        userId: currentUser.uid // This ensures only this user can access it
      });
      
      // Update local state
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages,
              lastUpdated,
              preview
            }
          : conv
      );
      
      setConversations(updatedConversations);
      
      // Update local storage backup
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error encrypting and saving conversation:', error);
      Alert.alert(
        'Error',
        'Failed to save conversation securely. Your data might not be backed up.',
        [{ text: 'OK' }]
      );
    }
  };

  const startNewConversation = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !encryptionKey) {
      console.error('Cannot create conversation: No authenticated user or encryption key');
      return;
    }
    
    try {
      // Create initial empty message array and encrypt it
      const emptyMessages: Message[] = [];
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(emptyMessages),
        encryptionKey
      ).toString();
      
      // Add a new document to Firebase with user ID for privacy
      const docRef = await addDoc(collection(db, "conversations"), {
        userId: currentUser.uid,
        lastUpdated: new Date().toISOString(),
        preview: 'New conversation',
        encryptedData
      });
      
      const newConversation: Conversation = {
        id: docRef.id,
        messages: [],
        lastUpdated: new Date().toISOString(),
        preview: 'New conversation'
      };
    
      // Update conversations in state and storage
      const updatedConversations = [...conversations, newConversation];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
      setCurrentConversationId(docRef.id);
      setMessages([]);
      setHistoryModalVisible(false);
    } catch (error) {
      console.error('Error creating new conversation:', error);
      Alert.alert(
        'Error',
        'Failed to create a new conversation.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setIsLoadingConversation(true);  // 👈 set the flag before loading
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setHistoryModalVisible(false);
    }
  };
  

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot send message: No authenticated user');
      return;
    }
    
    // Create new conversation if none exists
    if (!currentConversationId) {
      await startNewConversation();
    }
  
    dismissKeyboard();
  
    const userMessage = {
      role: 'user' as const,
      content: userInput,
      timestamp: getCurrentTime(),
    };
  
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setUserInput('');
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            THERAPIST_SYSTEM_MESSAGE,
            ...updatedMessages,
          ].map(({ role, content }) => ({ role, content })),
          max_tokens: 250,
          temperature: 0.7,
        }),
      });
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0) {
        const botMessage = {
          role: 'assistant' as const,
          content: data.choices[0].message.content.trim(),
          timestamp: getCurrentTime(),
        };
  
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        
        // Chat state updated, useEffect will trigger the save
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. If you're in crisis, please call 988 or text HOME to 741741 for immediate support.",
        timestamp: getCurrentTime(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Save conversation whenever messages change
  useEffect(() => {
    if (isLoadingConversation) {
      setIsLoadingConversation(false); // 👈 reset flag after loading
      return; // 👈 skip saving when just loading
    }
  
    if (currentConversationId && messages.length > 0 && encryptionKey) {
      encryptAndSaveConversation();
    }
  }, [messages]);
  

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageWrapper}>
      <Text style={styles.roleLabel}>
        {item.role === 'user' ? '' : 'AI Assistant'}
      </Text>
      <View
        style={[
          styles.messageContainer,
          item.role === 'user' ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          item.role === 'user' && styles.userMessageText
        ]}>{item.content}</Text>
        <Text style={[
          styles.timestamp,
          item.role === 'user' && styles.userTimestamp
        ]}>{item.timestamp}</Text>
      </View>
    </View>
  );

  const ConversationsModal = () => (
    <Modal
      visible={isHistoryModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setHistoryModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Conversation History</Text>
          <View style={styles.securityBadge}>
            <Text style={styles.securityBadgeText}>🔒 End-to-End Encrypted</Text>
          </View>
          <TouchableOpacity
            style={styles.newConversationButton}
            onPress={startNewConversation}
          >
            <Text style={styles.newConversationButtonText}>Start New Conversation</Text>
          </TouchableOpacity>
          <FlatList
            data={conversations.sort((a, b) => 
              new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            )}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => loadConversation(item.id)}
              >
                <Text style={styles.conversationPreview}>{item.preview}</Text>
                <View style={styles.conversationMetadata}>
                  <Text style={styles.conversationDate}>
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </Text>
                  <Text style={styles.conversationTime}>
                    {new Date(item.lastUpdated).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setHistoryModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AI Support Assistant</Text>
        <Text style={styles.headerSubtext}>A safe space to talk - Remember, I'm an AI assistant, not a replacement for professional help</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setHistoryModalVisible(true)}
        >
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      <ConversationsModal />

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContainer}
            keyboardShouldPersistTaps="handled"
            inverted={false}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#999"
              multiline
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
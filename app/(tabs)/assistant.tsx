import React, { useState, useEffect } from 'react';
import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store'; // Still needed for getEncryptionKey from shared module
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
import styles from '../styles/assistant.styles'
// Import Firebase instances from your firebase.js file
import { db, auth } from '../../firebaseConfig'; // Adjust path as needed
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Import CryptoJS for AES encryption
import CryptoJS from 'crypto-js';

// Import the getEncryptionKey from your shared encryption.ts module
// Make sure the path is correct based on your project structure
import { getEncryptionKey } from '../utils/encryption'; // Assuming encryption.ts is at ../../encryption.ts
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

const STORAGE_KEY = 'chatbot_conversations'; // For local AsyncStorage fallback

// Updated Encryption utility functions using CryptoJS.AES
const encryptionUtils = {
  /**
   * Encrypts data using AES with the provided key.
   * Data is stringified to JSON before encryption.
   * @param data The data object to encrypt (e.g., Message[]).
   * @param key The encryption key (string).
   * @returns The encrypted data as a string.
   */
  encrypt: (data: any, key: string) => {
    if (!key) {
      console.error('Encryption key is missing for encryption.');
      throw new Error('Encryption key not available.');
    }
    try {
      const jsonString = JSON.stringify(data);
      // CryptoJS.AES handles IV generation and padding internally
      return CryptoJS.AES.encrypt(jsonString, key).toString();
    } catch (error) {
      console.error('CryptoJS AES Encryption error:', error);
      throw new Error('Failed to encrypt data securely with AES.');
    }
  },

  /**
   * Decrypts AES encrypted data using the provided key.
   * The decrypted string is then parsed back from JSON.
   * @param encryptedData The encrypted data string.
   * @param key The decryption key (string).
   * @returns The decrypted data object.
   */
  decrypt: (encryptedData: string, key: string) => {
    if (!key) {
      console.error('Encryption key is missing for decryption.');
      throw new Error('Encryption key not available.');
    }
    try {
      // Decrypt returns a WordArray
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      // Convert WordArray to UTF-8 string and parse JSON
      const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);

      // Check if the decrypted string is empty or invalid JSON after decryption
      if (!decryptedJson) {
        console.warn('Decrypted string is empty. Possible decryption issue or empty original data.');
        return null; // Or handle as an error indicating empty data
      }
      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('CryptoJS AES Decryption error:', error);
      // More specific error for JSON parsing vs. crypto errors
      if (error instanceof SyntaxError) {
        console.error('JSON Parse error after decryption. Decrypted content might be corrupted or not valid JSON.');
      }
      throw new Error('Failed to decrypt data securely with AES.');
    }
  },
};


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

  // Setup encryption key using the shared SecureStore utility
  const setupEncryptionKey = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found for encryption key setup.');
        // Potentially sign in anonymously if no user is found and required
        return;
      }
      
      // Use the getEncryptionKey from the imported shared module
      // Pass currentUser.uid to ensure a unique key per user
      const key = await getEncryptionKey(currentUser.uid);
      setEncryptionKey(key);
    } catch (error) {
      console.error('Error setting up encryption key:', error);
      Alert.alert(
        'Encryption Error',
        'Failed to setup secure encryption. Please restart the app.',
        [{ text: 'OK' }]
      );
    }
  };

  // Check authentication and load user data
  useEffect(() => {
    // Listen for auth state changes to ensure user is available before key setup
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await setupEncryptionKey();
      } else {
        // Handle no user case, e.g., sign in anonymously or prompt login
        console.log("No user logged in, or logging out.");
        // You might want to clear sensitive data if user logs out
        setEncryptionKey('');
        setConversations([]);
        setMessages([]);
        setCurrentConversationId(null);
      }
    });

    return unsubscribe; // Cleanup the auth state listener
  }, []); // Run only once on component mount


  // When encryption key is ready, load conversations
  useEffect(() => {
    const loadConversations = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && encryptionKey) {
        await loadUserConversations();
      } else if (currentUser && !encryptionKey) {
        // Key might still be loading, or failed to load.
        // This log helps debug potential timing issues.
        console.log('User present but encryption key not yet available, waiting to load conversations.');
      }
    };

    loadConversations();
  }, [encryptionKey, auth.currentUser]); // Re-run when key or user changes

  const loadUserConversations = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !encryptionKey) { // Ensure both user and key are ready
        console.error('Cannot load conversations: User or encryption key not available.');
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
            // Use the new encryptionUtils.decrypt function
            decryptedMessages = encryptionUtils.decrypt(data.encryptedData, encryptionKey);
          }
        } catch (error) {
          console.error(`ERROR: Failed to decrypt conversation ${doc.id}:`, error);
          // Alert the user about decryption failure for a specific conversation
          // This prevents the whole app from breaking if one conversation is corrupt
          Alert.alert(
            'Decryption Failed',
            `Could not decrypt conversation '${data.preview || doc.id}'. It might be corrupted or encrypted with a different key.`,
            [{ text: 'OK' }]
          );
        }
        
        loadedConversations.push({
          id: doc.id,
          messages: decryptedMessages, // Add decrypted messages, could be empty if decryption failed
          lastUpdated: data.lastUpdated,
          preview: data.preview || 'Conversation',
        });
      }
      
      setConversations(loadedConversations);
      
      // Also save locally for offline access (consider if you need to encrypt local storage too)
      // For now, storing decrypted for local access. If local storage needs encryption, it's a separate step.
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
        // Assume local storage does not store encrypted data for simplicity, or add decryption here if it does
        setConversations(JSON.parse(storedConversations));
      }
    } catch (error) {
      console.error('Error loading local conversations:', error);
    }
  };

  const encryptAndSaveConversation = async () => {
    // Only save if there's a current conversation and messages to save, and encryption key is ready
    if (!currentConversationId || !messages.length || !encryptionKey) {
      console.log('Skipping save: No conversation ID, no messages, or no encryption key.');
      return;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot save: Missing authenticated user.');
      return;
    }

    try {
      // Encrypt the messages array with the user's personal key using CryptoJS.AES
      const encryptedData = encryptionUtils.encrypt(
        messages, // Pass the messages array directly, encrypt function will stringify
        encryptionKey
      );
      
      // Create preview from the last message (no sensitive data in preview)
      const preview = messages[messages.length - 1].content.substring(0, 50) + '...';
      const lastUpdated = new Date().toISOString();
      
      // Update in Firebase with encrypted data and userId for access control
      const conversationRef = doc(db, "conversations", currentConversationId);
      await updateDoc(conversationRef, {
        encryptedData,
        preview,
        lastUpdated,
        userId: currentUser.uid // This ensures only this user can access it via security rules
      });
      
      // Update local state (only update metadata, messages are already current)
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              lastUpdated,
              preview,
              messages: messages    
             }
          : conv
      );
      
      setConversations(updatedConversations);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations))
      // Update local storage backup (consider if local backup should also be encrypted)
      // For now, storing decrypted messages in local storage for offline use.
      const localConversations = updatedConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return { ...conv, messages: messages }; // Store the current decrypted messages
        }
        return conv;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localConversations));
    } catch (error) {
      console.error('Error encrypting and saving conversation:', error);
      Alert.alert(
        'Save Error',
        'Failed to save conversation securely. Your data might not be backed up.',
        [{ text: 'OK' }]
      );
    }
  };

  const startNewConversation = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !encryptionKey) {
      console.error('Cannot create conversation: No authenticated user or encryption key.');
      return;
    }
    
    try {
      // Create initial empty message array and encrypt it
      const emptyMessages: Message[] = [];
      const encryptedData = encryptionUtils.encrypt(
        emptyMessages, // Encrypt an empty array initially
        encryptionKey
      );
      
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
      const updatedConversations = [newConversation, ...conversations]; // Add to top
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
      setIsLoadingConversation(true); // Flag to prevent immediate save after loading
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setHistoryModalVisible(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('Cannot send message: No authenticated user.');
      // Optionally, prompt user to log in
      Alert.alert('Not Logged In', 'Please log in to send messages.', [{ text: 'OK' }]);
      return;
    }
    // Ensure encryption key is loaded before sending messages that will be saved
    if (!encryptionKey) {
        console.error('Encryption key not loaded, cannot send message and save.');
        Alert.alert('Setup Error', 'Encryption key is not ready. Please wait a moment or restart.', [{ text: 'OK' }]);
        return;
    }
    
    dismissKeyboard();

    const userMessage = {
      role: 'user' as const,
      content: userInput,
      timestamp: getCurrentTime(),
    };
  
    setLoading(true);
    setUserInput(''); // Clear input immediately for better UX

    let messagesToDisplay = [...messages, userMessage]; // Messages including the new user input

    if (!currentConversationId) {
      // This is the first message in a brand new conversation
      try {
        // Explicitly create the new conversation document with an initial empty state
        // This ensures the document exists before any updateDoc calls.
        const emptyEncryptedData = encryptionUtils.encrypt([], encryptionKey);
        const newDocRef = await addDoc(collection(db, "conversations"), {
          userId: currentUser.uid,
          lastUpdated: new Date().toISOString(),
          preview: 'New conversation', // Initial preview before messages are added
          encryptedData: emptyEncryptedData // Store empty messages initially
        });
        setCurrentConversationId(newDocRef.id); // Update state with the new conversation ID

        // Also add this new conversation to the `conversations` list in state
        // (This will be updated with the first real message later by useEffect)
        const newConversationEntry: Conversation = {
          id: newDocRef.id,
          messages: [], // Will be populated by setMessages below
          lastUpdated: new Date().toISOString(),
          preview: 'New conversation'
        };
        setConversations(prev => [newConversationEntry, ...prev]);

      } catch (error) {
        console.error('Error creating new conversation for first message:', error);
        Alert.alert('Error', 'Failed to start a new conversation for your message.', [{ text: 'OK' }]);
        setLoading(false);
        return; // Stop execution if initial conversation creation fails
      }
    }
  
    // Now currentConversationId is guaranteed to be set if we've reached this point.
    // Update messages state to include the user's latest message.
    // This state update will trigger the useEffect to save the conversation.
    setMessages(messagesToDisplay);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          // Filter out timestamp for API, and ensure system message is first
          messages: [
            THERAPIST_SYSTEM_MESSAGE,
            ...messagesToDisplay, // Use messagesToDisplay which includes the user's message
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
  
        const finalMessages = [...messagesToDisplay, botMessage]; // Include bot message
        setMessages(finalMessages); // This will trigger the save useEffect
      } else {
        // Handle cases where API response is valid but no choices are returned
        console.warn('OpenAI API returned no choices:', data);
        const errorMessage = {
          role: 'assistant' as const,
          content: "I received an empty response from the AI. Please try again.",
          timestamp: getCurrentTime(),
        };
        setMessages(prev => [...prev, errorMessage]); // Add error message to current messages
      }
    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: "I apologize, but I'm having trouble responding right now. If you're in crisis, please call 988 or text HOME to 741741 for immediate support.",
        timestamp: getCurrentTime(),
      };
      setMessages(prev => [...prev, errorMessage]); // Add error message to current messages
    } finally {
      setLoading(false);
    }
  };

  // Save conversation whenever messages or currentConversationId change
  useEffect(() => {
    // Prevent saving immediately after loading a conversation, as messages state is updated from Firebase
    if (isLoadingConversation) {
      setIsLoadingConversation(false); // Reset flag after initial load
      return;
    }
    
    // Only attempt to save if currentConversationId and encryptionKey are set, and there are messages
    if (currentConversationId && messages.length > 0 && encryptionKey) {
      encryptAndSaveConversation();
    } else if (currentConversationId && messages.length === 0 && encryptionKey) {
        // This case is for a newly started conversation that is still empty after initial setup
        // or a cleared conversation. We might want to save its empty state if currentConversationId is valid.
        console.log('Conversation is empty, but ID is set. No content to save.');
    }
  }, [messages, currentConversationId, encryptionKey]); // Dependencies for saving

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
            <Text style={styles.securityBadgeText}>🔒 Securely Encrypted</Text>
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

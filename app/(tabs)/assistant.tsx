import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { OPENAI_API_KEY } from '../../key';

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
}
const STORAGE_KEY = 'chatbot_conversations';


export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);

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
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const storedConversations = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveCurrentConversation = async () => {
    if (!currentConversationId || !messages.length) return;

    const updatedConversations = conversations.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages,
            lastUpdated: new Date().toISOString(),
            preview: messages[messages.length - 1].content.substring(0, 50) + '...'
          }
        : conv
    );

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const startNewConversation = async () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      messages: [],
      lastUpdated: new Date().toISOString(),
      preview: 'New conversation'
    };
  
    // Update conversations in state and storage
    const updatedConversations = [...conversations, newConversation];
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
      setCurrentConversationId(newId);
      setMessages([]);
      setHistoryModalVisible(false);
    } catch (error) {
      console.error('Error saving new conversation:', error);
    }
  };
  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setHistoryModalVisible(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
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
  
        // Save conversation immediately after updating messages
        const updatedConversations = conversations.map(conv =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: finalMessages,
                lastUpdated: new Date().toISOString(),
                preview: botMessage.content.substring(0, 50) + '...'
              }
            : conv
        );
  
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
        setConversations(updatedConversations);
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
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      saveCurrentConversation();
    }
  }, [messages]);

  // Rest of the component remains the same...
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

// Styles remain the same...

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8A2BE2',
  },
  header: {
    backgroundColor: '#8A2BE2',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7B27CC',
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
    backgroundColor: '#8A2BE2',
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
    backgroundColor: '#8A2BE2',
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
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#8A2BE2',
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
    right: 20,
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
    backgroundColor: '#8A2BE2',
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
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    flexGrow: 1, // Ensures content can scroll
  }
});
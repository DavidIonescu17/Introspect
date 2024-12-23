import React, { useState } from 'react';
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
- National Crisis Hotline (US): 988
- Crisis Text Line: Text HOME to 741741`
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

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

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    dismissKeyboard();

    const userMessage = {
      role: 'user' as const,
      content: userInput,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
            ...messages,
            userMessage
          ].map(({ role, content }) => ({ role, content })),
          max_tokens: 250, // Increased for more detailed responses
          temperature: 0.7, // Balanced between consistency and empathy
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const botMessage = {
          role: 'assistant' as const,
          content: data.choices[0].message.content.trim(),
          timestamp: getCurrentTime(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response from OpenAI');
      }
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I'm having trouble responding right now. If you're in crisis, please call 988 or text HOME to 741741 for immediate support.",
          timestamp: getCurrentTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageWrapper}>
      <Text style={styles.roleLabel}>
        {item.role === 'user' ? 'You' : 'AI Therapist'}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AI Support Assistant</Text>
        <Text style={styles.headerSubtext}>A safe space to talk - Remember, I'm an AI assistant, not a replacement for professional help</Text>
      </View>

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
});
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function SpecificDay() {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [addObjectiveModalVisible, setAddObjectiveModalVisible] = useState(false);
  const [quote, setQuote] = useState('Loading...');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime] = useState(new Date());

  const auth = getAuth();
  const user = auth.currentUser;
  const objectivesCollection = collection(db, 'objectives');

  const fetchQuote = async () => {
    try {
      setIsLoading(true);
      const apiUrl = 'https://zenquotes.io/api/random/';
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data.length > 0) {
        setQuote(data[0].q);
        setAuthor(data[0].a);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote('Believe in yourself.');
      setAuthor('Daily Reminder');
      setError('Failed to fetch quote');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchObjectives = async () => {
    if (user) {
      try {
        const q = query(objectivesCollection, where("userId", "==", user.uid), where("date", "==", date));
        const data = await getDocs(q);
        setObjectives(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error fetching objectives:', error);
        setError('Failed to fetch objectives');
      }
    }
  };

  const addObjective = async () => {
    if (user && newObjective.trim()) {
      try {
        await addDoc(objectivesCollection, {
          objective: newObjective,
          completed: false,
          userId: user.uid,
          date: date,
        });
        setNewObjective('');
        setAddObjectiveModalVisible(false);
        fetchObjectives();
      } catch (error) {
        console.error('Error adding objective:', error);
        setError('Failed to add objective');
      }
    }
  };

  const updateObjective = async (id, completed) => {
    try {
      const objectiveDoc = doc(db, 'objectives', id);
      await updateDoc(objectiveDoc, { completed: !completed });
      fetchObjectives();
    } catch (error) {
      console.error('Error updating objective:', error);
      setError('Failed to update objective');
    }
  };

  const deleteObjective = async (id) => {
    try {
      const objectiveDoc = doc(db, 'objectives', id);
      await deleteDoc(objectiveDoc);
      fetchObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
      setError('Failed to delete objective');
    }
  };

  useEffect(() => {
    fetchQuote();
    fetchObjectives();
  }, [date]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Objectives</Text>
          <Text style={styles.headerDate}>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Quote Section */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>Inspiration for Today</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#6B4EFF" />
          ) : (
            <>
              <Text style={styles.quoteText}>"{quote}"</Text>
              <Text style={styles.quoteAuthor}>― {author}</Text>
            </>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Objectives List */}
        <FlatList
          style={styles.list}
          data={objectives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.objectiveCard}>
              <View style={styles.objectiveContent}>
                <Text style={[
                  styles.objectiveText,
                  item.completed && styles.completedObjective
                ]}>
                  {item.objective}
                </Text>
                <View style={styles.objectiveActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, 
                      item.completed ? styles.undoButton : styles.completeButton
                    ]}
                    onPress={() => updateObjective(item.id, item.completed)}
                  >
                    <Text style={styles.actionButtonText}>
                      {item.completed ? 'Undo' : 'Complete'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteObjective(item.id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No objectives set for today. Add one to get started!
              </Text>
            </View>
          }
        />

        {/* Bottom Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.mainButton, styles.addButton]}
            onPress={() => setAddObjectiveModalVisible(true)}
          >
            <Text style={styles.mainButtonText}>Add Objective</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainButton, styles.backButton]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.mainButtonText}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* Add Objective Modal */}
        <Modal
          visible={addObjectiveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Objective</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="What would you like to achieve today?"
                placeholderTextColor="#9991B1"
                value={newObjective}
                onChangeText={setNewObjective}
                multiline
                maxLength={200}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setAddObjectiveModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={addObjective}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6B4EFF',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerDate: {
    fontSize: 16,
    color: '#E0D9FF',
  },
  quoteCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B4EFF',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D3748',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  objectiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  objectiveContent: {
    padding: 16,
  },
  objectiveText: {
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 12,
    lineHeight: 24,
  },
  completedObjective: {
    textDecorationLine: 'line-through',
    color: '#9991B1',
  },
  objectiveActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 90,
  },
  completeButton: {
    backgroundColor: '#6B4EFF',
  },
  undoButton: {
    backgroundColor: '#9991B1',
  },
  deleteButton: {
    backgroundColor: '#FF4E4E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  mainButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#6B4EFF',
  },
  backButton: {
    backgroundColor: '#E0D9FF',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0D9FF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#F5F3FF',
    color: '#2D3748',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F5F3FF',
  },
  modalSaveButton: {
    backgroundColor: '#6B4EFF',
  },
  modalCancelText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9991B1',
    textAlign: 'center',
    lineHeight: 24,
  },
});
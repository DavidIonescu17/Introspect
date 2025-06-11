import styles from '../styles/specific-day.styles';
import React, { useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { db } from '../../firebaseConfig';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { getAuth } from 'firebase/auth';

const ENCRYPTION_KEY = 'ezYxGHuBw5W5jKewAnJsmie52Ge14WCzk+mIW8IFD6gzl/ubFlHjGan+LbcJ2M1m';

const { width } = Dimensions['get']('window');
const MOODS = {
  veryHappy: {
    icon: 'emoticon-excited-outline',
    label: 'Very Happy',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFED4E']
  },
  happy: {
    icon: 'emoticon-happy-outline',
    label: 'Happy',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A']
  },
  content: {
    icon: 'emoticon-outline',
    label: 'Content',
    color: '#7ED6DF',
    gradient: ['#7ED6DF', '#81ECEC']
  },
  neutral: {
    icon: 'emoticon-neutral-outline',
    label: 'Meh',
    color: '#92beb5',
    gradient: ['#92beb5', '#A8C8C0']
  },
  anxious: {
    icon: 'emoticon-frown-outline',
    label: 'Anxious',
    color: '#9b59b6',
    gradient: ['#9b59b6', '#be90d4']
  },
  angry: {
    icon: 'emoticon-angry-outline',
    label: 'Angry',
    color: '#e74c3c',
    gradient: ['#e74c3c', '#f1948a']
  },
  sad: {
    icon: 'emoticon-sad-outline',
    label: 'Sad',
    color: '#7286D3',
    gradient: ['#7286D3', '#8FA4E8']
  },
  verySad: {
    icon: 'emoticon-cry-outline',
    label: 'Very Sad',
    color: '#b44560',
    gradient: ['#b44560', '#C85A75']
  },
  overwhelmed: {
    icon: 'emoticon-confused-outline',
    label: 'Overwhelmed',
    color: '#ffa502',
    gradient: ['#ffa502', '#ffb347']
  },
  tired: {
    icon: 'emoticon-sick-outline',
    label: 'Tired',
    color: '#95a5a6',
    gradient: ['#95a5a6', '#bdc3c7']
  },
  hopeful: {
    icon: 'emoticon-wink-outline',
    label: 'Hopeful',
    color: '#00cec9',
    gradient: ['#00cec9', '#81ecec']
  }
};

// Encryption functions
const encryptData = (data) => {
  return CryptoJS.AES['encrypt'](JSON.stringify(data), ENCRYPTION_KEY)['toString']();
};

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES['decrypt'](encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes['toString'](CryptoJS.enc.Utf8));
  } catch (error) {
    console['error']('Decryption error:', error);
    return null;
  }
};

export default function SpecificDay() {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [addObjectiveModalVisible, setAddObjectiveModalVisible] = useState(false);
  const [quote, setQuote] = useState('Loading...');
  const [author, setAuthor, ] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const {date, initialTab, openForm } = useLocalSearchParams();
  
  // Initialize isAddingEntry to false by default
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  // Ref to track if the initial 'openForm' has been handled
  const initialOpenHandled = useRef(false);

  const [entryText, setEntryText] = useState('');
  const [entryImages, setEntryImages] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null); // Used only for the view modal
  const [selectedMood, setSelectedMood] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Flag for the form being in edit mode
  const [editingEntryId, setEditingEntryId] = useState(null); // New state to hold the ID of the entry being edited
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const [showObjectives, setShowObjectives] = useState(initialTab !== 'journal');
  const auth = getAuth();
  const user = auth.currentUser;
  const objectivesCollection = collection(db, 'objectives');
  const router = useRouter();
  // Check if the selected date is before today
  const isPastDate = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = new Date(date)['toDateString']() === new Date()['toDateString']();
// Animation value - Initialize to 0, will be updated by useEffect
  const slideAnim = useRef(new Animated.Value(0)).current;
  const loadEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const loadedEntries = [];

      querySnapshot['forEach']((doc) => {
        const data = doc.data();
        console['log']('Raw document data:', data);

        const decryptedData = decryptData(data.encryptedContent);
        console['log']('Decrypted data:', decryptedData);

        if (decryptedData) {
          const entryDateString = new Date(decryptedData.date)['toISOString']()['split']('T')[0];
          const selectedDateString = new Date(date)['toISOString']()['split']('T')[0];

          console['log']('Entry date:', entryDateString, 'Selected date:', selectedDateString);

          if (entryDateString === selectedDateString) {
            loadedEntries.push({
              id: doc.id,
              ...decryptedData,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
            });
          }
        }
      });

      // Sort entries by creation time (most recent first)
      loadedEntries['sort']((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });

      console['log']('Loaded entries:', loadedEntries);
      setEntries(loadedEntries);

    } catch (error) {
      console['error']('Error loading entries:', error);
      Alert['alert']('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (entryText.trim() === '' && entryImages.length === 0) {
      Alert['alert']('Empty Entry', 'Please add some content to your journal entry.');
      return;
    }

    if (!selectedMood) {
      Alert['alert']('Mood Required', 'Please select how you\'re feeling today.');
      return;
    }

    try {
      setLoading(true);

      const entryData = {
        text: entryText,
        images: entryImages,
        mood: selectedMood,
        date: new Date(date)['toISOString']()
      };

      const encryptedContent = encryptData(entryData);

      if (isEditing && editingEntryId) { // Use editingEntryId for update logic
        // Update existing entry
        const docRef = doc(db, 'journal_entries', editingEntryId);
        await updateDoc(docRef, {
          encryptedContent: encryptedContent,
          updatedAt: new Date()
        });
        console['log']('Entry updated successfully');
      } else {
        // Add new entry
        await addDoc(collection(db, 'journal_entries'), {
          userId: user?.uid,
          encryptedContent: encryptedContent,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console['log']('New entry created successfully');
      }

      // Reset form
      resetForm();

      // Reload entries
      await loadEntries();

    } catch (error) {
      console['error']('Error saving entry:', error);
      Alert['alert']('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    if (isPastDate) {
      setIsLoading(false);
      return;
    }

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
      console['error']('Error fetching quote:', error);
      setQuote('Believe in yourself.');
      setAuthor('Daily Reminder');
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
        console['error']('Error fetching objectives:', error);
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
          addedLater: isPastDate,
        });
        setNewObjective('');
        setAddObjectiveModalVisible(false);
        fetchObjectives();
      } catch (error) {
        console['error']('Error adding objective:', error);
      }
    }
  };

  const updateObjective = async (id, completed) => {
    try {
      const objectiveDoc = doc(db, 'objectives', id);
      await updateDoc(objectiveDoc, { completed: !completed });
      fetchObjectives();
    } catch (error) {
      console['error']('Error updating objective:', error);
    }
  };

  const deleteObjective = async (id) => {
    try {
      const objectiveDoc = doc(db, 'objectives', id);
      await deleteDoc(objectiveDoc);
      fetchObjectives();
    } catch (error) {
      console['error']('Error deleting objective:', error);
    }
  };

  const resetForm = () => {
    setEntryText('');
    setEntryImages([]);
    setSelectedMood(null);
    setSelectedEntry(null); // Clears the entry being viewed
    setIsAddingEntry(false); // Closes the form
    setIsEditing(false); // Resets edit mode flag
    setEditingEntryId(null); // Clears the ID of the entry being edited
  };

  const editEntry = (entry) => {
    setEntryText(entry.text);
    setEntryImages(entry.images || []);
    setSelectedMood(entry.mood);
    setEditingEntryId(entry.id); // Set the ID for the saveEntry function to use for update
    setIsEditing(true); // Flag that we are editing
    setIsAddingEntry(true); // Open the form
    setSelectedEntry(null); // Ensure the view modal is closed if it was open
  };

  const deleteEntry = (entryId) => {
    Alert['alert'](
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'journal_entries', entryId));
              await loadEntries();
              setSelectedEntry(null); // Clear selected entry after deletion
            } catch (error) {
              console['error']('Error deleting entry:', error);
              Alert['alert']('Error', 'Failed to delete the entry. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // This function is for viewing an entry, not editing it directly
  const viewEntryDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date['toLocaleDateString']('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date['toLocaleTimeString']('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert['alert']('Permission needed', 'We need camera roll permissions to add images to your journal.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setEntryImages([...entryImages, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    const updatedImages = entryImages.filter((_, i) => i !== index);
    setEntryImages(updatedImages);
  };

  const MoodSelector = ({ onSelect, selected, isEditable = true }) => {
    return (
      <View style={styles.moodSelectorContainer}>
        <Text style={styles.moodSelectorTitle}>How are you feeling?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScrollView}>
          {Object.entries(MOODS).map(([key, mood]) => {
            const isSelected = selected === key;

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.moodOption,
                  isSelected && { backgroundColor: mood.color, borderColor: mood.color }
                ]}
                onPress={() => isEditable && onSelect(key)}
                disabled={!isEditable}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={mood.icon}
                  size={24}
                  color={isSelected ? '#fff' : mood.color}
                />
                <Text style={[
                  styles.moodLabel,
                  isSelected && { color: '#fff' }
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  useEffect(() => {
    loadEntries();
    fetchQuote();
    fetchObjectives();
  }, [date, user]);

  // This useEffect handles the initial opening of the form based on 'openForm' param
  useEffect(() => {
    // Only process if openForm is 'true' and we haven't handled it yet for this component instance
    if (String(openForm).trim() === 'true' && !initialOpenHandled.current) {
        console.log('openForm is true, setting isAddingEntry to true initially.');
        setIsAddingEntry(true);
        initialOpenHandled.current = true; // Mark as handled
    }
  }, [openForm]); // This effect only reacts to changes in openForm

  // This useEffect solely handles the animation based on `isAddingEntry` state
  useEffect(() => {
    console.log('isAddingEntry changed:', isAddingEntry);
    if (isAddingEntry) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAddingEntry, slideAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {isToday ? 'Today' : isPastDate ? 'Past Day' : 'Future Day'}
            </Text>
            <Text style={styles.headerDate}>
              {new Date(date)['toLocaleDateString']('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, showObjectives && styles.activeTab]}
            onPress={() => setShowObjectives(true)}
          >
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={showObjectives ? '#fff' : '#666'}
            />
            <Text style={[styles.tabText, showObjectives && styles.activeTabText]}>
              Objectives
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !showObjectives && styles.activeTab]}
            onPress={() => setShowObjectives(false)}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={20}
              color={!showObjectives ? '#fff' : '#666'}
            />
            <Text style={[styles.tabText, !showObjectives && styles.activeTabText]}>
              Journal
            </Text>
          </TouchableOpacity>
        </View>

        {showObjectives ? (
          // Objectives View
          <View style={styles.objectivesContainer}>
            {/* Quote Section - Only shown for current/future dates */}
            {!isPastDate && (
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteLabel}>Inspiration for Today</Text>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <>
                    <Text style={styles.quote}>"{quote}"</Text>
                    <Text style={styles.author}>― {author}</Text>
                  </>
                )}
              </View>
            )}

            {/* Past Date Notice */}
            {isPastDate && (
              <View style={styles.pastDateNotice}>
                <MaterialCommunityIcons name="information" size={20} color="#FF9500" />
                <Text style={styles.pastDateNoticeText}>
                  You're viewing a past date. You can add objectives you forgot to record.
                </Text>
              </View>
            )}

            {/* Objectives List */}
            {objectives.map((item) => (
              <View key={item.id} style={styles.objectiveItem}>
                <View style={styles.objectiveContent}>
                  {item.addedLater && (
                    <Text style={styles.addedLaterLabel}>Added later</Text>
                  )}
                  <Text style={[
                    styles.objectiveText,
                    item.completed && styles.completedObjectiveText
                  ]}>
                    {item.objective}
                  </Text>
                  <View style={styles.objectiveActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => updateObjective(item.id, item.completed)}
                    >
                      <Text style={styles.actionButtonText}>
                        {item.completed ? 'Undo' : ''}

                      
                      </Text>
                      <MaterialCommunityIcons
                            name="check" // Changed to checkmark icon
                            size={25} // Slightly larger icon size
                            color="purple" // Get color from new style
                          />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => deleteObjective(item.id)}
                    >
                      <Text style={styles.actionButtonText}></Text>
                          
                           <MaterialCommunityIcons
                            name="trash-can-outline" // Trash can icon
                            size={22} // Slightly larger icon size
                            color="#E74C3C"  // Get color from new style
                          />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {objectives.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="target" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  {isPastDate
                    ? 'No objectives were set for this day. Add ones you might have forgotten.'
                    : 'No objectives set for today. Add one to get started!'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Journal View
          <View style={styles.journalContainer}>
            {/* Floating Action Button */}
            {!isAddingEntry && (
              <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsAddingEntry(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            )}

            {/* Entry Form */}
            {isAddingEntry && (
              <Animated.View style={[
                styles.entryForm,
                {
                  transform: [{
                    translateY: slideAnim['interpolate']({
                      inputRange: [0, 1],
                      outputRange: [500, 0]
                    })
                  }]
                }
              ]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.formContent}>
                    <View style={styles.formHeader}>
                      <Text style={styles.formTitle}>
                        {isEditing ? 'Edit Entry' : 'New Entry'}
                      </Text>
                      <TouchableOpacity
                        onPress={resetForm}
                        style={styles.closeButton}
                      >
                        <MaterialCommunityIcons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <MoodSelector onSelect={setSelectedMood} selected={selectedMood} />

                    <TextInput
                      style={styles.entryTextInput}
                      placeholder="What's on your mind today?"
                      value={entryText}
                      onChangeText={setEntryText}
                      multiline
                      placeholderTextColor="#999"
                    />

                    {/* Image Section */}
                    <View style={styles.imageSection}>
                      <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={pickImage}
                      >
                        <MaterialCommunityIcons name="camera-plus" size={20} color="#007AFF" />
                        <Text style={styles.addImageText}>Add Photos</Text>
                      </TouchableOpacity>

                      {entryImages.length > 0 && (
                        <ScrollView horizontal style={styles.imagePreviewContainer}>
                          {entryImages.map((image, index) => (
                            <View key={index} style={styles.imagePreview}>
                              <Image source={{ uri: image.uri }} style={styles.previewImage} />
                              <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeImage(index)}
                              >
                                <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.formActions}>
                      <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={saveEntry}
                        disabled={loading}
                      >
                        <Text style={styles.saveButtonText}>
                          {loading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Animated.View>
            )}

            {/* Entries List */}
            <View style={styles.entriesContainer}>
              {entries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTime}>
                      {formatTime(entry.createdAt)}
                    </Text>
                    <View style={styles.entryActions}>
                      {/* Edit button in main list now directly opens the form */}
                      <TouchableOpacity
                        onPress={() => editEntry(entry)}
                        style={styles.editButton}
                      >
                        <MaterialCommunityIcons name="pencil" size={16} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteEntry(entry.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons name="delete" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Clicking the entry card now only opens the view modal */}
                  <TouchableOpacity
                    onPress={() => viewEntryDetails(entry)}
                    activeOpacity={0.9}
                    style={styles.entryContent}
                  >
                    <View style={styles.entryMood}>
                      <MaterialCommunityIcons
                        name={MOODS[entry.mood].icon}
                        size={20}
                        color={MOODS[entry.mood].color}
                      />
                      <Text style={[styles.entryMoodText, { color: MOODS[entry.mood].color }]}>
                        {MOODS[entry.mood].label}
                      </Text>
                    </View>

                    <Text style={styles.entryText} numberOfLines={3}>
                      {entry.text}
                    </Text>

                    {entry.images && entry.images.length > 0 && (
                      <View style={styles.entryImageIndicator}>
                        <MaterialCommunityIcons name="image" size={16} color="#666" />
                        <Text style={styles.imageCountText}>
                          {entry.images.length} photo{entry.images.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}

              {entries.length === 0 && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>
                    No journal entries for this day. Tap the + button to add your first entry!
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Add Objective Button - Only shown when on objectives tab */}
        {showObjectives && (
          <View style={styles.addObjectiveButtonContainer}>
            <TouchableOpacity
              style={styles.addObjectiveButton}
              onPress={() => setAddObjectiveModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addObjectiveButtonText}>
                {isPastDate ? 'Add Past Objective' : 'Add Objective'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Objective Modal */}
        <Modal
          visible={addObjectiveModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isPastDate ? 'Add Past Objective' : 'New Objective'}
              </Text>
              <TextInput
                style={styles.objectiveInput}
                placeholder="Enter your objective..."
                value={newObjective}
                onChangeText={setNewObjective}
                multiline
                placeholderTextColor="#999"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setAddObjectiveModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={addObjective}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Entry View Modal */}
        <Modal
          visible={!!selectedEntry}
          transparent={true}
          animationType="slide"
        >
          {selectedEntry && (
            <View style={styles.modalOverlay}>
              <View style={styles.entryViewModal}>
                <View style={styles.entryViewHeader}>
                  <Text style={styles.entryViewDate}>
                    {formatDate(selectedEntry.date)}
                  </Text>
                  <View style={styles.entryViewActions}>
                    {/* Edit button inside view modal now calls editEntry directly */}
                    <TouchableOpacity
                      onPress={() => {
                        editEntry(selectedEntry);
                      }}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteEntry(selectedEntry.id)}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSelectedEntry(null)}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView style={styles.entryViewContent}>
                  <View style={styles.entryViewMood}>
                    <MaterialCommunityIcons
                      name={MOODS[selectedEntry.mood].icon}
                      size={24}
                      color={MOODS[selectedEntry.mood].color}
                    />
                    <Text style={[styles.entryViewMoodText, { color: MOODS[selectedEntry.mood].color }]}>
                      {MOODS[selectedEntry.mood].label}
                    </Text>
                  </View>

                  <Text style={styles.entryViewText}>{selectedEntry.text}</Text>

                  {selectedEntry.images && selectedEntry.images.length > 0 && (
                    <ScrollView horizontal style={styles.entryViewImages}>
                      {selectedEntry.images.map((image, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setSelectedImage(image.uri);
                            setImageViewerVisible(true);
                          }}
                        >
                          <Image
                            source={{ uri: image.uri }}
                            style={styles.entryViewImage}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                  {/* Image Viewer Modal */}
                  <Modal
                    visible={imageViewerVisible}
                    transparent={true}
                    animationType="fade"
                  >
                    <View style={styles.imageViewerOverlay}>
                      <TouchableOpacity
                        style={styles.imageViewerClose}
                        onPress={() => setImageViewerVisible(false)}
                      >
                        <MaterialCommunityIcons name="close" size={30} color="#fff" />
                      </TouchableOpacity>
                      {selectedImage && (
                        <Image
                          source={{ uri: selectedImage }}
                          style={styles.fullScreenImage}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  </Modal>
                </ScrollView>
              </View>
            </View>
          )}
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
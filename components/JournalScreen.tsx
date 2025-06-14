import CryptoJS from 'crypto-js';
import React, { useState, useEffect, useRef } from 'react';
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
import { db } from '../firebaseConfig'; // Adjust path as needed
import { getAuth, User } from 'firebase/auth'; // Import User type
import { MOODS } from '../constants/moods'; // Adjust path as needed
import styles from '../app/styles/specific-day.styles'; // Re-use or adapt styles
import { getEncryptionKey } from '../app/utils/encryption'; // (keep this)

const { width } = Dimensions.get('window');

interface JournalScreenProps {
  date: string;
  user: User | null; // Pass the authenticated user
  openFormInitially: boolean; // Prop to indicate if the form should be open on mount
}

interface JournalEntry {
  id: string;
  text: string;
  images: { uri: string }[];
  mood: string;
  date: string;
  createdAt: Date;
}

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


export default function JournalScreen({ date, user, openFormInitially }: JournalScreenProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(openFormInitially);
  const [entryText, setEntryText] = useState('');
  const [entryImages, setEntryImages] = useState<{ uri: string }[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const slideAnim = useRef(new Animated.Value(openFormInitially ? 1 : 0)).current;
  
  useEffect(() => {
    (async () => {
      const key = await getEncryptionKey();
      setEncryptionKey(key);
      })();
    }, []);
console.log('Current encryptionKey:', encryptionKey);

  const decryptData = (encryptedData) => {
    if (!encryptionKey) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  };
console.log('Current encryptionKey:', encryptionKey);

  const encryptData = (data) => {
    if (!encryptionKey) return null;
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  };

  const loadEntries = async () => {
    if (!user || !encryptionKey) return;


    try {
      setLoading(true);
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const loadedEntries: JournalEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent || data.cryptedContent);

        if (decryptedData) {
          const entryDateString = new Date(decryptedData.date).toISOString().split('T')[0];
          const selectedDateString = new Date(date).toISOString().split('T')[0];

          if (entryDateString === selectedDateString) {
            loadedEntries.push({
              id: doc.id,
              ...decryptedData,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
            });
          }
        }
      });

      loadedEntries.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setEntries(loadedEntries);

    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (entryText.trim() === '' && entryImages.length === 0) {
      Alert.alert('Empty Entry', 'Please add some content to your journal entry.');
      return;
    }

    if (!selectedMood) {
      Alert.alert('Mood Required', 'Please select how you\'re feeling today.');
      return;
    }

    try {
      setLoading(true);

      const entryData = {
        text: entryText,
        images: entryImages,
        mood: selectedMood,
        date: new Date(date).toISOString()
      };

      const encryptedContent = encryptData(entryData);

      if (isEditing && editingEntryId) {
        const docRef = doc(db, 'journal_entries', editingEntryId);
        await updateDoc(docRef, {
          encryptedContent: encryptedContent,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'journal_entries'), {
          userId: user?.uid,
          encryptedContent: encryptedContent,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      resetForm();
      await loadEntries();

    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEntryText('');
    setEntryImages([]);
    setSelectedMood(null);
    setSelectedEntry(null);
    setIsAddingEntry(false);
    setIsEditing(false);
    setEditingEntryId(null);
  };

  const editEntry = (entry: JournalEntry) => {
    setEntryText(entry.text);
    setEntryImages(entry.images || []);
    setSelectedMood(entry.mood);
    setEditingEntryId(entry.id);
    setIsEditing(true);
    setIsAddingEntry(true);
    setSelectedEntry(null);
  };

  const deleteEntry = (entryId: string) => {
    Alert.alert(
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
              setSelectedEntry(null);
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete the entry. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const viewEntryDetails = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const formatTime = (dateString: string | Date) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add images to your journal.');
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

  const removeImage = (index: number) => {
    const updatedImages = entryImages.filter((_, i) => i !== index);
    setEntryImages(updatedImages);
  };
  useEffect(() => {
  if (user && encryptionKey) {
    loadEntries();
  }
  }, [date, user, encryptionKey]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isAddingEntry ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isAddingEntry, slideAnim]);

  return (
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
              translateY: slideAnim.interpolate({
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
                  {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <View style={styles.entryViewActions}>
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
    </View>
  );
}
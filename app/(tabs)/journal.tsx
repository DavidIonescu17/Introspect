import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  TextInput,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOODS = {
  veryHappy: {
    icon: 'emoticon-excited-outline',
    label: 'Very Happy',
    color: '#FFD93D'
  },
  happy: {
    icon: 'emoticon-happy-outline',
    label: 'Happy',
    color: '#4CAF50'
  },
  neutral: {
    icon: 'emoticon-neutral-outline',
    label: 'Meh',
    color: '#92beb5'
  },
  sad: {
    icon: 'emoticon-sad-outline',
    label: 'Sad',
    color: '#7286D3'
  },
  verySad: {
    icon: 'emoticon-cry-outline',
    label: 'Very Sad',
    color: '#b44560'
  }
};

const JournalScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [entries, setEntries] = useState([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [entryText, setEntryText] = useState('');
  const [entryImages, setEntryImages] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Load existing entries and streak
    loadEntries();
    loadStreak();

    return () => clearInterval(timer);
  }, []);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('journalEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading entries', error);
    }
  };

  const loadStreak = async () => {
    try {
      const storedStreak = await AsyncStorage.getItem('journalStreak');
      const lastJournalDate = await AsyncStorage.getItem('lastJournalDate');
      
      if (storedStreak && lastJournalDate) {
        const today = new Date().toDateString();
        const lastDate = new Date(lastJournalDate).toDateString();
        
        if (today === lastDate) {
          setStreak(parseInt(storedStreak));
        }
      }
    } catch (error) {
      console.error('Error loading streak', error);
    }
  };

  const MoodSelector = ({ onSelect, selected, isEditable = true }) => {
    return (
      <View style={styles.moodSelector}>
        {Object.entries(MOODS).map(([key, mood]) => {
          const isSelected = selected === key;
  
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.moodButton,
                isSelected && { backgroundColor: mood.color + '30' }, // Highlight selected mood
              ]}
              onPress={() => isEditable && onSelect(key)}
              disabled={!isEditable}
            >
              <MaterialCommunityIcons
                name={mood.icon}
                size={32}
                color={isSelected ? mood.color : '#999'} // Dim the icon if not selected
              />
              <Text
                style={[
                  styles.moodLabel,
                  { color: isSelected ? mood.color : '#999' }, // Dim the text if not selected
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setEntryImages([...entryImages, ...result.assets]);
    }
  };

  const saveEntry = async () => {
    if (entryText.trim() === '' && entryImages.length === 0) {
      alert('Please add some content to your entry');
      return;
    }

    const newEntry = {
      id: selectedEntry ? selectedEntry.id : Date.now(),
      text: entryText,
      images: entryImages,
      date: new Date().toISOString(),
      mood: selectedMood || 'neutral' 
    };
    let updatedEntries;

  if (selectedEntry) {
    // Dacă este o editare, înlocuiește intrarea existentă
    updatedEntries = entries.map((entry) =>
      entry.id === selectedEntry.id ? newEntry : entry
    );
  } else {
    // Dacă este o nouă intrare, adaug-o la început
    updatedEntries = [newEntry, ...entries];
  }

    try {
      // Save entries
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      
      // Update streak
      const lastJournalDate = await AsyncStorage.getItem('lastJournalDate');
      const today = new Date().toDateString();
      let newStreak = 1;

      if (lastJournalDate) {
        const lastDate = new Date(lastJournalDate);
        const dayDifference = (new Date(today) - lastDate) / (1000 * 60 * 60 * 24);
        
        if (dayDifference === 1) {
          const storedStreak = await AsyncStorage.getItem('journalStreak');
          newStreak = parseInt(storedStreak || '0') + 1;
        }
      }

      await AsyncStorage.setItem('journalStreak', newStreak.toString());
      await AsyncStorage.setItem('lastJournalDate', today);

      // Update state
      setEntries(updatedEntries);
      setStreak(newStreak);
      setEntryText('');
      setEntryImages([]);
      setSelectedMood(null);
      setSelectedEntry(null);
      setIsAddingEntry(false);
    } catch (error) {
      console.error('Error saving entry', error);
    }
  };

  const editEntry = (entry) => {
    setEntryText(entry.text);
    setEntryImages(entry.images);
    setSelectedMood(entry.mood);
    setSelectedEntry(entry);
    setIsAddingEntry(true);
  };

  const deleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(entry => entry.id !== entryId);
              await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
              setEntries(updatedEntries);
            } catch (error) {
              console.error('Error deleting entry', error);
            }
          }
        }
      ]
    );
  };

  const viewEntry = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      {/* Header with Date, Time, and Streak */}
      <View style={styles.header}>
        <Text style={styles.title}>My Journal</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.timeText}>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>Journaling Streak: {streak} days</Text>
        </View>
      </View>

      {/* Add New Entry Section */}
      {isAddingEntry ? (
        <View style={styles.newEntryContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your journal entry here..."
            value={entryText}
            onChangeText={setEntryText}
          />

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerButtonText}>Add Images</Text>
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              style={styles.imageScrollView}
              showsHorizontalScrollIndicator={false}
            >
              {entryImages.map((image, index) => (
                <Image 
                  key={index} 
                  source={{ uri: image.uri }} 
                  style={styles.selectedImage} 
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.moodContainer}>
          <MoodSelector
              onSelect={setSelectedMood}
              selected={selectedMood}
              isEditable={true}
            />
          </View>

          <View style={styles.entryActionButtons}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveEntry}
            >
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setIsAddingEntry(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.newEntryButton}
          onPress={() => setIsAddingEntry(true)}
        >
          <Text style={styles.newEntryButtonText}>New Entry</Text>
        </TouchableOpacity>
      )}

      {/* Entries List */}
      <ScrollView style={styles.entriesContainer}>
        {entries.map((entry) => (
          <TouchableOpacity 
            key={entry.id} 
            style={styles.entryItem}
            onPress={() => viewEntry(entry)}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                {new Date(entry.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} at {new Date(entry.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              <View style={styles.entryActions}>
                <TouchableOpacity onPress={() => editEntry(entry)}>
                  <Text style={styles.entryActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                  <Text style={styles.entryActionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <MoodSelector
                onSelect={() => {}}
                selected={entry.mood}
                isEditable={false}
              />
            <Text numberOfLines={2} style={styles.entryPreview}>
              {entry.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Entry View Modal */}
      <Modal
        visible={selectedEntry !== null}
        animationType="slide"
        transparent={true}
      >
        {selectedEntry && (
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDate}>
                {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
                  
              <Text style={styles.modalText}>{selectedEntry.text}</Text>
              
              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <ScrollView 
                  horizontal 
                  style={styles.modalImageScroll}
                  showsHorizontalScrollIndicator={false}
                >
                  {selectedEntry.images.map((image, index) => (
                    <Image 
                      key={index} 
                      source={{ uri: image.uri }} 
                      style={styles.modalImage} 
                    />
                  ))}
                </ScrollView>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setSelectedEntry(null)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:100,
    flex: 1,
    backgroundColor: '#',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  timeContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakContainer: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newEntryButton: {
    backgroundColor: '#8a4fff',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newEntryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newEntryContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    marginBottom: 16,
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  imagePickerButton: {
    backgroundColor: '#8a4fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageScrollView: {
    maxHeight: 150,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
  },
  moodEmoji: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  moodEmojiImage: {
    width: 32,
    height: 32,
  },
  moodEmojiText: {
    fontSize: 14,
    marginTop: 4
  },
  entryActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#8a4fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#8a4fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  entriesContainer: {
    flex: 1,
    padding: 16,
  },
  entryItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  entryActions: {
    flexDirection: 'row',
  },
  entryActionText: {
    fontSize: 14,
    color: '#8a4fff',
    marginLeft: 8,
  },
  entryPreview: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
  },
  modalImageScroll: {
    marginBottom: 16,
  },
  modalImage: {
    width: 200,
    height: 200,
    marginRight: 10,
    borderRadius: 8,
  },
  closeModalButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  moodButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    width: '18%',
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    backgroundColor: '#F5F6FA',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  });
  
  export default JournalScreen;
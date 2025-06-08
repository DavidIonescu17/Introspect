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
  Keyboard,
  Animated,
  Dimensions
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

import { db, auth } from '../../firebaseConfig'; // Adjust path as needed

// Encryption key - In production, generate this securely and store it properly
const ENCRYPTION_KEY = 'ezYxGHuBw5W5jKewAnJsmie52Ge14WCzk+mIW8IFD6gzl/ubFlHjGan+LbcJ2M1m'; // Use a 32-character key

const { width } = Dimensions.get('window');
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
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entriesByDate, setEntriesByDate] = useState(new Map());
  
  const currentUser = auth.currentUser;

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Load existing entries and streak
    loadEntries();
    calculateStreak();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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
  }, [isAddingEntry]);

  useEffect(() => {
    // Group entries by date when entries change
    groupEntriesByDate();
  }, [entries]);

  const groupEntriesByDate = () => {
    const grouped = new Map();
    entries.forEach(entry => {
      const dateKey = new Date(entry.date).toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey).push(entry);
    });
    setEntriesByDate(grouped);
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedEntries = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedData = decryptData(data.encryptedContent);
        if (decryptedData) {
          loadedEntries.push({
            id: doc.id,
            ...decryptedData,
            createdAt: data.createdAt
          });
        }
      });
      
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async () => {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      let currentStreak = 0;
      let checkDate = new Date(startOfToday);
      
      const entriesByDate = new Map();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const entryDate = new Date(data.createdAt.seconds * 1000);
        const dateKey = entryDate.toDateString();
        if (!entriesByDate.has(dateKey)) {
          entriesByDate.set(dateKey, true);
        }
      });
      
      // Check consecutive days starting from today
      while (true) {
        const dateKey = checkDate.toDateString();
        if (entriesByDate.has(dateKey)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (checkDate.toDateString() === startOfToday.toDateString()) {
          // No entry today, but check yesterday
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const MoodSelector = ({ onSelect, selected, isEditable = true }) => {
    return (
      <View style={styles.moodSelector}>
        <Text style={styles.moodSelectorTitle}>How are you feeling?</Text>
        <View style={styles.moodButtonsContainer}>
          {Object.entries(MOODS).map(([key, mood]) => {
            const isSelected = selected === key;
            
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.moodButton,
                  isSelected && { 
                    backgroundColor: mood.color + '20',
                    borderColor: mood.color,
                    borderWidth: 2,
                    transform: [{ scale: 1.1 }]
                  }
                ]}
                onPress={() => isEditable && onSelect(key)}
                disabled={!isEditable}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={mood.icon}
                  size={28}
                  color={isSelected ? mood.color : '#999'}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    { color: isSelected ? mood.color : '#999' }
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
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

  const removeImage = (index) => {
    const updatedImages = entryImages.filter((_, i) => i !== index);
    setEntryImages(updatedImages);
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
        date: new Date().toISOString()
      };

      const encryptedContent = encryptData(entryData);

      if (isEditing && selectedEntry) {
        // Update existing entry
        const docRef = doc(db, 'journal_entries', selectedEntry.id);
        await updateDoc(docRef, {
          encryptedContent: encryptedContent,
          updatedAt: new Date()
        });
      } else {
        // Add new entry
        await addDoc(collection(db, 'journal_entries'), {
          userId: currentUser?.uid,
          encryptedContent: encryptedContent,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Reset form
      resetForm();
      
      // Reload entries and recalculate streak
      await loadEntries();
      await calculateStreak();
      
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
  };

  const editEntry = (entry) => {
    setEntryText(entry.text);
    setEntryImages(entry.images || []);
    setSelectedMood(entry.mood);
    setSelectedEntry(entry);
    setIsEditing(true);
    setIsAddingEntry(true);
  };

  const deleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'journal_entries', entryId));
              await loadEntries();
              await calculateStreak();
              setSelectedEntry(null); // Close modal if open
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

  const viewEntry = (entry) => {
    setSelectedEntry(entry);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calendar Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMoodForDate = (date) => {
    const dateKey = date.toDateString();
    const dayEntries = entriesByDate.get(dateKey);
    if (!dayEntries || dayEntries.length === 0) return null;
    
    // Return the most recent mood for that day
    return dayEntries[0].mood;
  };

  const getEntriesForDate = (date) => {
    const dateKey = date.toDateString();
    return entriesByDate.get(dateKey) || [];
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const CalendarView = () => {
    const days = getDaysInMonth(currentMonth);
    const monthYear = currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>{monthYear}</Text>
          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWeekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (!day) {
              return <View key={index} style={styles.emptyCalendarDay} />;
            }

            const mood = getMoodForDate(day);
            const dayEntries = getEntriesForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  isToday && styles.todayCalendarDay,
                  isSelected && styles.selectedCalendarDay,
                  mood && { backgroundColor: MOODS[mood].color + '20' }
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[
                  styles.calendarDayText,
                  isToday && styles.todayText,
                  isSelected && styles.selectedDayText
                ]}>
                  {day.getDate()}
                </Text>
                {mood && (
                  <MaterialCommunityIcons
                    name={MOODS[mood].icon}
                    size={12}
                    color={MOODS[mood].color}
                    style={styles.calendarMoodIcon}
                  />
                )}
                {dayEntries.length > 1 && (
                  <View style={styles.multipleEntriesIndicator}>
                    <Text style={styles.entriesCount}>{dayEntries.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const DayEntriesView = () => {
    if (!selectedDate) return null;

    const dayEntries = getEntriesForDate(selectedDate);
    const dateString = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <View style={styles.dayEntriesContainer}>
        <Text style={styles.dayEntriesTitle}>{dateString}</Text>
        {dayEntries.length === 0 ? (
          <Text style={styles.noEntriesText}>No entries for this day</Text>
        ) : (
          <ScrollView style={styles.dayEntriesScroll}>
            {dayEntries.map((entry) => (
              <TouchableOpacity 
                key={entry.id} 
                style={styles.dayEntryCard}
                onPress={() => viewEntry(entry)}
              >
                <View style={styles.dayEntryHeader}>
                  <View style={styles.dayEntryMood}>
                    <MaterialCommunityIcons
                      name={MOODS[entry.mood].icon}
                      size={16}
                      color={MOODS[entry.mood].color}
                    />
                    <Text style={[styles.dayEntryMoodText, { color: MOODS[entry.mood].color }]}>
                      {MOODS[entry.mood].label}
                    </Text>
                  </View>
                  <Text style={styles.dayEntryTime}>{formatTime(entry.date)}</Text>
                </View>
                <Text numberOfLines={2} style={styles.dayEntryPreview}>
                  {entry.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>Capture your thoughts</Text>
          </View>
          
          <View style={styles.headerControls}>
            <TouchableOpacity 
              style={styles.calendarToggle}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <MaterialCommunityIcons 
                name={showCalendar ? "format-list-bulleted" : "calendar"} 
                size={20} 
                color="#8A4FFF" 
              />
            </TouchableOpacity>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
                <Text style={styles.statNumber}>{streak}</Text>
                <Text style={styles.statLabel}>day streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#4ECDC4" />
                <Text style={styles.statNumber}>{entries.length}</Text>
                <Text style={styles.statLabel}>entries</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Floating Action Button */}
        {!isAddingEntry && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => setIsAddingEntry(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Modern Entry Form */}
        {isAddingEntry && (
          <Animated.View 
            style={[
              styles.entryFormContainer,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
                opacity: slideAnim,
              }
            ]}
          >
            <View style={styles.entryForm}>
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

              <TextInput
                style={styles.modernTextInput}
                multiline
                placeholder="What's on your mind today?"
                placeholderTextColor="#999"
                value={entryText}
                onChangeText={setEntryText}
                textAlignVertical="top"
              />

              <MoodSelector
                onSelect={setSelectedMood}
                selected={selectedMood}
                isEditable={true}
              />

              {/* Image Section */}
              <View style={styles.imageSection}>
                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                  <MaterialCommunityIcons name="camera-plus" size={20} color="#8A4FFF" />
                  <Text style={styles.addImageText}>Add Photos</Text>
                </TouchableOpacity>

                {entryImages.length > 0 && (
                  <ScrollView 
                    horizontal 
                    style={styles.imagePreviewContainer}
                    showsHorizontalScrollIndicator={false}
                  >
                    {entryImages.map((image, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <MaterialCommunityIcons name="close-circle" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={saveEntry}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="check" size={20} color="white" />
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Calendar or Entries List */}
        {showCalendar ? (
          <View style={styles.calendarSection}>
            <CalendarView />
            <DayEntriesView />
          </View>
        ) : (
          <ScrollView 
            style={styles.entriesContainer}
            contentContainerStyle={styles.entriesContent}
            showsVerticalScrollIndicator={false}
          >
            {entries.map((entry) => (
              <TouchableOpacity 
                key={entry.id} 
                style={styles.entryCard}
                onPress={() => viewEntry(entry)}
                activeOpacity={0.9}
              >
                <View style={styles.entryCardHeader}>
                  <View style={styles.entryDateContainer}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
                  </View>
                  <View style={styles.entryActions}>
                    <TouchableOpacity 
                      onPress={() => editEntry(entry)}
                      style={styles.editButton}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={18} color="#8A4FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => deleteEntry(entry.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.entryMoodContainer}>
                  <MaterialCommunityIcons
                    name={MOODS[entry.mood].icon}
                    size={20}
                    color={MOODS[entry.mood].color}
                  />
                  <Text style={[styles.entryMoodText, { color: MOODS[entry.mood].color }]}>
                    {MOODS[entry.mood].label}
                  </Text>
                </View>

                <Text numberOfLines={3} style={styles.entryPreview}>
                  {entry.text}
                </Text>

                {entry.images && entry.images.length > 0 && (
                  <View style={styles.entryImageIndicator}>
                    <MaterialCommunityIcons name="image" size={16} color="#999" />
                    <Text style={styles.imageCountText}>{entry.images.length} photo{entry.images.length > 1 ? 's' : ''}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Entry View Modal */}
        <Modal
          visible={selectedEntry !== null}
          animationType="slide"
          transparent={true}
        >
          {selectedEntry && (
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalDate}>
                    {formatDate(selectedEntry.date)}
                  </Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.modalEditButton}
                      onPress={() => {
                        setSelectedEntry(null);
                        editEntry(selectedEntry);
                      }}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={20} color="#8A4FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalDeleteButton}
                      onPress={() => deleteEntry(selectedEntry.id)}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => setSelectedEntry(null)}
                    >
                      <MaterialCommunityIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalMoodContainer}>
                    <MaterialCommunityIcons
                      name={MOODS[selectedEntry.mood].icon}
                      size={24}
                      color={MOODS[selectedEntry.mood].color}
                    />
                    <Text style={[styles.modalMoodText, { color: MOODS[selectedEntry.mood].color }]}>
                      {MOODS[selectedEntry.mood].label}
                    </Text>
                  </View>

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
              </View>
            </View>
          )}
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingVertical: 20,
  },
  headerContent: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'grey',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8A4FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#8A4FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  entryFormContainer: {
    margin: 20,
    marginTop: 10,
  },
  entryForm: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 8,
  },
  modernTextInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  moodSelector: {
    marginBottom: 20,
  },
  moodSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    width: '18%',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  moodLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  imageSection: {
    marginBottom: 20,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8A4FFF',
    borderStyle: 'dashed',
  },
  addImageText: {
    marginLeft: 8,
    color: '#8A4FFF',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#8A4FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  entriesContainer: {
    flex: 1,
  },
  entriesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  entryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryDateContainer: {
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  entryTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  entryMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryMoodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  entryPreview: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2C3E50',
  },
  entryImageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F2F6',
  },
  imageCountText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  modalMoodText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#2C3E50',
    marginBottom: 20,
  },
  modalImageScroll: {
    marginTop: 16,
  },
  modalImage: {
    width: 200,
    height: 200,
    marginRight: 12,
    borderRadius: 16,
  },
  // Header Updates
headerControls: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15,
},

calendarToggle: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#F8F9FA',
  borderWidth: 1,
  borderColor: '#E9ECEF',
},

// Entry Actions (Edit/Delete buttons)
entryActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

editButton: {
  padding: 6,
  borderRadius: 15,
  backgroundColor: '#F8F9FA',
  borderWidth: 1,
  borderColor: '#E9ECEF',
},

deleteButton: {
  padding: 6,
  borderRadius: 15,
  backgroundColor: '#FFF5F5',
  borderWidth: 1,
  borderColor: '#FED7D7',
},

// Modal Actions
modalActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

modalEditButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#F8F9FA',
  borderWidth: 1,
  borderColor: '#E9ECEF',
},

modalDeleteButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#FFF5F5',
  borderWidth: 1,
  borderColor: '#FED7D7',
},

modalCloseButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#F8F9FA',
  borderWidth: 1,
  borderColor: '#E9ECEF',
},

// Calendar Styles
calendarSection: {
  flex: 1,
  backgroundColor: '#FFFFFF',
},

calendarContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  margin: 16,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
},

calendarHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  paddingHorizontal: 8,
},

calendarMonth: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
},

calendarWeekdays: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 12,
  paddingHorizontal: 8,
},

weekdayText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#666',
  textAlign: 'center',
  width: 40,
},

calendarGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
},

calendarDay: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 20,
  marginVertical: 2,
  position: 'relative',
},

emptyCalendarDay: {
  width: 40,
  height: 40,
  marginVertical: 2,
},

todayCalendarDay: {
  backgroundColor: '#8A4FFF',
  shadowColor: '#8A4FFF',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
},

selectedCalendarDay: {
  backgroundColor: '#E9ECEF',
  borderWidth: 2,
  borderColor: '#8A4FFF',
},

calendarDayText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},

todayText: {
  color: '#FFFFFF',
  fontWeight: '600',
},

selectedDayText: {
  color: '#8A4FFF',
  fontWeight: '600',
},

calendarMoodIcon: {
  position: 'absolute',
  top: 2,
  right: 2,
},

multipleEntriesIndicator: {
  position: 'absolute',
  bottom: 2,
  right: 2,
  backgroundColor: '#FF6B6B',
  borderRadius: 6,
  width: 12,
  height: 12,
  justifyContent: 'center',
  alignItems: 'center',
},

entriesCount: {
  fontSize: 8,
  color: '#FFFFFF',
  fontWeight: '600',
},

// Day Entries View
dayEntriesContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  margin: 16,
  marginTop: 8,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
  maxHeight: 300,
},

dayEntriesTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 12,
  textAlign: 'center',
},

noEntriesText: {
  fontSize: 14,
  color: '#999',
  textAlign: 'center',
  fontStyle: 'italic',
  paddingVertical: 20,
},

dayEntriesScroll: {
  flexGrow: 1,
},

dayEntryCard: {
  backgroundColor: '#F8F9FA',
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: '#E9ECEF',
},

dayEntryHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
},

dayEntryMood: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},

dayEntryMoodText: {
  fontSize: 12,
  fontWeight: '500',
},

dayEntryTime: {
  fontSize: 12,
  color: '#666',
  fontWeight: '500',
},

dayEntryPreview: {
  fontSize: 13,
  color: '#333',
  lineHeight: 18,
}
});

export default JournalScreen;
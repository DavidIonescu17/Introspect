import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const [name, setName] = useState('John Doe');
  const [isEditingName, setIsEditingName] = useState(false);
  const [image, setImage] = useState(null);
  const [mood, setMood] = useState('Calm');
  const [journalStreak, setJournalStreak] = useState(7);
  const [mindfulMinutes, setMindfulMinutes] = useState(120);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    journalReminders: true,
    meditationReminders: true,
    weeklyInsights: true,
  });

  // Animation values
  const scaleAnim = new Animated.Value(1);
  
  const moods = ['Calm', 'Anxious', 'Happy', 'Sad', 'Energetic', 'Tired'];
  const themes = ['light', 'dark', 'nature', 'ocean'];

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      animatePhotoUpdate();
      setImage(result.assets[0].uri);
    }
  };

  const animatePhotoUpdate = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const renderMoodSelector = () => (
    <View style={styles.moodContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {moods.map((moodOption) => (
          <TouchableOpacity
            key={moodOption}
            style={[
              styles.moodButton,
              mood === moodOption && styles.selectedMoodButton,
            ]}
            onPress={() => setMood(moodOption)}
          >
            <Text style={[
              styles.moodText,
              mood === moodOption && styles.selectedMoodText
            ]}>
              {moodOption}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProgressSection = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Journal Streak</Text>
        <Text style={styles.progressValue}>{journalStreak} days</Text>
      </View>
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Mindful Minutes</Text>
        <Text style={styles.progressValue}>{mindfulMinutes} min</Text>
      </View>
    </View>
  );

  const renderThemeSelector = () => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>App Theme</Text>
      <View style={styles.themeContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme}
            style={[
              styles.themeButton,
              selectedTheme === theme && styles.selectedThemeButton,
            ]}
            onPress={() => setSelectedTheme(theme)}
          >
            <Text style={styles.themeText}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Notifications</Text>
      {Object.entries(notifications).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={styles.notificationRow}
          onPress={() => toggleNotification(key)}
        >
          <Text style={styles.notificationText}>
            {key.split(/(?=[A-Z])/).join(' ')}
          </Text>
          <View style={[
            styles.toggle,
            value ? styles.toggleOn : styles.toggleOff,
          ]}>
            <View style={[
              styles.toggleCircle,
              value ? styles.toggleCircleOn : styles.toggleCircleOff,
            ]} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        {/* Profile Content */}
        <View style={styles.profileContent}>
          {/* Profile Photo */}
          <Animated.View style={[
            styles.photoContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <TouchableOpacity onPress={pickImage} style={styles.photoWrapper}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Name Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Name</Text>
              <TouchableOpacity onPress={() => setIsEditingName(!isEditingName)}>
                <Text style={styles.editButton}>✏️</Text>
              </TouchableOpacity>
            </View>
            
            {isEditingName ? (
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.nameInput}
                onBlur={() => setIsEditingName(false)}
                autoFocus
              />
            ) : (
              <Text style={styles.nameText}>{name}</Text>
            )}
          </View>

          {/* Current Mood
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current Mood</Text>
            {renderMoodSelector()}
          </View>

          {/* Progress Section */}
          {/* {renderProgressSection()} */}

          {/* Theme Selector */}
          {/* {renderThemeSelector()} */}

          {/* Notification Settings */}
          {/* {renderNotificationSettings()} */} 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6B4EFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  profileContent: {
    marginTop: -40,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 60,
  },
  photoWrapper: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6B4EFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: {
    fontSize: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  editButton: {
    fontSize: 20,
  },
  nameInput: {
    fontSize: 16,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#6B4EFF',
    paddingVertical: 4,
  },
  nameText: {
    fontSize: 16,
    color: '#111827',
  },
  moodContainer: {
    marginTop: 8,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedMoodButton: {
    backgroundColor: '#6B4EFF',
  },
  moodText: {
    color: '#4B5563',
    fontSize: 14,
  },
  selectedMoodText: {
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4EFF',
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedThemeButton: {
    backgroundColor: '#6B4EFF',
  },
  themeText: {
    color: '#4B5563',
    fontSize: 14,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationText: {
    fontSize: 14,
    color: '#4B5563',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: '#6B4EFF',
  },
  toggleOff: {
    backgroundColor: '#E5E7EB',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleOn: {
    transform: [{ translateX: 22 }],
  },
  toggleCircleOff: {
    transform: [{ translateX: 0 }],
  },
});

export default ProfileScreen;
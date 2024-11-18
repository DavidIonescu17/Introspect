import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Modal, TextInput, Button, ScrollView } from 'react-native';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import Toast from 'react-native-toast-message';

export default function TabOneScreen() {
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [mood, setMood] = useState(null);

  const handleDayPress = (day) => {
    //you cannot modify something thats in the future
    console.log(new Date());
    console.log(new Date(day.dateString));
    if (new Date(day.dateString) > new Date()){
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You cannot modify future dates',
      });
      return;
    }
    setSelectedDay(day.dateString);
    setModalVisible(true);
    setMoodModalVisible(true); // Show mood modal when selecting a day
  };

  const handleAddEvent = () => {
    if (newEvent.trim()) {
      setEvents((prevEvents) => ({
        ...prevEvents,
        [selectedDay]: [...(prevEvents[selectedDay] || []), newEvent],
      }));
      setNewEvent('');
      setModalVisible(false);
    }
  };

  const handleMoodChange = (emoji) => {
    setMood(emoji); // Store the selected emoji for mood
    setMoodModalVisible(false); // Close the mood modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Introspect!</Text>
      <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>

      <Calendar
        onDayPress={handleDayPress}
        style={styles.calendar}
        markedDates={{
          ...Object.keys(events).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: 'blue' };
            return acc;
          }, {}),
          ...(mood && selectedDay
            ? { [selectedDay]: { marked: true, dotColor: 'green', customStyles: { textStyle: { fontWeight: 'bold' } } } }
            : {}),
        }}
        theme={{
          todayTextColor: 'red',
          arrowColor: 'blue',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          textDayFontFamily: 'monospace',
          textMonthFontFamily: 'monospace',
          textDayHeaderFontFamily: 'monospace',
        }}
      />

      {/* Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Event for {selectedDay}</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Description"
              value={newEvent}
              onChangeText={setNewEvent}
            />
            <Button title="Add Event" onPress={handleAddEvent} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <ScrollView style={styles.eventList}>
              {events[selectedDay] && events[selectedDay].map((event, index) => (
                <Text key={index} style={styles.eventText}>{event}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Mood Modal */}
      <Modal visible={moodModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>How are you?</Text>
            <View style={styles.moodContainer}>
              <TouchableOpacity onPress={() => handleMoodChange('😊')}>
                <Text style={styles.emoji}>😊</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMoodChange('😐')}>
                <Text style={styles.emoji}>😐</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMoodChange('😞')}>
                <Text style={styles.emoji}>😞</Text>
              </TouchableOpacity>
            </View>
            {mood && <Text style={styles.selectedMood}>You are feeling: {mood}</Text>}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  calendar: {
    width: 350, // Make the calendar take the full width of the screen
    height: 500, // Increase the height of the calendar
    marginTop: 20, // Add some margin to the top
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffc4c4',
    marginTop: 130,
    marginBottom: 40,
  },
  button: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: '30%',
    backgroundColor: "#84ccec",
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#84ccec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  eventList: {
    marginTop: 10,
    width: '100%',
  },
  eventText: {
    fontSize: 14,
    color: '#333',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 30,
  },
  selectedMood: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 10,
  },
});

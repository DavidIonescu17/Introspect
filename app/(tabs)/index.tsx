import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Modal, TextInput, Button, ScrollView } from 'react-native';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';

// Function to generate the days of the month based on the month and year
const generateCalendar = (month, year) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get the number of days in the month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Get the starting day of the month (0 = Sunday, 6 = Saturday)

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty slot before the first day
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i); // Add the actual days
  }
  return days;
};

export default function TabOneScreen() {
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [mood, setMood] = useState(null);

  useEffect(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const days = generateCalendar(month, year);
    setCalendarDays(days);
  }, [currentDate]);

  const handleDayPress = (day) => {
    if (day) {
      setSelectedDay(day);
      setModalVisible(true);
      setMoodModalVisible(true);  // Show mood prompt when a day is selected
    }
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
    setMood(emoji);  // Store the selected emoji for mood
    setMoodModalVisible(false);  // Close the mood modal
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const today = currentDate.getDate(); // Get today's date

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Introspect!</Text>
      <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.monthYear}>{`${monthName} ${year}`}</Text>

      <ScrollView style={styles.calendar}>
        <View style={styles.header}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={styles.headerText}>{day}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.day,
                day === null && styles.emptyDay,
                day === today && styles.todayDay // Apply different style for today
              ]}
              onPress={() => handleDayPress(day)}
            >
              <Text style={[
                styles.dayText, 
                day === null && styles.emptyDayText, 
                day === today && styles.todayText // Apply different text color for today
              ]}>
                {day || ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Event for Day {selectedDay}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffc4c4',
    marginBottom: 150,
  },
  button: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: '30%',
    backgroundColor: '#84ccec',
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
  monthYear: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  calendar: {
    width: '90%',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: '14%',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Ensure proper alignment under the header
  },
  day: {
    width: '14%',
    padding: 10,
    margin: 5,
    backgroundColor: '#84ccec',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  emptyDayText: {
    color: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  todayDay: {
    backgroundColor: '#ff6347', // Highlight today's day
  },
  todayText: {
    color: '#fff',
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

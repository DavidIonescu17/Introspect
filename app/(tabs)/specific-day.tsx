import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SpecificDay() {
  const router = useRouter();
  const { date } = useLocalSearchParams(); // Primesc data selectată prin parametri
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');
  const [addEventModalVisible, setAddEventModalVisible] = useState(false); // Controlează afișarea popup-ului Add Event
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [moods, setMoods] = useState({}); // Obiect care stochează mood pentru fiecare zi

  const handleAddEvent = () => {
    if (newEvent.trim()) {
      setEvents((prevEvents) => ({
        ...prevEvents,
        [date]: [...(prevEvents[date] || []), newEvent],
      }));
      setNewEvent('');
      setAddEventModalVisible(false); // Închide modalul după salvare
    }
  };

  const handleMoodChange = (emoji) => {
    setMoods((prevMoods) => ({
      ...prevMoods,
      [date]: emoji, // Asociază emoji-ul cu data selectată
    }));
    setMoodModalVisible(false); // Închide modalul
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events for {date}</Text>

      {/* Lista de evenimente */}
      <ScrollView style={styles.eventList}>
        {events[date] && events[date].length > 0 ? (
          events[date].map((event, index) => (
            <Text key={index} style={styles.eventText}>{`• ${event}`}</Text>
          ))
        ) : (
          <Text style={styles.noEventsText}>No events for this day.</Text>
        )}
      </ScrollView>

      {/* Butoane principale */}
      <View style={styles.buttonContainer}>
        <Button
          title="Add New Event"
          onPress={() => setAddEventModalVisible(true)}
        />
        <View style={styles.spacer} />
        <Button
          title="Select Mood"
          onPress={() => setMoodModalVisible(true)}
        />
        <View style={styles.spacer} />
        <Button
          title="Back to Calendar"
          onPress={() => router.push('/')}
        />
      </View>

      {/* Mood afișat pentru ziua selectată */}
      {moods[date] && <Text style={styles.selectedMood}>You are feeling: {moods[date]}</Text>}

      {/* Modal pentru adăugare eveniment */}
      <Modal visible={addEventModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Event for {date}</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Description"
              value={newEvent}
              onChangeText={setNewEvent}
            />
            <Button title="Save Event" onPress={handleAddEvent} />
            <View style={styles.spacer} />
            <Button title="Cancel" onPress={() => setAddEventModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal pentru starea de spirit */}
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
            <Button title="Close" onPress={() => setMoodModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start', // Aranjează elementele de sus în jos
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 100,
    textAlign: 'center', // Centrare text
  },
  eventList: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
  eventText: {
    fontSize: 18, // Text mai mare pentru evenimente
    color: '#333',
    marginBottom: 10,
  },
  noEventsText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 10, // Spațiu între butoane
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedMood: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
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
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 30,
  },
});

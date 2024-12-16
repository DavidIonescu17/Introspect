import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TextInput, Button, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SpecificDay() {
  const router = useRouter();
  const { date } = useLocalSearchParams(); // Receive selected date via params
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');
  const [addEventModalVisible, setAddEventModalVisible] = useState(false); // Control Add Event modal visibility
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [moods, setMoods] = useState({}); // Object to store moods for each day

  const [quote, setQuote] = useState(''); // State for the quote
  const [author, setAuthor] = useState(''); // State for the quote's author

  // Fetch a motivational quote
  const fetchQuote = async () => {
    const apiUrl = 'https://zenquotes.io/api/random/';
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data.length > 0) {
        setQuote(data[0].q); // Set the quote text
        setAuthor(data[0].a); // Set the author name
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  useEffect(() => {
    fetchQuote(); // Fetch the quote when the component mounts
  }, []);

  
  const handleAddEvent = () => {
    if (newEvent.trim()) {
      setEvents((prevEvents) => ({
        ...prevEvents,
        [date]: [...(prevEvents[date] || []), newEvent],
      }));
      setNewEvent('');
      setAddEventModalVisible(false); // Close modal after saving
    }
  };

  const handleMoodChange = (emoji) => {
    setMoods((prevMoods) => ({
      ...prevMoods,
      [date]: emoji, // Associate emoji with the selected date
    }));
    setMoodModalVisible(false); // Close modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events for {date}</Text>

      {/* Display motivational quote */}
      <Text style={styles.header2}>Quote of the Day</Text>
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>"{quote}"</Text>
        <Text style={styles.author}>- {author}</Text>
      </View>


      {/* Event list */}
      <ScrollView style={styles.eventList}>
        {events[date] && events[date].length > 0 ? (
          events[date].map((event, index) => (
            <Text key={index} style={styles.eventText}>{`• ${event}`}</Text>
          ))
        ) : (
          <Text style={styles.noEventsText}>No events for this day.</Text>
        )}
      </ScrollView>

      {/* Main buttons */}
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

      {/* Display selected mood for the day */}
      {moods[date] && <Text style={styles.selectedMood}>You are feeling: {moods[date]}</Text>}

      {/* Add Event Modal */}
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
    justifyContent: 'flex-start', // Arrange elements from top to bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
    marginTop: 80,
    textAlign: 'center', // Center text
  },
  quoteContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  eventList: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
  eventText: {
    fontSize: 18,
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
    height: 10,
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
  header2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8a4fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  }
});

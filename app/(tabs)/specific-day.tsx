import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Button,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function SpecificDay() {
  const router = useRouter();
  const { date } = useLocalSearchParams(); // Receive the selected date via params
  const [objectives, setObjectives] = useState([]); // State for objectives (tasks)
  const [newObjective, setNewObjective] = useState(''); // Input for new objectives
  const [addObjectiveModalVisible, setAddObjectiveModalVisible] = useState(false); // Modal for adding new objectives
  const [quote, setQuote] = useState(''); // Motivational quote
  const [author, setAuthor] = useState(''); // Author of the quote
  const [currentTime, setCurrentTime] = useState(new Date());

  const auth = getAuth();
  const user = auth.currentUser;
  const objectivesCollection = collection(db, 'objectives');

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

  // Fetch objectives for the selected date
  const fetchObjectives = async () => {
    if (user) {
      const q = query(objectivesCollection, where("userId", "==", user.uid), where("date", "==", date));
      const data = await getDocs(q);
      setObjectives(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } else {
      console.log("No user logged in");
    }
  };

  // Add a new objective
  const addObjective = async () => {
    if (user && newObjective.trim()) {
      await addDoc(objectivesCollection, {
        objective: newObjective,
        completed: false,
        userId: user.uid,
        date: date,
      });
      setNewObjective('');
      setAddObjectiveModalVisible(false); // Close the modal
      fetchObjectives();
    }
  };

  // Update an objective's completion status
  const updateObjective = async (id, completed) => {
    const objectiveDoc = doc(db, 'objectives', id);
    await updateDoc(objectiveDoc, { completed: !completed });
    fetchObjectives();
  };

  // Delete an objective
  const deleteObjective = async (id) => {
    const objectiveDoc = doc(db, 'objectives', id);
    await deleteDoc(objectiveDoc);
    fetchObjectives();
  };

  useEffect(() => {
    fetchQuote(); // Fetch the motivational quote on component mount
    fetchObjectives(); // Fetch objectives for the selected date
  }, [date]);

  return (
    <View style={styles.container}>

      {/* Display the quote of the day */}
      <Text style={styles.header2}>Quote of the Day</Text>
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>"{quote}"</Text>
        <Text style={styles.author}>- {author}</Text>
      </View>
      
      <Text style={styles.title}>Objectives for {currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</Text>
      
      {/* Objectives List */}
      <FlatList
        data={objectives}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.objectiveContainer}>
            <Text
              style={{
                textDecorationLine: item.completed ? 'line-through' : 'none',
                flex: 1,
              }}
            >
              {item.objective}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => updateObjective(item.id, item.completed)}
            >
              <Text style={styles.buttonText}>{item.completed ? 'Undo' : 'Complete'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => deleteObjective(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noObjectivesText}>No objectives for this day.</Text>
        }
      />

      {/* Add Objective Button */}
      <Button
        title="Add New Objective"
        onPress={() => setAddObjectiveModalVisible(true)}
      />

      {/* Add Objective Modal */}
      <Modal visible={addObjectiveModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Objective for {date}</Text>
            <TextInput
              style={styles.input}
              placeholder="Objective Description"
              value={newObjective}
              onChangeText={setNewObjective}
            />
            <Button title="Save Objective" onPress={addObjective} />
            <View style={styles.spacer} />
            <Button
              title="Cancel"
              onPress={() => setAddObjectiveModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      

      {/* Back to Calendar Button */}
      <View style={styles.spacer} />
      <Button title="Back to Calendar" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
  },
  title: {
    marginTop: 60,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  header2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8a4fff',
    textAlign: 'center',
    marginTop: 50
  },
  quoteContainer: {
    marginTop: 5,
    marginBottom: 5,
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
  objectiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  noObjectivesText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#84ccec',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: '#fff',
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
  spacer: {
    height: 20,
  },
});

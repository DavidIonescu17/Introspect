import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export default function TabOneScreen() {
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayPress = (day) => {
    if (new Date(day.dateString) > new Date()) {
      Alert.alert(
        'Error', // Title of the alert
        'You cannot modify future dates', // Message in the alert
        [{ text: 'OK' }] // Button configuration
      );
      return;
    }
    router.push({
      pathname: '/specific-day',
      params: { date: day.dateString }, // Trimite data selectată
    });
  };
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayDate = getTodayDate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Introspect!</Text>
      <Text style={styles.undertitle}>Register your day here</Text>

      <Calendar
        onDayPress={handleDayPress}
        style={styles.calendar}
        markedDates={{
          [todayDate]: {
            selected: true,
            selectedColor: 'mediumslateblue',
            selectedTextColor: 'white',
          },
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              selectedColor: 'blue',
              selectedTextColor: 'white',
            },
          }),
        }}
        theme={{
          todayTextColor: 'purple',
          arrowColor: 'blue',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          textDayFontFamily: 'monospace',
          textMonthFontFamily: 'monospace',
          textDayHeaderFontFamily: 'monospace',
        }}
      />
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
    color: '#6B4EFF',
    marginTop: 130,
    marginBottom: 40,
  },
  undertitle:{
    fontSize: 18,
    fontWeight: '800',
    color: '#6B4EFF',
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: '20%', 
    height: '6%', 
    backgroundColor: "#6B4EFF",
    padding: 10, // Reduced from 20
    borderRadius: 10, // Adjusted to keep proportions
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
    fontSize: 13, 
    fontWeight: '600',
  },

  calendar: {
    width: 350,
    height: 300,
    marginTop: 30,
    marginBottom: 200,
  },
});

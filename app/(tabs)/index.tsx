import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';


export default function TabOneScreen() {
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  const handleDayPress = (day) => {
    if (new Date(day.dateString) > new Date()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You cannot modify future dates',
      });
      return;
    }
    router.push({
      pathname: '/specific-day',
      params: { date: day.dateString }, // Trimite data selectată
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Introspect!</Text>
      <Text style={styles.undertitle}>Register your day here</Text>

      <Calendar
        onDayPress={handleDayPress}
        style={styles.calendar}
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
    color: '#8a4fff',
    marginTop: 130,
    marginBottom: 40,
  },
  undertitle:{
    fontSize: 18,
    fontWeight: '800',
    color: '#8a4fff',
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: '20%', 
    height: '6%', 
    backgroundColor: "#8a4fff",
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

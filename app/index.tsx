import {  Image, ScrollView,Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { auth } from '../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { router, useRouter} from 'expo-router';
import { signOut } from "firebase/auth";
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password)
      if (user) router.replace('/(tabs)');
    } catch (error: any) {
      console.log(error)
      alert('Sign in failed: ' + error.message);
    }
  }

  const signUp = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password)
      if (user) router.replace('/(tabs)');
    } catch (error: any) {
      console.log(error)
      alert('Sign in failed: ' + error.message);
    }
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../assets/images/introspect2.png')} // Path to the image
          style={styles.logo} // Apply styles to the image
        />
        <Text style={styles.title}>Login</Text>
        <TextInput style={styles.textInput} placeholder="email" value={email} onChangeText={setEmail} placeholderTextColor="#85878a" />
        <TextInput style={styles.textInput} placeholder="password" value={password} onChangeText={setPassword} placeholderTextColor="#85878a" secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={signIn}>
          <Text style={styles.text}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={signUp}>
          <Text style={styles.text}>Make Account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA', // A softer white for a modern, minimalist background
  },
  title: {
    fontSize: 28, // A bit larger for a more striking appearance
    fontWeight: '800', // Extra bold for emphasis
    marginBottom: 30, // Increased space for a more airy, open feel
    color: '#ffc4c4', // Soft pink color for the title
    fontFamily: 'Poppins_700Bold',
  },
  logo: {
    width: 300,  // Set width of the logo
    height: 300, // Set height of the logo
    marginBottom: -50, // Add margin to create space from the title
    marginTop: -150,
  },
  textInput: {
    height: 50, // Standard height for elegance and simplicity
    width: '90%', // Full width for a more expansive feel
    backgroundColor: '#FFFFFF', // Pure white for contrast against the container
    borderColor: '#E8EAF6', // A very light indigo border for subtle contrast
    borderWidth: 2,
    borderRadius: 15, // Softly rounded corners for a modern, friendly touch
    marginVertical: 15,
    paddingHorizontal: 25, // Generous padding for ease of text entry
    fontSize: 16, // Comfortable reading size
    color: '#00000', // A dark gray for readability with a hint of warmth
    shadowColor: '#9E9E9E', // A medium gray shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, // Slightly elevated for a subtle 3D effect
  },
  button: {
    width: '90%',
    marginVertical: 15,
    backgroundColor: '#84ccec', // Darker purple for buttons
    padding: 20,
    borderRadius: 15, // Matching rounded corners for consistency
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#84ccec', // Shadow color to match the button for a cohesive look
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF', // Maintained white for clear visibility
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: '600', // Semi-bold for a balanced weight
  }
});


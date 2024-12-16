import { Image, ScrollView, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace('/(tabs)');
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    }
  };

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../assets/images/introspect2.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.textInput}
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#85878a"
        />
        <TextInput
          style={styles.textInput}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#85878a"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={signIn}>
          <Text style={styles.text}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
          <Text style={styles.text}>Sign Up</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default Login;

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
    marginBottom: 30,
    color: '#ffc4c1',
    fontFamily: 'Poppins_700Bold',
    shadowColor: '#606060', // Darker shadow for more contrast
    shadowOffset: { width: 0, height: 2 }, // Increased height for a deeper shadow
    shadowOpacity: 0.2, // Slightly more opaque shadow
    shadowRadius: 0.2,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: -50,
    marginTop: -150,
  },
  textInput: {
    height: 50,
    borderColor: '#ddd', // Subtle border color for a modern look
    borderWidth: 1,
    borderRadius: 8, // Rounded corners for a sleek appearance
    paddingHorizontal: 15, // Add padding for horizontal spacing
    paddingVertical: 12, // Vertical padding for balanced spacing
    marginBottom: 20,
    width: '80%',
    backgroundColor: '#f9f9f9', // Light background for contrast
    fontSize: 16, // Modern font size
    color: '#333', // Subtle text color
    shadowColor: '#000', // Optional shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For shadow on Android
  },
  button: {
    backgroundColor: '#ffc4c4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
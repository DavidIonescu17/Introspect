import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const router = useRouter();

    const signUp = async () => {
        if (password !== repeatPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/(tabs)');
        } catch (error: any) {
            console.log(error);
            alert('Sign up failed: ' + error.message);
        }
    };

    return (
        <NavigationContainer>
            <SafeAreaView style={styles.container}>
                <Image
                    source={require('../assets/images/introspect2.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Sign Up</Text>
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
                <TextInput
                    style={styles.textInput}
                    placeholder="repeat password"
                    value={repeatPassword}
                    onChangeText={setRepeatPassword}
                    placeholderTextColor="#85878a"
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={signUp}>
                    <Text style={styles.text}>Sign Up</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </NavigationContainer>
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
        marginBottom: 30,
        color: '#ffc4c4',
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: -50,
        marginTop: -150,
    },
    textInput: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginBottom: 20,
        width: '80%',
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
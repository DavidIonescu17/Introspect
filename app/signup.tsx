import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

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
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Image
                        source={require('../assets/images/introspect2.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>Create Account</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#9EA0A4"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor="#9EA0A4"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Confirm Password"
                        value={repeatPassword}
                        onChangeText={setRepeatPassword}
                        placeholderTextColor="#9EA0A4"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={signUp}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.secondaryButton} 
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.secondaryButtonText}>Back to Login</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 40,
        color: '#6B46C1',
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
        shadowColor: '#6B46C1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    textInput: {
        height: 56,
        borderColor: '#E2E8F0',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '85%',
        backgroundColor: '#F7FAFC',
        fontSize: 16,
        color: '#2D3748',
        fontFamily: 'Poppins_400Regular',
    },
    primaryButton: {
        backgroundColor: '#6B46C1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        width: '85%',
        shadowColor: '#6B46C1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: '#EDF2F7',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        width: '85%',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins_700Bold',
    },
    secondaryButtonText: {
        color: '#6B46C1',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins_700Bold',
    },
});
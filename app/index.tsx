import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../FirebaseConfig';

const index = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        try{
            const user = await signInWithEmailAndPassword(auth, email, password);
            if(user) router.replace('/(tabs)');
        } catch (error: any) {
            console.log('Error al iniciar sesión : ', error);
            alert('Error al iniciar sesión: ' + error.message);
        }

    }

    const signUp = async () => {
        try{
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if(user) router.replace('/(tabs)');
        } catch (error: any) {
            console.log('Error al iniciar sesión : ', error);
            alert('Error al iniciar sesión: ' + error.message);
        }
        
    }


  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión o crea una cuenta</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.buttonPrimary} onPress={signIn}>
        <Text style={styles.buttonTextPrimary}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={signUp}>
        <Text style={styles.buttonTextSecondary}>Crear cuenta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    gap: 15,
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonPrimary: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonTextPrimary: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSecondary: {
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d4ed8',
  },
  buttonTextSecondary: {
    textAlign: 'center',
    color: '#1d4ed8',
    fontSize: 18,
    fontWeight: '600',
  },
});
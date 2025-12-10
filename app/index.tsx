import {View, Text, TextInput, TouchableOpacity, } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {auth} from '../FirebaseConfig';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import { router } from 'expo-router';

const index = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        try{
            const user = await signInWithEmailAndPassword(auth, email, password);
            if(user) router.replace('/(tabs)');
        } catch (error) {
            console.log('Error al iniciar sesión : ', error);
        }

    }

    const signUp = async () => {
        try{
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if(user) router.replace('/(tabs)');
        } catch (error) {
            console.log('Error al iniciar sesión : ', error);
        }
        
    }


  return (
    <SafeAreaView>
        <Text>Login</Text>
        <TextInput placeholder="email" value={email} onChangeText={setEmail}/>
        <TextInput placeholder="password" value={password} onChangeText={setPassword}/>
        <TouchableOpacity onPress={signIn}>
            <Text>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={signUp}>
            <Text>Registrarse</Text>
        </TouchableOpacity>
    </SafeAreaView>
    );
};

export default index;
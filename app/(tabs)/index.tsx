import { Text, View } from '@/components/Themed';
import { auth } from '@/FirebaseConfig';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function TabOneScreen() {

 getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });
    console.log('auth export:', !!auth);
console.log('auth.currentUser:', auth?.currentUser);

  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cerrar sesión</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={() => {
          console.log("SIGN OUT PRESSED");
          auth.signOut();
        }}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 25,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#e63946',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

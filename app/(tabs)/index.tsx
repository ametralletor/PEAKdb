import { Text, View } from '@/components/Themed';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function TabOneScreen() {


  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Rander</Text>
      <Text>¡Bienvenido a Rander! La mejor app para tus citas.</Text>
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
  logo: {
    width: 300,
    height: 300,
    marginBottom: 0,
    resizeMode: 'contain',
  },
});

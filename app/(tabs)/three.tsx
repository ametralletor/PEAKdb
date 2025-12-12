import { db } from '@/FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Anime = {
  id: string;
  titulo: string;
  image: string;
  tipo: string;
};

export default function LikedAnimes() {
  const [likedAnimes, setLikedAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLikedAnimes = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userLikesRef = doc(db, 'likes', userId);

      try {
        const userLikesSnap = await getDoc(userLikesRef);
        if (userLikesSnap.exists()) {
          const likedAnimesData = userLikesSnap.data().likedAnimes || [];
          setLikedAnimes(likedAnimesData);
        } else {
          console.log('No likes found');
        }
      } catch (e) {
        console.error('Error cargando los likes de Firestore', e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadLikedAnimes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLikedAnimes();
    }, [])
  );

  const removeLike = async (animeId: string) => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userLikesRef = doc(db, 'likes', userId);

      try {
        const userLikesSnap = await getDoc(userLikesRef);
        if (userLikesSnap.exists()) {
          let likedAnimesData = userLikesSnap.data().likedAnimes || [];

          // Filtrar el anime que se va a eliminar
          const updatedLikedAnimes = likedAnimesData.filter((anime: Anime) => anime.id !== animeId);

          // Actualizar la lista de likes en Firestore
          await setDoc(userLikesRef, { likedAnimes: updatedLikedAnimes });

          // Actualizar el estado localmente después de la eliminación
          setLikedAnimes(updatedLikedAnimes);
          console.log('Like eliminado de Firestore:', animeId);
        }
      } catch (e) {
        console.error('Error eliminando el like', e);
      }
    }
  };

  const renderItem = ({ item }: { item: Anime }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.titulo}</Text>
      <Text style={styles.kind}>{item.tipo}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeLike(item.id)}>
        <Text style={styles.removeButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : likedAnimes.length === 0 ? (
        <Text style={styles.noLikesText}>No has dado like a ningún anime aún.</Text>
      ) : (
        <FlatList
          data={likedAnimes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    marginVertical: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 90,
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  kind: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
    marginRight: 20,
  },
  removeButton: {
    backgroundColor: '#e63946',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
  },
  noLikesText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
    marginTop: 20,
  },
});

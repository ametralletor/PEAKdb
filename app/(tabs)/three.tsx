import { db } from '@/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
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
  const [dislikedAnimes, setDislikedAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'likes' | 'dislikes'>('likes');

  const loadLikedAnimes = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userLikesRef = doc(db, 'likes', userId);
      const userDislikesRef = doc(db, 'dislikes', userId);

      try {
        const userLikesSnap = await getDoc(userLikesRef);
        const userDislikesSnap = await getDoc(userDislikesRef);

        if (userLikesSnap.exists()) {
          const likedAnimesData = userLikesSnap.data().likedAnimes || [];
          setLikedAnimes(likedAnimesData);
        }

        if (userDislikesSnap.exists()) {
          const dislikedAnimesData = userDislikesSnap.data().dislikedAnimes || [];
          setDislikedAnimes(dislikedAnimesData);
          console.log('Loaded dislikedAnimes count:', dislikedAnimesData.length);
        }
      } catch (e) {
        console.error('Error cargando likes/dislikes de Firestore', e);
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
          const updatedLikedAnimes = likedAnimesData.filter((anime: Anime) => anime.id !== animeId);
          await setDoc(userLikesRef, { likedAnimes: updatedLikedAnimes });
          setLikedAnimes(updatedLikedAnimes);
          console.log('Like eliminado de Firestore:', animeId);
        }
      } catch (e) {
        console.error('Error eliminando el like', e);
      }
    }
  };

  const removeDislike = async (animeId: string) => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userDislikesRef = doc(db, 'dislikes', userId);

      try {
        const userDislikesSnap = await getDoc(userDislikesRef);
        if (userDislikesSnap.exists()) {
          let dislikedAnimesData = userDislikesSnap.data().dislikedAnimes || [];
          const updatedDislikedAnimes = dislikedAnimesData.filter((anime: Anime) => anime.id !== animeId);
          await setDoc(userDislikesRef, { dislikedAnimes: updatedDislikedAnimes });
          setDislikedAnimes(updatedDislikedAnimes);
          console.log('Dislike eliminado de Firestore:', animeId);
        }
      } catch (e) {
        console.error('Error eliminando el dislike', e);
      }
    }
  };

  const removeAllLikes = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userLikesRef = doc(db, 'likes', userId);

      try {
        await setDoc(userLikesRef, { likedAnimes: [] });
        setLikedAnimes([]);
        console.log('Todos los likes eliminados');
      } catch (e) {
        console.error('Error eliminando todos los likes', e);
      }
    }
  };

  const removeAllDislikes = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userDislikesRef = doc(db, 'dislikes', userId);

      try {
        await setDoc(userDislikesRef, { dislikedAnimes: [] });
        setDislikedAnimes([]);
        console.log('Todos los dislikes eliminados');
      } catch (e) {
        console.error('Error eliminando todos los dislikes', e);
      }
    }
  };

  const renderItem = ({ item }: { item: Anime }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.kind}>{item.tipo}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        {tab === 'dislikes' && (
          <TouchableOpacity
            style={styles.opportunityButton}
            onPress={async () => {
              try {
                await AsyncStorage.setItem('corrutina_item', JSON.stringify(item));
                const raw = await AsyncStorage.getItem('corrutina_item');
                if (!raw) {
                  console.log('No se pudo guardar corrutina_item');
                  alert('Error guardando datos para la corrutina');
                  return;
                }
                // optional: debug log
                console.log('corrutina_item guardado:', raw);
                router.push('/four');
              } catch (e) {
                console.log('Error preparando corrutina', e);
                alert('Error preparando corrutina: ' + String(e));
              }
            }}
          >
            <Text style={styles.opportunityButtonText}>Dar oportunidad</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => tab === 'likes' ? removeLike(item.id) : removeDislike(item.id)}
        >
          <Text style={styles.removeButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const displayData = tab === 'likes' ? likedAnimes : dislikedAnimes;
  const emptyMessage = tab === 'likes' 
    ? 'No has dado like a ningún personaje aún.' 
    : 'No has rechazado ningún personaje aún.';

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'likes' && styles.tabButtonActive]}
          onPress={() => setTab('likes')}
        >
          <Text style={[styles.tabButtonText, tab === 'likes' && styles.tabButtonTextActive]}>
            Likeados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'dislikes' && styles.tabButtonActive]}
          onPress={() => setTab('dislikes')}
        >
          <Text style={[styles.tabButtonText, tab === 'dislikes' && styles.tabButtonTextActive]}>
            Rechazados
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 10 }}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : displayData.length === 0 ? (
          <Text style={styles.noLikesText}>{emptyMessage}</Text>
        ) : (
          <>
            <FlatList
              data={displayData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
            <TouchableOpacity 
              style={styles.deleteAllButton}
              onPress={() => tab === 'likes' ? removeAllLikes() : removeAllDislikes()}
            >
              <Text style={styles.deleteAllButtonText}>Eliminar todos</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    borderColor: '#2a9d8f',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  tabButtonTextActive: {
    color: '#2a9d8f',
  },
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
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  kind: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
    marginTop: 20,
  },
  noLikesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 30,
  },
  deleteAllButton: {
    backgroundColor: '#e63946',
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  opportunityButton: {
    backgroundColor: '#2a9d8f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  opportunityButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

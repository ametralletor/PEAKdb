import { db } from '@/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CorrutinaScreen() {
  const [seconds, setSeconds] = useState(30);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          let raw: string | null = null;
          const maxAttempts = 6;
          for (let i = 0; i < maxAttempts; i++) {
            raw = await AsyncStorage.getItem('corrutina_item');
            if (raw) break;
            await new Promise((res) => setTimeout(res, 150));
          }
          if (!isActive) return;
          if (raw) {
            setItem(JSON.parse(raw));
            setSeconds(30);
            console.log('corrutina_item found on focus:', raw);
          } else {
            console.log('corrutina_item not found on focus');
            setItem(null);
          }
        } catch (e) {
          console.log('Error leyendo corrutina_item', e);
          Alert.alert('Error', 'Error leyendo corrutina_item: ' + String(e));
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as unknown as number);
      intervalRef.current = null;
    }
    if (!item) {
      setSeconds(0);
      return;
    }
    setSeconds(30);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current as unknown as number);
            intervalRef.current = null;
          }
          (async () => {
            try {
              await AsyncStorage.removeItem('corrutina_item');
            } catch (e) {
              console.log('Error removing corrutina_item on timeout', e);
            }
            console.log('Timeout reached — navigating to /three');
            router.replace('/three');
          })();
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, [item]);

  const giveSecondChance = async () => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('No auth');
      const userId = user.uid;

      const likesRef = doc(db, 'likes', userId);
      const likesSnap = await getDoc(likesRef);
      let likedAnimes = likesSnap.exists() ? likesSnap.data().likedAnimes || [] : [];
      if (item && !likedAnimes.find((a: any) => a.id === item.id)) {
        likedAnimes.unshift({ id: item.id, titulo: item.titulo, image: item.image, tipo: item.tipo });
        await setDoc(likesRef, { likedAnimes });
        console.log('Likes updated, new count:', likedAnimes.length);
      }

      const dislikesRef = doc(db, 'dislikes', userId);
      const dislikesSnap = await getDoc(dislikesRef);
      if (dislikesSnap.exists()) {
        let dislikedAnimes = dislikesSnap.data().dislikedAnimes || [];
        const updated = dislikedAnimes.filter((a: any) => a.id !== (item?.id));
        await setDoc(dislikesRef, { dislikedAnimes: updated });
        console.log('Dislikes updated, new count:', updated.length);
      }

      try {
        await AsyncStorage.removeItem('corrutina_item');
      } catch (e) {
        console.log('Error removing corrutina_item after giveSecondChance', e);
      }
      Alert.alert('Hecho', 'Se ha añadido a favoritos y eliminado de rechazados.');
      console.log('Given second chance — navigating to /three');
      router.replace('/three');
    } catch (e) {
      console.log('Error giving second chance', e);
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  };

  const keepRejected = () => {
    (async () => {
      try {
        await AsyncStorage.removeItem('corrutina_item');
      } catch (e) {
        console.log('Error removing corrutina_item on keepRejected', e);
      }
      Alert.alert('Hecho', 'Se mantiene como rechazado.');
      console.log('Kept rejected — navigating to /three');
      router.replace('/three');
    })();
  };

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Ve a la pestaña "Rechazados" para iniciar la corrutina.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>¿Quieres darle otra oportunidad?</Text>
      <Image source={{ uri: String(item.image) }} style={styles.image} resizeMode="cover" />
      <Text style={styles.name}>{item.titulo}</Text>
      <Text style={styles.kind}>{item.tipo}</Text>

      <Text style={styles.timer}>Tiempo restante: {seconds}s</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.like]} onPress={giveSecondChance} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Me gusta</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.dislike]} onPress={keepRejected}>
          <Text style={styles.btnText}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  question: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  image: { width: 260, height: 360, borderRadius: 8, marginBottom: 12, backgroundColor: '#ddd' },
  name: { fontSize: 18, fontWeight: '600' },
  kind: { fontSize: 14, color: '#666', marginBottom: 12 },
  timer: { marginTop: 8, fontSize: 16 },
  buttons: { flexDirection: 'row', marginTop: 20 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginHorizontal: 8 },
  like: { backgroundColor: '#2a9d8f' },
  dislike: { backgroundColor: '#e63946' },
  btnText: { color: '#fff', fontWeight: '700' },
});

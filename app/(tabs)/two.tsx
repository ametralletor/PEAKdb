import { db } from '@/FirebaseConfig';
import { AntDesign, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

type Anime = {
  id: string;
  titulo: string;
  image: string;
  tipo: string;
};


export default function AnimeList() {
const { width, height } = useWindowDimensions();
const [animes, setAnimes] = useState<Anime[]>([]);
const [noMoreAnimes, setNoMoreAnimes] = useState(false);
const swipeRef= useRef<Swiper<Anime>>(null);
const LIKES_KEY = 'likes_v1';

//hacemos las dimensiones responsive
const isWeb = Platform.OS === 'web';
const cardWidth = isWeb ? Math.min(width * 0.6, 400) : width * 0.85;
const cardHeight = isWeb ? Math.min(height * 0.75, 650) : 550;
const imageHeight = isWeb ? cardHeight * 0.75 : cardHeight * 0.8;
const containerPaddingTop = isWeb ? 20 : 0;
const containerMarginTop = isWeb ? -120 : -190;

async function addLike(item: Anime) {
  try {
    const raw = await AsyncStorage.getItem(LIKES_KEY);
    const list: Anime[] = raw ? JSON.parse(raw) : [];
    // evitar duplicados por id
    if (!list.find(i => i.id === item.id)) {
      list.unshift(item);
      await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(list));
      console.log('Guardado like:', item.id);
    } else {
      console.log('Ya existe like:', item.id);
    }
  } catch (e) {
    console.log('Error guardando like', e);
  }
}

async function addLikeToFirebase(item: Anime) {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userLikesRef = doc(db, 'likes', userId);

      try {
        const userLikesSnap = await getDoc(userLikesRef);
        let likedAnimes = userLikesSnap.exists() ? userLikesSnap.data().likedAnimes || [] : [];

        if (!likedAnimes.find((i: Anime) => i.id === item.id)) {
          likedAnimes.unshift(item);
          await setDoc(userLikesRef, { likedAnimes });
          console.log('Guardado like en Firebase:', item.id);
        } else {
          console.log('Ya existe like en Firebase:', item.id);
        }
      } catch (e) {
        console.log('Error guardando like en Firebase', e);
      }
    }
  }

async function addDislikeToFirebase(item: Anime) {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const userDislikesRef = doc(db, 'dislikes', userId);

      try {
        const userDislikesSnap = await getDoc(userDislikesRef);
        let dislikedAnimes = userDislikesSnap.exists() ? userDislikesSnap.data().dislikedAnimes || [] : [];

        if (!dislikedAnimes.find((i: Anime) => i.id === item.id)) {
          dislikedAnimes.unshift(item);
          await setDoc(userDislikesRef, { dislikedAnimes });
          console.log('Guardado dislike en Firebase:', item.id);
        } else {
          console.log('Ya existe dislike en Firebase:', item.id);
        }
      } catch (e) {
        console.log('Error guardando dislike en Firebase', e);
      }
    }
  }

const loadAnimes = async () => {
  try{
    const querySnapshot = await getDocs(collection(db, 'animes'));
    let data: Anime[] = querySnapshot.docs.map(doc => { 
      const d = doc.data() as Omit<Anime, 'id'>;
      return {
        id: doc.id,
        titulo: d.titulo,
        image: d.image,
        tipo: d.tipo
      };
    });

    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      const likesRef = doc(db, 'likes', userId);
      const dislikesRef = doc(db, 'dislikes', userId);

      try {
        const likesSnap = await getDoc(likesRef);
        const dislikesSnap = await getDoc(dislikesRef);

        const likedIds = likesSnap.exists() ? (likesSnap.data().likedAnimes || []).map((a: Anime) => a.id) : [];
        const dislikedIds = dislikesSnap.exists() ? (dislikesSnap.data().dislikedAnimes || []).map((a: Anime) => a.id) : [];
        const viewedIds = new Set([...likedIds, ...dislikedIds]);

        data = data.filter(anime => !viewedIds.has(anime.id));

        console.log(`Cargados ${data.length} personajes (excluidos ${viewedIds.size} ya vistos)`);
      } catch (e) {
        console.log('Error cargando likes/dislikes:', e);
      }
    }

    setAnimes(data);
    setNoMoreAnimes(false);
  } catch (error) {
    console.log("Error cargando personajes: ", error);
    alert("Error cargando personajes: " + error);
  }
};

useEffect(() => {
  loadAnimes();
}, []);

useFocusEffect(
  React.useCallback(() => {
    loadAnimes();
  }, [])
);
    const onSwipedAll = () => {
    setNoMoreAnimes(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'rgba(129, 199, 132, 0.17)' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {animes.length > 0 && !noMoreAnimes ? (
          <Swiper
            ref={swipeRef}
            containerStyle={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: containerPaddingTop, marginTop: containerMarginTop, height: cardHeight }}
            cardStyle={{ alignItems: 'center', justifyContent: 'center' }}
            cards={animes}
            stackSize={3}
            stackSeparation={12}
            stackScale={0.95}
            cardIndex={0}
            key={animes.map(a => a.id).join(',')}
            animateCardOpacity
            verticalSwipe={false}

            onSwipedLeft={(card) => {
              console.log('Swipe me gusta, card index:', card);
              if (animes[card]) {
                addLikeToFirebase(animes[card]);
              }
            }}
            onSwipedRight={(card) => {
              console.log('Swipe no me gusta, card index:', card);
              if (animes[card]) {
                addDislikeToFirebase(animes[card]);
              }
            }}
            onSwipedAll={onSwipedAll}
            renderCard={(card) => (
              <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                <Image source={{ uri: card.image }} style={[styles.image, { height: imageHeight }]} />
                <Text style={styles.title}>{card.titulo}</Text>
                <Text style={styles.kind}>{card.tipo}</Text>
              </View>
            )}
            overlayLabels={{
              left: {
                title:"LIKE!!",
                style:{
                  label: {
                    textAlign:"right",
                    color:"green",
                  },
                },
              },
              right: {
                title:"DISLIKE :(",
                style:{
                  label: {
                    textAlign:"left",
                    color:"red",
                  },
                },
              },
            }}
          />
        ) : (
          <Text style={styles.noMoreAnimes}>😢No hay más personas😢</Text>
        )}
      </View>

    {!noMoreAnimes && (
      <View style={{position:'absolute', bottom:30, width:'100%', flexDirection:'row', justifyContent:'space-evenly', alignItems:'center', zIndex: 999, elevation: 999}}>
      <TouchableOpacity onPress={()=> swipeRef.current?.swipeLeft()}>
        <AntDesign name="heart" size={44} color="#2a9d8f" />
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> swipeRef.current?.swipeRight()}>
        <Entypo name="cross" size={64} color="#e63946" />
      </TouchableOpacity>
    </View>
    )}
    </SafeAreaView>
      

  );

}


const styles = StyleSheet.create({
  card: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 3, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%' },
  title: { fontSize: 18, fontWeight: '600', margin: 10, textAlign: 'center' },
  kind: { fontSize: 14, color: '#666', marginHorizontal: 10, marginBottom: 10, paddingBottom: 5, textAlign: 'center' },
  noMoreAnimes: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

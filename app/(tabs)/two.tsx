import { db } from '@/FirebaseConfig';
import { AntDesign, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

type Anime = {
  id: string;
  titulo: string;
  image: string;
  tipo: string;
};


export default function AnimeList() {

const [animes, setAnimes] = useState<Anime[]>([]);
const [noMoreAnimes, setNoMoreAnimes] = useState(false);
const swipeRef= useRef<Swiper<Anime>>(null);
// Añadir like a almacenamiento local
const LIKES_KEY = 'likes_v1';

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
      const userId = user.uid;  // Obtener el ID del usuario
      const userLikesRef = doc(db, 'likes', userId);  // Referencia al documento de likes del usuario

      try {
        // Obtener los "likes" actuales del usuario
        const userLikesSnap = await getDoc(userLikesRef);
        let likedAnimes = userLikesSnap.exists() ? userLikesSnap.data().likedAnimes || [] : [];

        // Evitar duplicados por ID
        if (!likedAnimes.find((i: Anime) => i.id === item.id)) {
          likedAnimes.unshift(item);  // Añadir el anime a la lista de likes
          
          // Actualizamos el documento de Firestore
          await setDoc(userLikesRef, { likedAnimes }); // Si el documento no existe, lo crea, si existe lo actualiza.
          console.log('Guardado like en Firebase:', item.id);
        } else {
          console.log('Ya existe like en Firebase:', item.id);
        }
      } catch (e) {
        console.log('Error guardando like en Firebase', e);
      }
    }
  }



  useEffect(() => {
    const loadAnimes = async () => {
      try{
      const querySnapshot = await getDocs(collection(db, 'animes'));
      const data: Anime[] = querySnapshot.docs.map(doc => { 
        const d = doc.data() as Omit<Anime, 'id'>;

        
        return {
          id: doc.id,
          titulo: d.titulo,
          image: d.image,
          tipo: d.tipo
        };
      });
      setAnimes(data);
    } catch (error) {
      console.log("Error cargando animes: ", error);
      alert("Error cargando animes: " + error);
    }
  
  };
    loadAnimes();
  }, []);
    const onSwipedAll = () => {
    setNoMoreAnimes(true);
  };

  return (
    /*<FlatList
      data={animes}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={styles.kind}>{item.tipo}</Text>
        </View>
      )}
    />*/
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {animes.length > 0 && !noMoreAnimes ? (
          <Swiper
            ref={swipeRef}
            containerStyle={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: 20 , marginTop:-150}}
            cardStyle={{ alignItems: 'center', justifyContent: 'center' }}
            cards={animes}
            stackSize={5}
            stackSeparation={12}
            stackScale={0.95}
            cardIndex={0}
            animateCardOpacity
            verticalSwipe={false}
            onSwipedLeft={(card) => {
              console.log('Swipe me gusta');
              addLikeToFirebase(animes[card]);
            }}
            onSwipedRight={() => {
              console.log('Swipe no me gusta');
            }}
            onSwipedAll={onSwipedAll} // Llamamos a la función cuando se acaben las cartas
            renderCard={(card) => (
              <View style={styles.card}>
                <Image source={{ uri: card.image }} style={styles.image} />
                <Text style={styles.title}>{card.titulo}</Text>
                <Text style={styles.kind}>{card.tipo}</Text>
              </View>
            )}
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
  card: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 3 , width: '85%', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 500 },
  title: { fontSize: 18, fontWeight: '600', margin: 10 },
  kind: { fontSize: 14, color: '#666', marginHorizontal: 10, marginBottom: 10 },
  noMoreAnimes: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

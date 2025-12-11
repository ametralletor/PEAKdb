import { db } from '@/FirebaseConfig';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
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
const swipeRef= useRef<Swiper<Anime>>(null);

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
    }
  
  };
    loadAnimes();
  }, []);

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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    {animes.length > 0 && (
  <Swiper
    ref={swipeRef}
    containerStyle={{ backgroundColor: "transparent" }}
    cards={animes}
    stackSize={5}
    cardIndex={0}
    animateCardOpacity
    verticalSwipe={false}
    onSwipedLeft={() => {
      console.log("Swipe me gusta")
    }}
    onSwipedRight={() => {
      console.log("Swipe no me gusta")
    }}
    renderCard={card => (
      <View style={styles.card}>
        <Image source={{ uri: card.image }} style={styles.image} />
        <Text style={styles.title}>{card.titulo}</Text>
        <Text style={styles.kind}>{card.tipo}</Text>
      </View>
    )}
  />
)}
    </View>

    <View style={{position:'absolute', bottom:30, width:'100%', flexDirection:'row', justifyContent:'space-evenly', alignItems:'center'}}>
      <TouchableOpacity
      onPress={()=> swipeRef.current?.swipeLeft()}
      >
      <AntDesign name="heart" size={44} color="#2a9d8f" />
      </TouchableOpacity>
      <TouchableOpacity
      onPress={()=> swipeRef.current?.swipeRight()}>
      <Entypo name="cross" size={64} color="#e63946" />
      </TouchableOpacity>
    </View>
    </SafeAreaView>
      

  );

}


const styles = StyleSheet.create({
  card: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 3 , width: 320, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 500 },
  title: { fontSize: 18, fontWeight: '600', margin: 10 },
  kind: { fontSize: 14, color: '#666', marginHorizontal: 10, marginBottom: 10 },
});

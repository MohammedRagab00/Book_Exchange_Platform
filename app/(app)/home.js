import React, { useState, useEffect } from "react";
import { getDocs, collection, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  View,
  Text,
  Pressable,
} from "react-native";
import { db } from "../../firebaseConfig";
import { Image } from "expo-image";
import { router } from "expo-router";

export default function TabOneScreen() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInternetConnection();
    fetchBooks();
  }, []);

  const checkInternetConnection = async () => {
    const isConnected = await NetInfo.fetch().then(
      (state) => state.isConnected
    );
    if (!isConnected) {
      Alert.alert(
        "No Internet",
        "Please check your internet connection and try again.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
  };

  const fetchBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Books"));
      const booksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      await AsyncStorage.setItem("books", JSON.stringify(booksData)); // Save books data in AsyncStorage
      setBooks(booksData);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching books: ", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  const handleBookPress = (item) => {
    router.push(`ItemDetails?item=${item}`);
  };

  const addToCart = async (item) => {
    try {
      const cartRef = collection(db, "Cart");
      await addDoc(cartRef, item);
      Alert.alert("Added to Cart", `${item.name} added to cart.`);
    } catch (error) {
      console.error("Error adding item to cart: ", error);
      Alert.alert("Error", "Failed to add item to cart.");
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.price.toString().includes(searchQuery) // Convert price to string for comparison
  );

  const sortedBooks = sortBy
    ? filteredBooks.sort((a, b) => {
        if (sortBy === "price") {
          return a[sortBy] - b[sortBy]; // Compare prices directly as numbers
        } else if (a[sortBy] && b[sortBy]) {
          return a[sortBy].toString().localeCompare(b[sortBy].toString());
        } else {
          return 0;
        }
      })
    : filteredBooks;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search "
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
      />
      <View style={styles.sortContainer}>
        <Text style={{ fontWeight: "bold", marginTop: 20 }}>Sort by :</Text>
        <Pressable
          onPress={() => setSortBy("name")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#874f1f" : "#ca6128",
              padding: 10,
              marginVertical: 10,
              marginHorizontal: 10,
              borderRadius: 8,
            },
          ]}
        >
          <Text style={{ color: "white" }}>Name</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortBy("price")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#874f1f" : "#ca6128",
              padding: 10,
              marginVertical: 10,
              marginHorizontal: 10,
              borderRadius: 8,
            },
          ]}
        >
          <Text style={{ color: "white" }}>Price</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortBy("publisher")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#874f1f" : "#ca6128",
              padding: 10,
              marginVertical: 10,
              marginHorizontal: 10,
              borderRadius: 8,
            },
          ]}
        >
          <Text style={{ color: "white" }}>Publisher</Text>
        </Pressable>
        <Pressable
          onPress={() => setSortBy("genre")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#874f1f" : "#ca6128",
              padding: 10,
              marginVertical: 10,
              marginHorizontal: 10,
              borderRadius: 8,
            },
          ]}
        >
          <Text style={{ color: "white" }}>Genre</Text>
        </Pressable>
      </View>
      {loading ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedBooks}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleBookPress(item.id)}>
              <View style={styles.bookItem}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.bookImage}
                />
                <View style={styles.bookInfoContainer}>
                  <Text style={styles.bookTitle}>{item.name}</Text>
                  <Text style={styles.bookDetails}>Author: {item.author}</Text>
                  <Text style={styles.bookDetails}>
                    Publisher: {item.publisher}
                  </Text>
                  <Text style={styles.bookDetails}>Genre: {item.genre}</Text>
                  <Text style={styles.bookDetails}>Price: {item.price}</Text>
                  <Pressable
                    onPress={() => addToCart(item)}
                    style={styles.addToCartButton}
                  >
                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  bookItem: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  bookImage: {
    width: 120,
    height: 190,
      borderWidth: 1,
      borderColor: "#ccc",
      paddingHorizontal: 20, 
      paddingVertical: 10, 
      borderRadius: 8, 
      flexDirection: "row",
      alignItems: "center",
      marginRight:10 
    
  },
  bookInfoContainer: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bookDetails: {
    marginBottom: 10,
  },
  addToCartButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ca6128",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addToCartButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

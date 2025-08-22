import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator // Changed from UIActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';

export default function ServiceCat() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://locato-backend-wxjj.onrender.com/api/serviceCat/');
        const transformedData = response.data.map((categoryDoc) => ({
          id: categoryDoc._id,
          sectionTitle: categoryDoc.Category,
          categories: categoryDoc.subCategories.map((subCat, subIndex) => ({
            id: `${categoryDoc._id}-${subIndex}`,
            category: subCat,
            type: subCat.toLowerCase().replace(/\s+/g, '-'),
          })),
        }));
        setCategories(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (category) => {
    router.push({
      pathname: '/(listService)/serviceApplication',
      params: {
        categoryId: category.id,
        categoryName: category.category,
        categoryType: category.type,
      },
    });
  };

  const renderCategoryCard = (item) => (
    <TouchableOpacity
      key={item.id}
      // Updated card style to match theme (light gray, more padding, rounded)
      className="bg-gray-100 w-[48%] rounded-2xl p-4 mb-4 flex-row justify-between items-center"
      onPress={() => handleCategoryPress(item)}
    >
      <Text className="text-black text-base font-semibold w-[80%]">
        {item.category}
      </Text>
      {/* Updated icon style for a cleaner look */}
      <View className="bg-white p-1 rounded-full">
        <Ionicons name="chevron-forward-outline" size={20} color="#f2eb58" />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section) => (
    <View key={section.id} className="mb-6">
      {/* Updated section title style */}
      <Text className="text-xl font-bold text-black mb-4">
        {section.sectionTitle}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {section.categories.map(renderCategoryCard)}
      </View>
    </View>
  );

  if (loading) {
    return (
      // Themed loading indicator
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      // Themed error message
      <SafeAreaView className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-gray-600 text-center">
          Failed to load categories. Please try again later.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    // Main container now uses SafeAreaView for consistency
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="p-6" // Consistent padding
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header --- */}
        <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <View>
              <Text className="text-3xl font-bold text-black">
                  Pick a Category
              </Text>
              <Text className="text-base text-gray-500 mt-1">
                  Choose a service to get starteddfdsfs
              </Text>
            </View>
        </View>

        {/* --- Categories List --- */}
        {categories.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
}
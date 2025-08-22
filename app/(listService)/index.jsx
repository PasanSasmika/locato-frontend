import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { UIActivityIndicator } from 'react-native-indicators';
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
        const transformedData = response.data.map((categoryDoc, index) => ({
          id: categoryDoc._id,
          sectionTitle: categoryDoc.Category,
          categories: categoryDoc.subCategories.map((subCat, subIndex) => ({
            id: `${categoryDoc._id}-${subIndex}`,
            category: subCat,
            type: subCat.toLowerCase().replace(/\s+/g, '-'),
          }))
        }));
        setCategories(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
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
      }
    });
  };

  const renderCategoryCard = (item) => (
  <TouchableOpacity
    key={item.id}
    className="bg-secondary w-[48%] h-24 rounded-xl p-4 mb-3 flex-row justify-between"
    onPress={() => handleCategoryPress(item)}
  >
    <View>
      <Text className="text-gray-900 text-[16px] font-medium">
        {item.category}
      </Text>
    </View>
    <View className="bg-gray-100 rounded-full w-10 h-10 items-center justify-center">
      <Ionicons name="albums" size={20} color="black" />
    </View>
  </TouchableOpacity>
);

  const renderSection = (section) => (
    <View key={section.id} className="mb-6">
      <Text className="text-lg font-semibold text-white mb-3">
        {section.sectionTitle}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {section.categories.map(renderCategoryCard)}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center bg-black items-center">
        <UIActivityIndicator size={30} color="#D5FF44" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-black px-5"
      showsVerticalScrollIndicator={false}
    >
      <View className="my-10">
         <Text className="text-3xl font-bold text-white mb-2">
            Pick a Category
          </Text>
          <Text className="text-gray-400 text-base leading-6">
            Choose from our wide range of professional services
          </Text>
      </View>
      {categories.map(renderSection)}
    </ScrollView>
  );
}
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router, useNavigation } from 'expo-router';

export default function ServiceCat() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  // Define color palette for categories
  const colors = [
    "#D2E7F9", 
    "#EFF9D2", 
    "#F8D2F9", 
    "#F9D2D3", 
    "#D2F9DF", 
    "#F9FBE7", 
    "#FFF3E0", 
    "#E0F7FA", 
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
       
        const response = await axios.get('https://locato-backend.onrender.com/api/serviceCat/');
        
        const transformedData = response.data.map((categoryDoc, index) => ({
          id: categoryDoc._id,
          sectionTitle: categoryDoc.Category,
          categories: categoryDoc.subCategories.map((subCat, subIndex) => ({
            id: `${categoryDoc._id}-${subIndex}`,
            category: subCat,
            type: subCat.toLowerCase().replace(/\s+/g, '-'),
            color: colors[(index + subIndex) % colors.length]
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
    console.log('Selected category:', category);
    router.push({
      pathname: '/(listService)/serviceApplication',
      params: { 
        categoryId: category.id,
        categoryName: category.category,
        categoryType: category.type,
        parentCategory: category.parentCategory
      }
    });
  };

  const renderCategoryCard = (item) => (
    <TouchableOpacity
      key={item.id}
      className="rounded-[16px] mb-[12px] min-w-[48%] max-w-[48%] h-[90px] p-4"
      style={{
        backgroundColor: item.color,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
      onPress={() => handleCategoryPress(item)}
    >
      <View className="flex-1 justify-between">
        <View className="flex-row justify-end">
          <View className="bg-[#d6f7fa] bg-opacity-50 rounded-full w-10 h-10 items-center justify-center">
            <Ionicons name="albums" size={18} color="black" />
          </View>
        </View>
        <Text className="text-[18px] font-normal text-gray-900">
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section) => (
    <View key={section.id} className="mb-[30px]">
      <Text className="text-[18px] font-semibold text-[#333] mb-[15px]">
        {section.sectionTitle}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {section.categories.map(renderCategoryCard)}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center bg-background items-center">
       <ActivityIndicator size={30} className="text-[#d6f82e]"/>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-background px-[20px]"
      showsVerticalScrollIndicator={false}
    >
      <View className="mt-[45px] mb-[30px]">
        <Text className="text-[28px] font-bold text-[#333] leading-[34px]">
          Pick the Perfect Category
        </Text>
        <Text className="text-[28px] font-bold text-[#333] leading-[34px]">
          for You
        </Text>
      </View>
      
      {categories.map(renderSection)}
    </ScrollView>
  );
}
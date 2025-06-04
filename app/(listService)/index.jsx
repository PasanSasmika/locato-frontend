import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

export default function ServiceCat() {
  const mockdata = [
    {
      id: "1",
      sectionTitle: "Tuition and Education",
      categories: [
        { id: "1-1", category: "Tuition", type: "tuition", color: "#E3F2FD" }
      ]
    },
    {
      id: "2", 
      sectionTitle: "Health Care",
      categories: [
        { id: "2-1", category: "Pharmacy", type: "pharmacy", color: "#F1F8E9" },
        { id: "2-2", category: "Hospital", type: "hospital", color: "#FCE4EC" },
        { id: "2-3", category: "Private", type: "private", color: "#E8F5E8" },
        { id: "2-4", category: "Labs", type: "labs", color: "#E3F2FD" },
        { id: "2-5", category: "Ayurvedha", type: "ayurvedha", color: "#FFEBEE" }
      ]
    },
    {
      id: "3",
      sectionTitle: "Beauty & Wellness", 
      categories: [
        { id: "3-1", category: "Saloons", type: "saloons", color: "#FFEBEE" },
        { id: "3-2", category: "Spas", type: "spas", color: "#F9FBE7" },
        { id: "3-3", category: "Makeup", type: "makeup", color: "#E8F5E8" },
        { id: "3-4", category: "Fitness Centers", type: "fitness", color: "#E3F2FD" }
      ]
    }
  ]

  const handleCategoryPress = (category) => {
    console.log('Selected category:', category);
    // Handle category selection here
  }

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
        <View className="bg-white bg-opacity-50 rounded-full w-10 h-10 items-center justify-center">
          <Ionicons name="albums" size={18} color="black" />
        </View>
      </View>
      <Text className="text-[18px] font-normal text-gray-900">
        {item.category}
      </Text>
    </View>
  </TouchableOpacity>
)

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
      
      {mockdata.map(renderSection)}
    </ScrollView>
  )
}

// Updated (tabs)/home/index.jsx
import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Sample categories data (5 categories as provided)
  const categories = [
    { id: 1, name: 'Urology', icon: 'flame', specialists: '4 specialist' },
    { id: 2, name: 'Psychiatry', icon: 'chatbox', specialists: '8 specialist' },
    { id: 3, name: 'Rheumatology', icon: 'accessibility', specialists: '6 specialist' },
    { id: 4, name: 'ENT', icon: 'ear', specialists: '7 specialist' },
    { id: 5, name: 'Allergy', icon: 'flower', specialists: '5 specialist' },
  ];

  // State for plans data, loading, and refreshing
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch plans from API
  const fetchPlans = async () => {
    try {
      const response = await axios.get('https://locato-backend-wxjj.onrender.com/api/serviceCat');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  // Handle subcategory click (placeholder function, replace with your logic)
  const handleSubCategoryClick = (subCategory) => {
    console.log('Clicked subcategory:', subCategory.name);
    // Add your navigation or action logic here
  };

  // Handle "View all services" button click
  const handleViewAllServices = (subCategory) => {
    router.push({
      pathname: '/home/serviceAll',
      params: { serviceType: subCategory.name },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Top Profile Bar --- */}
      <View className="px-6 pt-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold">
              Hello, {user?.firstName || 'User'}
            </Text>
            <Text className="text-gray-500">Welcome to Locato</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image
              source={{ uri: user?.profilepic }}
              className="w-12 h-12 rounded-full"
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full mt-4 px-4 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            placeholder="Search"
            className="flex-1 ml-2 text-base"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Middle Content (Categories and Plans) --- */}
      <ScrollView
        className="px-6 mt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10b981']}
            tintColor="#10b981"
            progressViewOffset={50}
          />
        }
      >
        {/* Select Category Section */}
        <Text className="text-lg font-semibold mb-4">Select category</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="w-[48%] bg-gray-50 rounded-lg p-3 mb-3 items-center"
            >
              <Ionicons name={category.icon} size={24} color="#10b981" />
              <Text className="text-center text-sm mt-1">{category.name}</Text>
              <Text className="text-center text-xs text-gray-500">{category.specialists}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Select Plan Section */}
        <Text className="text-lg font-semibold mb-4">Select plan</Text>
        <View className="mb-6">
          {loading ? (
            <ActivityIndicator size="large" color="#10b981" />
          ) : plans.length > 0 ? (
            plans.map((plan, index) => (
              <View key={index} className="mb-6">
                {/* Category Header */}
                <Text className="text-base font-bold text-gray-800 mb-3">{plan.Category}</Text>
                {/* Subcategories in enhanced cards */}
                {plan.subCategories.map((sub, subIndex) => (
                  <TouchableOpacity
                    key={subIndex}
                    className="w-full bg-gray-100 rounded-lg p-4 mb-3 shadow-md"
                    onPress={() => handleSubCategoryClick(sub)}
                  >
                    <View className="flex-row items-center mb-2">
                      <Ionicons name={sub.icon || 'list'} size={20} color="#10b981" />
                      <Text className="text-sm font-medium text-gray-700 ml-2">{sub.name}</Text>
                    </View>
                    {sub.description && (
                      <Text className="text-xs text-gray-500 mb-3">{sub.description}</Text>
                    )}
                    <TouchableOpacity
                      className="flex-row items-center bg-[#10b981] rounded-full px-4 py-2 w-auto self-end"
                      onPress={() => handleViewAllServices(sub)}
                    >
                      <Text className="text-sm text-white ml-2">View all services</Text>
                      <Ionicons name="chevron-forward" size={16} color="white" className="ml-2" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <Text className="text-gray-400">No plans available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
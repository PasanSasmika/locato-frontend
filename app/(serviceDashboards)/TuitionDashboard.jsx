import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function TuitionDashboard() {
  // Get user info and logout function from your Zustand store
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/'); // Go back to the login screen
    Alert.alert("Logged Out", "You have been successfully logged out.");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerClassName="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800">
            Tuition Dashboard
          </Text>
          <Text className="text-lg text-gray-500 mt-1">
            Welcome, {user?.name || 'Teacher'}!
          </Text>
        </View>

        {/* Stats Cards Section */}
        <View className="flex-row justify-around mb-8">
          <View className="bg-white p-4 rounded-lg shadow-md flex-1 mx-2 items-center">
            <Text className="text-4xl font-bold text-blue-600">15</Text>
            <Text className="text-md text-gray-500 mt-1">Total Students</Text>
          </View>
          <View className="bg-white p-4 rounded-lg shadow-md flex-1 mx-2 items-center">
            <Text className="text-4xl font-bold text-green-600">4</Text>
            <Text className="text-md text-gray-500 mt-1">Upcoming Classes</Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</Text>
          <View className="bg-white p-4 rounded-lg shadow-md">
            <TouchableOpacity className="bg-blue-500 p-4 rounded-lg items-center mb-3">
              <Text className="text-white font-bold text-lg">Schedule a New Class</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 p-4 rounded-lg items-center">
              <Text className="text-black font-bold text-lg">View All Students</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500 p-4 rounded-lg items-center mt-6"
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
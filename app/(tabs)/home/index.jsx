import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { Ionicons } from '@expo/vector-icons'; // for search & filter icons
import { useRouter } from 'expo-router';

export default function Home() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

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

      {/* --- Middle Content (Empty for now) --- */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">Content will go here</Text>
      </View>
    </SafeAreaView>
  );
}
import { View, Text, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';

// Stat component for reusability
const Stat = ({ value, label }) => (
  <View className="items-center">
    <Text className="text-3xl font-bold text-black">{value}</Text>
    <Text className="text-sm text-gray-500 mt-1">{label}</Text>
  </View>
);

// Profile card component for reusability
const PlanCard = ({ icon, title, subtitle, color, iconColor = 'black',onPress  }) => (
  <TouchableOpacity className={`flex-1 ${color} p-5 rounded-2xl`}
  onPress={onPress}>
    <View className="flex-row justify-between items-start">
      <View className="bg-white/30 p-2 rounded-full">
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
    </View>
    <View className="mt-8">
      <Text className="text-lg font-semibold text-black">{title}</Text>
      <Text className="text-black">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);


export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-6">
        {/* --- Header --- */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {/* --- Profile Info --- */}
        <View className="items-center">
          <Image
            // Use optional chaining (?) in case user or profilepic is not available initially
            source={{ uri: user?.profilepic || 'https://placehold.co/100x100/000000/FFF?text=??' }}
            className="w-28 h-28 rounded-full border-2 border-gray-200"
          />
          {/* Use optional chaining and provide a fallback name */}
          <Text className="text-3xl font-bold mt-4">{user?.firstName || 'dUser'}</Text>
          <Text className="text-base text-gray-500 mt-1">{user?.email || 'User Title'}</Text>
        </View>

        {/* --- Stats Section --- */}
        <View className="flex-row justify-around my-8 bg-gray-50 p-4 rounded-2xl">
          <Stat value="83" label="Applied" />
          <Stat value="74" label="Reviewed" />
          <Stat value="25" label="Contacted" />
        </View>

        {/* --- Update Profile Section --- */}
        <View>
          <Text className="text-xl font-bold mb-4">Update Plan</Text>
          <View className="flex-row space-x-4 gap-3">
            {/* <ProfileCard
              icon="happy-outline"
              title="Update Profile"
              subtitle="Build Your — Portfolio"
              color="bg-yellow-300"
            /> */}
            <PlanCard
              icon="flash-outline"
              title="List Your Service"
              subtitle="Add Your Service Details"
              color="bg-colorB"
            onPress={() => router.push('/(listService)')} // Navigate to listService

            />
          </View>
        </View>

    
        <TouchableOpacity className="items-center mt-12 mb-6"
      onPress={() => {
      logout();          
      router.replace("/");
      }}
     >
  <Text className="text-base text-black">Logout</Text>
</TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

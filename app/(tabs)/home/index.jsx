import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useAuthStore } from "../../../store/authStore"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import axios from "axios"
import { useState, useEffect } from "react"

export default function Home() {
  const { user } = useAuthStore()
  const router = useRouter()

  // Sample categories data (5 categories as provided)
  const categories = [
    { id: 1, name: "Urology", icon: "flame", specialists: "4 specialist" },
    { id: 2, name: "Psychiatry", icon: "chatbox", specialists: "8 specialist" },
    {
      id: 3,
      name: "Rheumatology",
      icon: "accessibility",
      specialists: "6 specialist",
    },
    { id: 4, name: "ENT", icon: "ear", specialists: "7 specialist" },
    { id: 5, name: "Allergy", icon: "flower", specialists: "5 specialist" },
  ]

  // State for plans data, loading, and refreshing
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Function to fetch plans from API
  const fetchPlans = async () => {
    try {
      const response = await axios.get("https://locato-backend-wxjj.onrender.com/api/serviceCat")
      setPlans(response.data)
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchPlans()
  }, [])

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true)
    fetchPlans()
  }

  // Handle subcategory click
  const handleSubCategoryClick = (subCategory) => {
    console.log("Clicked subcategory:", subCategory.name)
  }

  // Handle "View all services" button click
  const handleViewAllServices = (subCategory) => {
    router.push({
      pathname: "/home/serviceAll",
      params: { serviceType: subCategory.name },
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Top Profile Bar --- */}
      <View className="px-6 pt-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold">Hello, {user?.firstName || "User"}</Text>
            <Text className="text-gray-500">Welcome to Locato</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <Image source={{ uri: user?.profilepic }} className="w-12 h-12 rounded-full" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full mt-4 px-4 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput placeholder="Search" className="flex-1 ml-2 text-base" placeholderTextColor="#9ca3af" />
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
            colors={["#10b981"]}
            tintColor="#10b981"
            progressViewOffset={50}
          />
        }
      >
        {/* Select Plan Section */}
        <Text className="text-lg font-semibold mb-4">Select plan</Text>
        <View className="mb-6">
          {loading ? (
            <ActivityIndicator size="large" color="#10b981" className="py-8" />
          ) : plans.length > 0 ? (
            <View>
              {plans.map((plan, index) => (
                <View key={index} className="mb-8">
                  <View className="flex-row items-center mb-4">
                    <View className="w-1 h-6 bg-[#10b981] rounded-full mr-3" />
                    <Text className="text-lg font-bold text-gray-800">{plan.Category}</Text>
                  </View>

                  <View className="flex-row flex-wrap justify-between">
                    {plan.subCategories.map((sub, subIndex) => (
                      <TouchableOpacity
                        key={subIndex}
                        className="w-[48%] mb-4"
                        onPress={() => handleSubCategoryClick(sub)}
                        activeOpacity={0.8}
                      >
                        <View
                          className="rounded-xl p-4 bg-gray-50 border border-gray-200"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <View className="mb-3">
                            <Text className="text-base font-semibold text-gray-800 mb-1">{sub.name}</Text>
                            {sub.description && (
                              <Text className="text-sm text-gray-600" numberOfLines={2} ellipsizeMode="tail">
                                {sub.description}
                              </Text>
                            )}
                          </View>

                          <View className="flex-row justify-end">
                            <TouchableOpacity
                              className="bg-white rounded-lg p-2 border border-gray-300"
                              onPress={() => handleViewAllServices(sub)}
                            >
                              <Ionicons name="arrow-forward" size={16} color="#6b7280" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-12 items-center">
              <Text className="text-gray-500 text-base font-medium mb-1">No plans available</Text>
              <Text className="text-gray-400 text-sm">Check back later for new medical plans</Text>
            </View>
          )}
        </View>

        {/* Select Category Section */}
        <Text className="text-lg font-semibold mb-4">Select category</Text>
        <View className="mb-6">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="flex-row items-center justify-between p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="bg-[#10b981] p-2 rounded-full">
                  <Ionicons name={category.icon} size={20} color="white" />
                </View>
                <View className="ml-4">
                  <Text className="text-sm font-medium text-gray-800">{category.name}</Text>
                  <Text className="text-xs text-gray-500">{category.specialists}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

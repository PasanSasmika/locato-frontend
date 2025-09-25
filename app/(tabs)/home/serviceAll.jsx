import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Hospital from "./ServiceComponents/Hospita";
import Lab from "./ServiceComponents/Lab";
import Pharmacy from "./ServiceComponents/Pharmacy";
import Restaurant from "./ServiceComponents/Restaurant";
import Saloon from "./ServiceComponents/Saloon";
import Spa from "./ServiceComponents/Spa";
import Supermarket from "./ServiceComponents/Supermarket";
import Ayurveda from "./ServiceComponents/Ayurveda";
import BridalMakeup from "./ServiceComponents/BridalMakeup";
import Clothing from "./ServiceComponents/Clothing";
import Doctor from "./ServiceComponents/Doctor";
import Electronics from "./ServiceComponents/Electronics";
import Gym from "./ServiceComponents/Gym";
import Hardware from "./ServiceComponents/Hardware";
import HomeRepair from "./ServiceComponents/HomeRepair";


export default function ServiceAll() {
  const { serviceType } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const serviceMap = {
    Hospitals: "hospitals",
    Labs: "labs",
    Pharmacies: "pharmacies",
    Restaurants: "restaurants",
    Saloons: "saloons",
    Spas: "spas",
    Supermarkets: "supermarkets",
    Ayurveda: "ayurveda",
    BridalMakeups: "bridalMakeups",
    Clothing: "clothing",
    Private: "private",
    Electronics: "electronics",
    "Fitness Center": "fitnesscenter",
    Hardware: "hardware",
    "Home Repairs": "homeRepairs",
  };

  const normalizeServiceType = (type) => {
    if (!type) return null;
    let normalized = type
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/(^|[a-z])([A-Z])/g, (m, g1, g2) => g1 + g2.toLowerCase())
      .replace(/^./, (str) => str.toUpperCase());
    if (serviceMap[normalized]) return serviceMap[normalized];
    const typoCorrections = {
      Ayruwedha: "Ayurveda",
      Ayruveda: "Ayurveda",
      HomeRepair: "HomeRepairs",
      Pharmacy: "Pharmacies",
      Private: "private",
      HomeRepair: "homeRepairs",
      BridleMakeup: "bridalMakeups",
      BridleMakeupAndBeauty: "bridalMakeups",
      "Fitness Center": "fitnesscenter",
    };
    normalized = typoCorrections[normalized] || normalized;
    if (serviceMap[normalized]) return serviceMap[normalized];
    if (!normalized.endsWith("s")) normalized += "s";
    return serviceMap[normalized] || null;
  };

  const serviceKey = normalizeServiceType(serviceType);
  const screenWidth = Dimensions.get("window").width;

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://locato-backend-wxjj.onrender.com/api/all-services?services=${serviceKey}`
      );
      const serviceData = response.data.data[serviceKey]?.data || [];
      setData(serviceData);
    } catch (error) {
      console.error(`Error fetching ${serviceType}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderFunctions = {
    hospitals: Hospital,
    labs: Lab,
    pharmacies: Pharmacy,
    restaurants: Restaurant,
    saloons: Saloon,
    spas: Spa,
    supermarkets: Supermarket,
    ayurveda: Ayurveda,
    bridalMakeups: BridalMakeup,
    clothing: Clothing,
    private: Doctor,
    electronics: Electronics,
    fitnesscenter: Gym,
    hardware: Hardware,
    homeRepairs: HomeRepair,
  };

  const renderItem = ({ item }) => {
    const Component = renderFunctions[serviceKey];
    return Component ? (
      <Component item={item} screenWidth={screenWidth} />
    ) : (
      <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
        <Text className="text-center text-gray-500 text-lg">Unsupported service type</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-gray-100 px-6 pt-8 pb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-black mb-1">All {serviceType}</Text>
            <Text className="text-black text-sm">Discover quality services near you</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="bg-white/20 p-3 rounded-full">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={() =>
          loading ? null : (
            <View className="flex-1 justify-center items-center mt-20">
              <View className="bg-gray-100 p-8 rounded-full mb-4">
                <Ionicons name="sad-outline" size={48} color="#9ca3af" />
              </View>
              <Text className="text-gray-600 text-lg font-medium mb-2">No {serviceType} Found</Text>
              <Text className="text-gray-500 text-sm text-center px-8">
                We couldn't find any {serviceType.toLowerCase()} in your area right now.
              </Text>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4b5563"]} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View className="absolute inset-0 flex-1 justify-center items-center bg-white/80">
          <View className="bg-white p-6 rounded-2xl shadow-lg">
            <ActivityIndicator size="large" color="#4b5563" />
            <Text className="text-gray-600 mt-3 text-center font-medium">Loading {serviceType}...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
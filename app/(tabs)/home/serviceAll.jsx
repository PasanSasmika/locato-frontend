"use client"

import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import axios from "axios"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"

export default function ServiceAll() {
  const { serviceType } = useLocalSearchParams()
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
  }

  const normalizeServiceType = (type) => {
    if (!type) return null
    let normalized = type
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/(^|[a-z])([A-Z])/g, (m, g1, g2) => g1 + g2.toLowerCase())
      .replace(/^./, (str) => str.toUpperCase())
    if (serviceMap[normalized]) return serviceMap[normalized]
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
    }
    normalized = typoCorrections[normalized] || normalized
    if (serviceMap[normalized]) return serviceMap[normalized]
    if (!normalized.endsWith("s")) normalized += "s"
    return serviceMap[normalized] || null
  }

  const serviceKey = normalizeServiceType(serviceType)
  const screenWidth = Dimensions.get("window").width

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://locato-backend-wxjj.onrender.com/api/all-services?services=${serviceKey}`,
      )
      const serviceData = response.data.data[serviceKey]?.data || []
      setData(serviceData)
    } catch (error) {
      console.error(`Error fetching ${serviceType}:`, error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [serviceType])

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const renderImageCarousel = (images, photosKey = "images") => (
    <View className="relative">
      {images?.length > 0 && (
        <View>
          <View className="relative">
            <Image source={{ uri: images[0] }} className="w-full h-48 rounded-t-2xl" resizeMode="cover" />
          </View>
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 px-4">
              {images.slice(1).map((img, idx) => (
                <View key={idx} className="mr-3">
                  <Image
                    source={{ uri: img }}
                    className="w-16 h-16 rounded-xl border border-gray-200"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )

  const renderInfoRow = (icon, label, value) =>
    value &&
    value !== "N/A" && (
      <View className="flex-row items-start mb-3 bg-gray-50 p-3 rounded-xl">
        <View className="bg-gray-200 p-2 rounded-full mr-3">
          <Ionicons name={icon} size={18} color="#374151" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</Text>
          <Text className="text-gray-800 text-sm font-medium leading-relaxed">{value}</Text>
        </View>
      </View>
    )

  const renderHospital = (item) => (
    <View className="bg-white rounded-2xl mb-6 shadow-lg border border-gray-100 overflow-hidden">
      {renderImageCarousel(item.images)}
      <View className="p-5">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.name}</Text>
            <View className="flex-row items-center">
              <View className="bg-gray-100 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="star" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-xs font-semibold">4.8</Text>
              </View>
              <Text className="text-gray-500 ml-2 text-xs">98 Reviews</Text>
            </View>
          </View>
          <View className="bg-gray-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Hospital</Text>
          </View>
        </View>

        <View className="space-y-2">
          {renderInfoRow("medkit-outline", "Type", item.hospitalType)}
          {renderInfoRow("pulse-outline", "Departments", item.departments?.join(", "))}
          {renderInfoRow("alert-circle-outline", "24/7 Emergency", item.emergency247 ? "Available" : "Not Available")}
          {renderInfoRow("call-outline", "Contact", item.contactNo)}
          {renderInfoRow("location-outline", "Location", item.location)}
          {renderInfoRow("time-outline", "Visiting Hours", item.visitingHours)}
          {renderInfoRow("earth-outline", "Web Site", item.website)}
          {renderInfoRow("add-circle-outline", "Ambulance No", item.ambulanceNo)}
          {renderInfoRow("time-outline", "Last Update", item.updatedAt.split("T")[0])}
        </View>
      </View>
    </View>
  )

  const renderLab = (item) => (
    <View className="bg-white rounded-2xl mb-6 shadow-lg border border-gray-100 overflow-hidden">
      {renderImageCarousel(item.images)}
      <View className="p-5">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.name}</Text>
            <View className="flex-row items-center">
              <View className="bg-gray-100 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="star" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-xs font-semibold">4.8</Text>
              </View>
              <Text className="text-gray-500 ml-2 text-xs">98 Reviews</Text>
            </View>
          </View>
          <View className="bg-gray-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Lab</Text>
          </View>
        </View>

        <View className="space-y-2">
          {renderInfoRow("flask-outline", "Tests Offered", item.testsOffered?.join(", "))}
          {renderInfoRow("home-outline", "Home Collection", item.homeSampleCollection ? "Available" : "Not Available")}
          {renderInfoRow("time-outline", "Open Hours", item.openHours)}
          {renderInfoRow("call-outline", "Contact", item.contactNo)}
          {renderInfoRow("earth-outline", "Web Site", item.website)}
          {renderInfoRow("location-outline", "Location", item.location)}

        </View>
      </View>
    </View>
  )

  const renderPharmacy = (item) => (
    <View className="bg-white rounded-2xl mb-6 shadow-lg border border-gray-100 overflow-hidden">
      {renderImageCarousel(item.images)}
      <View className="p-5">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.name}</Text>
            <View className="flex-row items-center">
              <View className="bg-gray-100 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="star" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-xs font-semibold">4.8</Text>
              </View>
              <Text className="text-gray-500 ml-2 text-xs">98 Reviews</Text>
            </View>
          </View>
          <View className="bg-gray-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Pharmacy</Text>
          </View>
        </View>

        <View className="space-y-2">
          {renderInfoRow("time-outline", "Open Hours", item.openHours)}
          {renderInfoRow("moon-outline", "24/7 Service", item.service247 ? "Available" : "Not Available")}
          {renderInfoRow("car-outline", "Delivery", item.deliveryAvailable ? "Available" : "Not Available")}
          {renderInfoRow("call-outline", "Contact", item.contactNo)}
          {renderInfoRow("location-outline", "Location", item.location)}
          {renderInfoRow("time-outline", "Last Update", item.updatedAt.split("T")[0])}

        </View>
      </View>
    </View>
  )

  const renderRestaurant = (item) => (
    <View className="bg-white rounded-2xl mb-6 shadow-lg border border-gray-100 overflow-hidden">
      {renderImageCarousel(item.photos, "photos")}
      <View className="p-5">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.name}</Text>
            <View className="flex-row items-center">
              <View className="bg-gray-100 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="star" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-xs font-semibold">4.8</Text>
              </View>
              <Text className="text-gray-500 ml-2 text-xs">98 Reviews</Text>
            </View>
          </View>
          <View className="bg-gray-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Restaurant</Text>
          </View>
        </View>

        <View className="space-y-2">
          {renderInfoRow("restaurant-outline", "Cuisine", item.cuisineTypes?.join(", "))}
          {renderInfoRow("menu-outline", "Menu Highlights", item.menuHighlights)}
          {renderInfoRow("cash-outline", "Price Range", item.priceRange)}
          {renderInfoRow("cash-outline", "Delivary Portals", item.deliveryPortals)}
          {renderInfoRow("call-outline", "Phone", item.contactInfo.phone)}
      {renderInfoRow("mail-outline", "Email", item.contactInfo.email)}
                {renderInfoRow("time-outline", "Open Hours", item.openingHours)}
          {renderInfoRow("location-outline", "Location", item.location)}
        </View>
      </View>
    </View>
  )

  const renderSaloon = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("people-outline", "Gender Served", item.genderServed)}
      {renderInfoRow("cut-outline", "Services", item.services?.join(", "))}
      {renderInfoRow("cash-outline", "Price List", item.priceList)}
      {renderInfoRow("time-outline", "Working Days", item.workingDays)}
      {renderInfoRow("bookmark-outline", "Appoinments Need", item.appointmentNeeded ? "Yes" : "No")}
      {renderInfoRow("call-outline", "Phone", item.contactInfo.phone)}
      {renderInfoRow("earth-outline", "Social Media", item.contactInfo.socialMedia)}
      {renderInfoRow("location-outline", "Location", item.location)}

      {renderInfoRow("time-outline", "Last Update", item.updatedAt.split("T")[0])}

    </View>
  )

  const renderSpa = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("sparkles-outline", "Services", item.services?.join(", "))}
      {renderInfoRow("people-outline", "Gender Served", item.genderServed)}
      {renderInfoRow("time-outline", "Experience", item.experience)}
      {renderInfoRow("location-outline", "Location", item.location)}
    </View>
  )

  const renderSupermarket = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("storefront-outline", "Store Type", item.storeType)}
      {renderInfoRow("card-outline", "Payment Method", item.paymentMethods)}
      {renderInfoRow("time-outline", "Open Now", item.isOpenNow ? "Yes" : "No")}
      {renderInfoRow("bicycle-outline", "Delivery", item.deliveryAvailable ? "Yes" : "No")}
      {renderInfoRow("car-outline", "Parking", item.parkingAvailable ? "Yes" : "No")}
      {renderInfoRow("time-outline", "24/7 Open", item.is24HourOpen ? "Yes" : "No")}
      {renderInfoRow("location-outline", "Location", item.location)}
    </View>
  )

  const renderAyurveda = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.centreName}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("leaf-outline", "Service Info", item.serviceInfo)}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
      {renderInfoRow("time-outline", "Opeaning Hours", item.openingHours)}
      {renderInfoRow("calendar-outline", "Last Update", item.updatedAt.split("T")[0])}

    </View>
  )

  const renderBridalMakeup = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, "photos")}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("sparkles-outline", "Services", item.services?.join(", "))}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
    </View>
  )

  const renderClothing = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("shirt-outline", "Type", item.type)}
      {renderInfoRow("planet-outline", "Style", item.style)}
      {renderInfoRow("cash-outline", "Price Ranges", item.priceRanges)}
      {renderInfoRow("trending-down-outline", "Offers", item.offers)}
      {renderInfoRow("time-outline", "Open Hours", item.openHours)}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
      {renderInfoRow("mail-outline", "Email", item.contactInfo?.email)}
      {renderInfoRow("chevron-collapse-outline", "Return Policy", item.returnPolicy)}
    </View>
  )

  const renderDoctor = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("medkit-outline", "Specialty", item.specialty)}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("call-outline", "Contact", item.contactInfo)}
    </View>
  )

  const renderElectronics = (item) => (
  <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
    {renderImageCarousel(item.photos, "photos")}
    <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
    <View className="flex-row items-center mb-2">
      <Ionicons name="star" size={16} color="#6b7280" />
      <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
    </View>
    {renderInfoRow("phone-portrait-outline", "Products Sold", item.productsSold?.join(", "))}
    {renderInfoRow("location-outline", "Location", item.location)}
    {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
    {renderInfoRow("book-outline", "Warrenty Info", item.warrantyInfo)}
    {renderInfoRow("file-tray-full-outline", "Brand", item.brandPurchases?.join(", "))}
    {renderInfoRow("cash-outline", "Price Range", item.priceRange)}
    {renderInfoRow("cube-outline", "Services Offered", item.servicesOffered?.join(", "))}
    {renderInfoRow("time-outline", "Opening Hours", item.contactInfo?.openingHours)}
    {renderInfoRow("truck-outline", "Delivery Options", item.deliveryOptions)}
    {renderInfoRow("build-outline", "Repair Services", item.repairServices ? 'Available' : 'Not Available')}
    {renderInfoRow("headset-outline", "Customer Support", item.customerSupportAvailability)}
    {renderInfoRow("star-outline", "Rating", item.rating)}
    {renderInfoRow("bag-handle-outline", "Online Shopping", item.onlineShopping ? 'Available' : 'Not Available')}
  </View>
  )

  const renderGym = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.images)}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("barbell-outline", "Services", item.services?.join(", "))}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
    </View>
  )

  const renderHardware = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, "photos")}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("construct-outline", "Categories", item.categories?.join(", "))}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("location-outline", "Location", item.stockStatus)}
      {renderInfoRow("location-outline", "Openning Hours", item.openingHours)}
      {renderInfoRow("location-outline", "Location", item.priceInfo)}
      {renderInfoRow("bicycle-outline", "Delivary Info", item.deliveryInfo)}   
      {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
    </View>
  )

  const renderHomeRepair = (item) => (
    <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
      {renderImageCarousel(item.photos, "photos")}
      <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">{item.serviceName}</Text>
      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-1 text-sm">4.8 ★ 98 Reviews</Text>
      </View>
      {renderInfoRow("construct-outline", "Subcategory", item.subcategory)}
      {renderInfoRow("location-outline", "Location", item.location)}
      {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
    </View>
  )

  const renderFunctions = {
    hospitals: renderHospital,
    labs: renderLab,
    pharmacies: renderPharmacy,
    restaurants: renderRestaurant,
    saloons: renderSaloon,
    spas: renderSpa,
    supermarkets: renderSupermarket,
    ayurveda: renderAyurveda,
    bridalMakeups: renderBridalMakeup,
    clothing: renderClothing,
    private: renderDoctor,
    electronics: renderElectronics,
    fitnesscenter: renderGym,
    hardware: renderHardware,
    homeRepairs: renderHomeRepair,
  }

  const renderItem = ({ item }) => {
    const renderFunc = renderFunctions[serviceKey]
    return renderFunc ? (
      renderFunc(item)
    ) : (
      <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
        <Text className="text-center text-gray-500 text-lg">Unsupported service type</Text>
      </View>
    )
  }

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
  )
}

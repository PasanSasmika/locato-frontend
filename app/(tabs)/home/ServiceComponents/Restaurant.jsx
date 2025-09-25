import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Restaurant({ item, screenWidth }) {
  const renderImageCarousel = (images, photosKey = "photos") => (
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
  );

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
    );

  return (
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
  );
}
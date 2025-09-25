import { View, Text, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Supermarket({ item, screenWidth }) {
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
  );
}
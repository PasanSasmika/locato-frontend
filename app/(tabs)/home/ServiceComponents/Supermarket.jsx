import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

export default function Supermarket({ item }) {
  const renderImageCarousel = (images) => (
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
    (Array.isArray(value) ? value.length > 0 : value !== "N/A") && (
      <View className="flex-row items-start mb-3 bg-gray-50 p-3 rounded-xl">
        <View className="bg-gray-200 p-2 rounded-full mr-3">
          <Ionicons name={icon} size={18} color="#374151" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</Text>
          <Text className="text-gray-800 text-sm font-medium leading-relaxed">{Array.isArray(value) ? value.join(', ') : value}</Text>
        </View>
      </View>
    );

  return (
    <View className="flex-1 bg-gray-100">
        <ScrollView className="p-4">
            <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
                {renderImageCarousel(item.images)}
                <Text className="text-2xl font-bold text-gray-800 mt-4 mb-2">{item.name}</Text>
                <View className="flex-row items-center mb-4">
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text className="text-gray-600 ml-2 text-base font-semibold">4.8 ★ 98 Reviews</Text>
                </View>

                {renderInfoRow("storefront-outline", "Store Type", item.storeType)}
                {renderInfoRow("location-outline", "Location", item.location)}
                {renderInfoRow("time-outline", "Store Hours", item.storeHours)}
                {renderInfoRow("call-outline", "Contact", item.contactInfo?.phone)}
                {renderInfoRow("card-outline", "Payment Methods", item.paymentMethods)}
                {renderInfoRow("bicycle-outline", "Delivery", item.deliveryAvailable ? "Yes" : "No")}
                {renderInfoRow("car-outline", "Parking", item.parkingAvailable ? "Yes" : "No")}
                {renderInfoRow("moon-outline", "24/7 Open", item.is24HourOpen ? "Yes" : "No")}
                {renderInfoRow("cart-outline", "Online Ordering", item.onlineOrdering ? "Yes" : "No")}
                {renderInfoRow("document-text-outline", "Description", item.description)}
            </View>

            {/* Map Area */}
            {item.coordinates?.coordinates && Array.isArray(item.coordinates.coordinates) && item.coordinates.coordinates.length >= 2 && (
            <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                Location on Map
                </Text>
                <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: Number(item.coordinates.coordinates[1]) || 0,
                        longitude: Number(item.coordinates.coordinates[0]) || 0,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    scrollEnabled={true}
                    zoomEnabled={true}
                >
                    <Marker
                    coordinate={{
                        latitude: Number(item.coordinates.coordinates[1]) || 0,
                        longitude: Number(item.coordinates.coordinates[0]) || 0,
                    }}
                    title={item.name || "Supermarket Location"}
                    pinColor="#2563EB"
                    />
                </MapView>
                </View>
                <View className="flex-row items-center mt-4">
                <Ionicons name="map-outline" size={20} color="#2563EB" />
                <Text className="text-gray-600 ml-2 font-medium">
                    Coordinates: {Number(item.coordinates.coordinates[1]) ? Number(item.coordinates.coordinates[1]).toFixed(4) : "N/A"},
                    {' '}{Number(item.coordinates.coordinates[0]) ? Number(item.coordinates.coordinates[0]).toFixed(4) : "N/A"}
                </Text>
                </View>
            </View>
            )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
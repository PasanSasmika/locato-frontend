import { View, Text, Image, ScrollView, StyleSheet } from "react-native"; // --- ADDED StyleSheet ---
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps"; // --- ADDED MapView, Marker ---

export default function Pharmacy({ item, screenWidth }) {
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
          {renderInfoRow("time-outline", "Last Update", item.updatedAt?.split("T")[0])}
        </View>
        
        {/* --- ADDED MAP AREA --- */}
        {item.coordinates?.coordinates && Array.isArray(item.coordinates.coordinates) && item.coordinates.coordinates.length >= 2 && (
          <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200 mt-4">
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
                  title={item.name || "Pharmacy Location"}
                  pinColor="#2563EB"
                />
              </MapView>
            </View>
            <View className="flex-row items-center mt-4">
              <Ionicons name="map-outline" size={20} color="#2563EB" />
              <Text className="text-gray-600 ml-2 font-medium">
                Coordinates: {Number(item.coordinates.coordinates[1]) ? Number(item.coordinates.coordinates[1]).toFixed(4) : "N/A"}, 
                {Number(item.coordinates.coordinates[0]) ? Number(item.coordinates.coordinates[0]).toFixed(4) : "N/A"}
              </Text>
            </View>
          </View>
        )}
        
      </View>
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
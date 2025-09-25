import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

export default function Ayurveda({ item, screenWidth }) {
  const renderImageCarousel = (images, photosKey = "images") => (
    <View className="relative">
      {images?.length > 0 && (
        <View>
          <View className="relative">
            <Image
              source={{ uri: images[0] }}
              className="w-full h-48 rounded-t-2xl"
              resizeMode="cover"
            />
          </View>
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 px-4"
            >
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
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            {label}
          </Text>
          <Text className="text-gray-800 text-sm font-medium leading-relaxed">
            {value}
          </Text>
        </View>
      </View>
    );

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="p-4">
        {/* Render Info Area */}
        <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
          {renderImageCarousel(item.images)}
          <Text className="text-2xl font-bold text-gray-800 mt-4 mb-2">
            {item.centreName}
          </Text>
          <View className="flex-row items-center mb-4">
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text className="text-gray-600 ml-2 text-base font-semibold">
              4.8 ★ 98 Reviews
            </Text>
          </View>
          {renderInfoRow("leaf-outline", "Service Info", item.serviceInfo)}
          {renderInfoRow("location-outline", "Location", item.location)}
          {renderInfoRow("call-outline", "Phone", item.contactInfo?.phone)}
          {renderInfoRow("time-outline", "Opening Hours", item.openingHours)}
          {renderInfoRow(
            "calendar-outline",
            "Last Update",
            item.updatedAt.split("T")[0]
          )}
        </View>

        {/* Map Area */}
        <View className="bg-white rounded-xl p-5 mb-5 shadow-lg border border-gray-200">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Location on Map
          </Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.coordinates?.coordinates[1] || 6.9271,
                longitude: item.coordinates?.coordinates[0] || 79.8612,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              <Marker
                coordinate={{
                  latitude: item.coordinates?.coordinates[1] || 6.9271,
                  longitude: item.coordinates?.coordinates[0] || 79.8612,
                }}
                title={item.centreName || "Ayurveda Centre"}
                pinColor="#2563EB"
              />
            </MapView>
          </View>
          <View className="flex-row items-center mt-4">
            <Ionicons name="map-outline" size={20} color="#2563EB" />
            <Text className="text-gray-600 ml-2 font-medium">
              Coordinates: {item.coordinates?.coordinates[1]?.toFixed(4) || "N/A"},{" "}
              {item.coordinates?.coordinates[0]?.toFixed(4) || "N/A"}
            </Text>
          </View>
        </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

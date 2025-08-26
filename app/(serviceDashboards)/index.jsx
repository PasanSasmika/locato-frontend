import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect, placeholder }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="px-4 py-3 border-b border-gray-200"
      onPress={() => {
        onSelect(item.value);
        setIsModalVisible(false);
      }}
    >
      <Text className="text-black">{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-4">
      <Text className="text-base text-black font-medium mb-1">{label}</Text>
      <TouchableOpacity
        className="bg-gray-100 rounded-md px-4 py-3"
        onPress={() => setIsModalVisible(true)}
      >
        <Text className={value ? 'text-black' : 'text-gray-500'}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center">
          <View className="bg-white rounded-lg mx-4 max-h-[50%]">
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              className="bg-colorA rounded-md py-3 items-center"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="text-black font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function ServiceForm() {
  const { user } = useAuthStore();
  const category = user.type;

  const [formData, setFormData] = useState({
    name: '',
    tutorName: '',
    subCategories: [],
    services: [],
    type: '',
    subjectStream: '',
    subject: '',
    genderServed: '',
    experience: '',
    certificateTherapist: false,
    serviceDuration: '',
    trainersAvailable: [],
    membershipPlans: [],
    facilities: [],
    ladiesTime: '',
    packages: [],
    advanceReceived: false,
    availableForWedding: false,
    samples: [],
    availabilityDate: [],
    cuisineTypes: [],
    menuHighlights: [],
    style: '',
    sizes: [],
    brandList: [],
    productSold: [],
    warrantyInfo: '',
    stockStatus: '',
    department: '',
    emergency24x7: false,
    ambulance: false,
    testOffered: [],
    sampleCollection: '',
    homeTreat: false,
    priceRange: { min: 0, max: 0 },
    approximateFee: 0,
    pricingMethod: '',
    priceList: [],
    discounts: [],
    offers: [],
    membershipDiscount: false,
    workingDays: [],
    openHours: '',
    availability: '',
    visitingHours: '',
    appointmentNeeded: false,
    walkInAllowed: false,
    bookingMethod: '',
    serviceMode: '',
    open247: false,
    deliveryAvailable: false,
    deliveryPortals: [],
    deliveryInfo: '',
    dineInTakeaway: '',
    paymentMethods: [],
    parkingAvailable: false,
    contactInfo: {
      phone: [],
      email: '',
      website: '',
      socialMedia: [],
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    areasCovered: [],
    languages: [],
    photos: [],
    description: '',
    nextUpdateDate: new Date(),
    rating: 0,
    reviews: [],
  });

  const [photosSelected, setPhotosSelected] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  const handleChange = (path, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (path, value) => {
    handleChange(path, value.split(',').map((s) => s.trim()));
  };

  const handleNumberChange = (path, value) => {
    handleChange(path, parseFloat(value) || 0);
  };

  const handleObjectArrayChange = (path, value, keys) => {
    const items = value.split(',').map((item) => {
      const parts = item.split('|');
      let obj = {};
      keys.forEach((key, index) => {
        obj[key] = parts[index] || '';
        if (key === 'price' || key === 'percentage')
          obj[key] = parseFloat(obj[key]) || 0;
        if (key === 'validUntil' || key === 'duration')
          obj[key] = parts[index] || '';
      });
      return obj;
    });
    handleChange(path, items);
  };

  const handleSocialMediaChange = (value) => {
    const items = value.split(',').map((item) => {
      const parts = item.split('|');
      return { platform: parts[0] || '', url: parts[1] || '' };
    });
    handleChange('contactInfo.socialMedia', items);
  };

  const handleReviewsChange = (value) => {
    const reviews = value.split(',').map((item) => {
      const parts = item.split('|');
      return {
        reviewer: parts[0] || '',
        comment: parts[1] || '',
        rating: parseFloat(parts[2]) || 0,
      };
    });
    handleChange('reviews', reviews);
  };

  const selectImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setCompressing(true);
        const compressedImages = [];
        for (const asset of result.assets) {
          const compressedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          const base64 = await FileSystem.readAsStringAsync(
            compressedImage.uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          compressedImages.push({
            uri: compressedImage.uri,
            base64,
          });
        }
        handleChange(
          'photos',
          compressedImages.map((img) => ({
            url: `data:image/jpeg;base64,${img.base64}`,
            caption: '',
          }))
        );
        setPhotosSelected(compressedImages);
        setCompressing(false);
      }
    } catch (err) {
      console.error('Image selection error:', err);
      Alert.alert('Error', 'Failed to select images');
      setCompressing(false);
    }
  };

  const selectLocation = async () => {
    setMapLoading(true);
    setIsMapVisible(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable location services in your device settings.');
      setMapLoading(false);
      setIsMapVisible(false);
      return;
    }

    let region = {
      latitude: 6.9271,
      longitude: 79.8612,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 5000,
      });
      region.latitude = location.coords.latitude;
      region.longitude = location.coords.longitude;
      console.log('Current Location:', location.coords);
    } catch (error) {
      console.warn('Location Error:', error.message);
      Alert.alert('Location Error', `Could not fetch current location: ${error.message}. Using default location.`);
    }

    console.log('Initial Region:', region);
    setInitialRegion(region);
    setSelectedLocation({
      latitude: formData.location.coordinates.lat !== 0
        ? formData.location.coordinates.lat
        : region.latitude,
      longitude: formData.location.coordinates.lng !== 0
        ? formData.location.coordinates.lng
        : region.longitude,
    });
    setMapLoading(false);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      handleChange('location.coordinates.lat', selectedLocation.latitude);
      handleChange('location.coordinates.lng', selectedLocation.longitude);
      console.log('Confirmed Location:', selectedLocation);
    }
    setIsMapVisible(false);
  };

  const handleSubmit = () => {
    Alert.alert('Form Submitted', JSON.stringify(formData, null, 2));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-white">
        <Modal
          visible={isMapVisible}
          animationType="slide"
          onRequestClose={() => setIsMapVisible(false)}
        >
          <View style={{ flex: 1 }}>
            {mapLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              isMapVisible && (
                <>
                  <MapView
                    style={{ flex: 1 }}
                    provider="google"
                    initialRegion={initialRegion}
                    onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                    onRegionChange={() => console.log('Map region changed')}
                    onError={(error) => console.log('MapView Error:', error)}
                  >
                    {selectedLocation && <Marker coordinate={selectedLocation} />}
                  </MapView>
                  <View className="absolute bottom-6 w-full px-6">
                    <TouchableOpacity
                      className="bg-colorA w-full rounded-xl py-4 items-center mb-2"
                      onPress={handleConfirmLocation}
                    >
                      <Text className="text-black font-bold text-lg">
                        Confirm Location
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-300 w-full rounded-xl py-4 items-center"
                      onPress={() => setIsMapVisible(false)}
                    >
                      <Text className="text-black font-bold text-lg">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )
            )}
          </View>
        </Modal>

        <ScrollView contentContainerClassName="px-6 py-6">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.push('(tabs)/profile/')}
              className="mr-4 p-1"
            >
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-serif font-medium text-black mb-4">
            Service Dashboard Form
          </Text>
          <Text className="text-lg text-gray-600 mb-6">Category: {category}</Text>

          {/* Common fields across most categories */}
          <Text className="text-base text-black font-medium mb-1">Name</Text>
          <TextInput
            className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
            value={formData.name}
            onChangeText={(v) => handleChange('name', v)}
            placeholder="Enter name"
          />

          {/* Conditional fields based on category */}
          {category === 'Tuition' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Tutor Name</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.tutorName}
                onChangeText={(v) => handleChange('tutorName', v)}
                placeholder="Enter tutor name"
              />
              <Text className="text-base text-black font-medium mb-1">Institute Name</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.name}
                onChangeText={(v) => handleChange('name', v)}
                placeholder="Enter institute name"
              />
              <Text className="text-base text-black font-medium mb-1">Class Type</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.subCategories.join(', ')}
                onChangeText={(v) => handleArrayChange('subCategories', v)}
                placeholder="Enter class types (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Subject Stream</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.subjectStream}
                onChangeText={(v) => handleChange('subjectStream', v)}
                placeholder="Enter subject stream"
              />
              <Text className="text-base text-black font-medium mb-1">Subject</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.subject}
                onChangeText={(v) => handleChange('subject', v)}
                placeholder="Enter subject"
              />
              <CustomDropdown
                label="Teaching Mode"
                value={formData.type}
                options={[
                  { label: 'Select teaching mode', value: '' },
                  { label: 'Online', value: 'Online' },
                  { label: 'In-Person', value: 'In-Person' },
                  { label: 'Hybrid', value: 'Hybrid' },
                ]}
                onSelect={(v) => handleChange('type', v)}
                placeholder="Select teaching mode"
              />
              <Text className="text-base text-black font-medium mb-1">Fee Range Min</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceRange.min.toString()}
                onChangeText={(v) => handleNumberChange('priceRange.min', v)}
                placeholder="Enter min fee"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Fee Range Max</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceRange.max.toString()}
                onChangeText={(v) => handleNumberChange('priceRange.max', v)}
                placeholder="Enter max fee"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Days / Times</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.workingDays.join(', ')}
                onChangeText={(v) => handleArrayChange('workingDays', v)}
                placeholder="Enter working days (comma separated)"
              />
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText Ved
              />
            </View>
          )}
          {category === 'Home Repair' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Service Name</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.name}
                onChangeText={(v) => handleChange('name', v)}
                placeholder="Enter service name"
              />
              <Text className="text-base text-black font-medium mb-1">Subcategory</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.subCategories.join(', ')}
                onChangeText={(v) => handleArrayChange('subCategories', v)}
                placeholder="Enter subcategories (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Type of Works</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter types of works (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Experiences</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.experience}
                onChangeText={(v) => handleChange('experience', v)}
                placeholder="Enter experiences"
              />
              <CustomDropdown
                label="Pricing Method"
                value={formData.pricingMethod}
                options={[
                  { label: 'Select pricing method', value: '' },
                  { label: 'Fixed', value: 'Fixed' },
                  { label: 'Hourly', value: 'Hourly' },
                  { label: 'Per Session', value: 'Per Session' },
                  { label: 'Subscription', value: 'Subscription' },
                ]}
                onSelect={(v) => handleChange('pricingMethod', v)}
                placeholder="Select pricing method"
              />
              <Text className="text-base text-black font-medium mb-1">Approximate Fee</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.approximateFee.toString()}
                onChangeText={(v) => handleNumberChange('approximateFee', v)}
                placeholder="Enter approximate fee"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Availability</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.availability}
                onChangeText={(v) => handleChange('availability', v)}
                placeholder="Enter availability"
              />
              <Text className="text-base text-black font-medium mb-1">Area Covered</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.areasCovered.join(', ')}
                onChangeText={(v) => handleArrayChange('areasCovered', v)}
                placeholder="Enter areas covered (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Language Spoken</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.languages.join(', ')}
                onChangeText={(v) => handleArrayChange('languages', v)}
                placeholder="Enter languages (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">24/7 Available</Text>
              <Switch
                value={formData.open247}
                onValueChange={(v) => handleChange('open247', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Supermarkets' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Store Type</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.type}
                onChangeText={(v) => handleChange('type', v)}
                placeholder="Enter store type"
              />
              <Text className="text-base text-black font-medium mb-1">Open Now</Text>
              <Switch
                value={formData.open247}
                onValueChange={(v) => handleChange('open247', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Delivery Available</Text>
              <Switch
                value={formData.deliveryAvailable}
                onValueChange={(v) => handleChange('deliveryAvailable', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Payment Methods</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.paymentMethods.join(', ')}
                onChangeText={(v) => handleArrayChange('paymentMethods', v)}
                placeholder="Enter payment methods (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Areas</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.areasCovered.join(', ')}
                onChangeText={(v) => handleArrayChange('areasCovered', v)}
                placeholder="Enter areas (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Categories Available</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.subCategories.join(', ')}
                onChangeText={(v) => handleArrayChange('subCategories', v)}
                placeholder="Enter categories available (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Parking Available</Text>
              <Switch
                value={formData.parkingAvailable}
                onValueChange={(v) => handleChange('parkingAvailable', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Offers Available</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.offers
                  .map((o) => `${o.description}|${o.validUntil}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('offers', v, ['description', 'validUntil'])
                }
                placeholder="Enter offers (description|validUntil, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Membership Discount</Text>
              <Switch
                value={formData.membershipDiscount}
                onValueChange={(v) => handleChange('membershipDiscount', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Open Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter open hours"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Electronics' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Product Sold</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.productSold.join(', ')}
                onChangeText={(v) => handleArrayChange('productSold', v)}
                placeholder="Enter products sold (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Service Offered</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter services offered (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Warranty Info</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.warrantyInfo}
                onChangeText={(v) => handleChange('warrantyInfo', v)}
                placeholder="Enter warranty info"
              />
              <Text className="text-base text-black font-medium mb-1">Brand Purchases</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.brandList.join(', ')}
                onChangeText={(v) => handleArrayChange('brandList', v)}
                placeholder="Enter brands (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Open Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter open hours"
              />
            </View>
          )}
          {category === 'Hardware' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Categories</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.subCategories.join(', ')}
                onChangeText={(v) => handleArrayChange('subCategories', v)}
                placeholder="Enter categories (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Brand List</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.brandList.join(', ')}
                onChangeText={(v) => handleArrayChange('brandList', v)}
                placeholder="Enter brands (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Delivery Info</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.deliveryInfo}
                onChangeText={(v) => handleChange('deliveryInfo', v)}
                placeholder="Enter delivery info"
              />
              <CustomDropdown
                label="Stock Status"
                value={formData.stockStatus}
                options={[
                  { label: 'Select stock status', value: '' },
                  { label: 'In Stock', value: 'In Stock' },
                  { label: 'Out of Stock', value: 'Out of Stock' },
                  { label: 'Limited', value: 'Limited' },
]}
                onSelect={(v) => handleChange('stockStatus', v)}
                placeholder="Select stock status"
              />
              <Text className="text-base text-black font-medium mb-1">Opening Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter opening hours"
              />
              <Text className="text-base text-black font-medium mb-1">Discounts</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.discounts
                  .map((d) => `${d.description}|${d.percentage}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('discounts', v, ['description', 'percentage'])
                }
                placeholder="Enter discounts (description|percentage, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Price Info</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceList
                  .map((p) => `${p.service}|${p.price}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('priceList', v, ['service', 'price'])
                }
                placeholder="Enter price list (service|price, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
            </View>
          )}
          {category === 'Restaurant' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Cuisine Types</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.cuisineTypes.join(', ')}
                onChangeText={(v) => handleArrayChange('cuisineTypes', v)}
                placeholder="Enter cuisine types (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Menu Highlights</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.menuHighlights.join(', ')}
                onChangeText={(v) => handleArrayChange('menuHighlights', v)}
                placeholder="Enter menu highlights (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Price Range Min</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceRange.min.toString()}
                onChangeText={(v) => handleNumberChange('priceRange.min', v)}
                placeholder="Enter min price"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Price Range Max</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceRange.max.toString()}
                onChangeText={(v) => handleNumberChange('priceRange.max', v)}
                placeholder="Enter max price"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Delivery Portals</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.deliveryPortals.join(', ')}
                onChangeText={(v) => handleArrayChange('deliveryPortals', v)}
                placeholder="Enter delivery portals (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Opening</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter opening hours"
              />
              <CustomDropdown
                label="Dine-In/Takeaway"
                value={formData.dineInTakeaway}
                options={[
                  { label: 'Select option', value: '' },
                  { label: 'Dine-In', value: 'Dine-In' },
                  { label: 'Takeaway', value: 'Takeaway' },
                  { label: 'Both', value: 'Both' },
                ]}
                onSelect={(v) => handleChange('dineInTakeaway', v)}
                placeholder="Select option"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Clothing' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Type</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.type}
                onChangeText={(v) => handleChange('type', v)}
                placeholder="Enter type"
              />
              <Text className="text-base text-black font-medium mb-1">Style</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.style}
                onChangeText={(v) => handleChange('style', v)}
                placeholder="Enter style"
              />
              <Text className="text-base text-black font-medium mb-1">Price Range Min</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceRange.min.toString()}
                onChangeText={(v) => handleNumberChange('priceRange.min', v)}
                placeholder="Enter min price"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Price Range Max</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceRange.max.toString()}
                onChangeText={(v) => handleNumberChange('priceRange.max', v)}
                placeholder="Enter max price"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Sizes</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.sizes.join(', ')}
                onChangeText={(v) => handleArrayChange('sizes', v)}
                placeholder="Enter sizes (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Offers</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.offers
                  .map((o) => `${o.description}|${o.validUntil}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('offers', v, ['description', 'validUntil'])
                }
                placeholder="Enter offers (description|validUntil, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Open Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter open hours"
              />
              <Text className="text-base text-black font-medium mb-1">Areas</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.areasCovered.join(', ')}
                onChangeText={(v) => handleArrayChange('areasCovered', v)}
                placeholder="Enter areas (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Description</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.description}
                onChangeText={(v) => handleChange('description', v)}
                placeholder="Enter description"
                multiline
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Pharmacy' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Open Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter open hours"
              />
              <Text className="text-base text-black font-medium mb-1">24/7 Service</Text>
              <Switch
                value={formData.open247}
                onValueChange={(v) => handleChange('open247', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Delivery</Text>
              <Switch
                value={formData.deliveryAvailable}
                onValueChange={(v) => handleChange('deliveryAvailable', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Hospital' && (
            <View>
              <CustomDropdown
                label="Type"
                value={formData.type}
                options={[
                  { label: 'Select type', value: '' },
                  { label: 'Government', value: 'Government' },
                  { label: 'Private', value: 'Private' },
                ]}
                onSelect={(v) => handleChange('type', v)}
                placeholder="Select type"
              />
              <Text className="text-base text-black font-medium mb-1">Department</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.department}
                onChangeText={(v) => handleChange('department', v)}
                placeholder="Enter department"
              />
              <Text className="text-base text-black font-medium mb-1">24/7 Emergency</Text>
              <Switch
                value={formData.emergency24x7}
                onValueChange={(v) => handleChange('emergency24x7', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Ambulance</Text>
              <Switch
                value={formData.ambulance}
                onValueChange={(v) => handleChange('ambulance', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Visiting Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.visitingHours}
                onChangeText={(v) => handleChange('visitingHours', v)}
                placeholder="Enter visiting hours"
              />
              <Text className="text-base text-black font-medium mb-1">Website</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.contactInfo.website}
                onChangeText={(v) => handleChange('contactInfo.website', v)}
                placeholder="Enter website"
              />
            </View>
          )}
          {category === 'Private' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Specialty</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.department}
                onChangeText={(v) => handleChange('department', v)}
                placeholder="Enter specialty"
              />
              <CustomDropdown
                label="Contact/Appointment"
                value={formData.bookingMethod}
                options={[
                  { label: 'Select booking method', value: '' },
                  { label: 'Online', value: 'Online' },
                  { label: 'Phone', value: 'Phone' },
                  { label: 'In-Person', value: 'In-Person' },
                  { label: 'App', value: 'App' },
                ]}
                onSelect={(v) => handleChange('bookingMethod', v)}
                placeholder="Select booking method"
              />
              <Text className="text-base text-black font-medium mb-1">Availability</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.availability}
                onChangeText={(v) => handleChange('availability', v)}
                placeholder="Enter availability"
              />
              <Text className="text-base text-black font-medium mb-1">Language</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.languages.join(', ')}
                onChangeText={(v) => handleArrayChange('languages', v)}
                placeholder="Enter languages (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Home Treat</Text>
              <Switch
                value={formData.homeTreat}
                onValueChange={(v) => handleChange('homeTreat', v)}
                style={{ marginBottom: 16 }}
              />
            </View>
          )}
          {category === 'Labs' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Test Offered</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.testOffered.join(', ')}
                onChangeText={(v) => handleArrayChange('testOffered', v)}
                placeholder="Enter tests offered (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Sample Collection</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.sampleCollection}
                onChangeText={(v) => handleChange('sampleCollection', v)}
                placeholder="Enter sample collection info"
              />
              <Text className="text-base text-black font-medium mb-1">Open Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter open hours"
              />
            </View>
          )}
          {category === 'Ayurveda' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Centre Name</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.name}
                onChangeText={(v) => handleChange('name', v)}
                placeholder="Enter centre name"
              />
              <Text className="text-base text-black font-medium mb-1">Service Info</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter services (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Languages</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.languages.join(', ')}
                onChangeText={(v) => handleArrayChange('languages', v)}
                placeholder="Enter languages (comma separated)"
              />
            </View>
          )}
          {category === 'Saloon' && (
            <View>
              <CustomDropdown
                label="Gender Served"
                value={formData.genderServed}
                options={[
                  { label: 'Select gender served', value: '' },
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Unisex', value: 'Unisex' },
                ]}
                onSelect={(v) => handleChange('genderServed', v)}
                placeholder="Select gender served"
              />
              <Text className="text-base text-black font-medium mb-1">Services</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter services (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Price List</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceList
                  .map((p) => `${p.service}|${p.price}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('priceList', v, ['service', 'price'])
                }
                placeholder="Enter price list (service|price, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Working Days</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.workingDays.join(', ')}
                onChangeText={(v) => handleArrayChange('workingDays', v)}
                placeholder="Enter working days (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Appointment Needed</Text>
              <Switch
                value={formData.appointmentNeeded}
                onValueChange={(v) => handleChange('appointmentNeeded', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Walk-In Allowed</Text>
              <Switch
                value={formData.walkInAllowed}
                onValueChange={(v) => handleChange('walkInAllowed', v)}
                style={{ marginBottom: 16 }}
              />
              <CustomDropdown
                label="Service Mode"
                value={formData.serviceMode}
                options={[
                  { label: 'Select service mode', value: '' },
                  { label: 'Online', value: 'Online' },
                  { label: 'In-Person', value: 'In-Person' },
                  { label: 'Hybrid', value: 'Hybrid' },
                ]}
                onSelect={(v) => handleChange('serviceMode', v)}
                placeholder="Select service mode"
              />
              <Text className="text-base text-black font-medium mb-1">Languages</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.languages.join(', ')}
                onChangeText={(v) => handleArrayChange('languages', v)}
                placeholder="Enter languages (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Social Media</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.contactInfo.socialMedia
                  .map((s) => `${s.platform}|${s.url}`)
                  .join(', ')}
                onChangeText={handleSocialMediaChange}
                placeholder="Enter social media (platform|url, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Spa' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Services</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter services (comma separated)"
              />
              <CustomDropdown
                label="Gender"
                value={formData.genderServed}
                options={[
                  { label: 'Select gender served', value: '' },
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Unisex', value: 'Unisex' },
                ]}
                onSelect={(v) => handleChange('genderServed', v)}
                placeholder="Select gender served"
              />
              <Text className="text-base text-black font-medium mb-1">Experience</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.experience}
                onChangeText={(v) => handleChange('experience', v)}
                placeholder="Enter experience"
              />
              <Text className="text-base text-black font-medium mb-1">Certificate Therapist</Text>
              <Switch
                value={formData.certificateTherapist}
                onValueChange={(v) => handleChange('certificateTherapist', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Service Duration</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.serviceDuration}
                onChangeText={(v) => handleChange('serviceDuration', v)}
                placeholder="Enter service duration"
              />
              <Text className="text-base text-black font-medium mb-1">Prices</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceList
                  .map((p) => `${p.service}|${p.price}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('priceList', v, ['service', 'price'])
                }
                placeholder="Enter prices (service|price, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Facilities</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.facilities.join(', ')}
                onChangeText={(v) => handleArrayChange('facilities', v)}
                placeholder="Enter facilities (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Working Hours</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.openHours}
                onChangeText={(v) => handleChange('openHours', v)}
                placeholder="Enter working hours"
              />
              <CustomDropdown
                label="Booking Method"
                value={formData.bookingMethod}
                options={[
                  { label: 'Select booking method', value: '' },
                  { label: 'Online', value: 'Online' },
                  { label: 'Phone', value: 'Phone' },
                  { label: 'In-Person', value: 'In-Person' },
                  { label: 'App', value: 'App' },
                ]}
                onSelect={(v) => handleChange('bookingMethod', v)}
                placeholder="Select booking method"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Fitness Center' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Service</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter services (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Trainers Available</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.trainersAvailable.join(', ')}
                onChangeText={(v) => handleArrayChange('trainersAvailable', v)}
                placeholder="Enter trainers (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Membership Plans</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.membershipPlans
                  .map((m) => `${m.name}|${m.price}|${m.duration}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('membershipPlans', v, [
                    'name',
                    'price',
                    'duration',
                  ])
                }
                placeholder="Enter plans (name|price|duration, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Facilities</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.facilities.join(', ')}
                onChangeText={(v) => handleArrayChange('facilities', v)}
                placeholder="Enter facilities (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Ladies Time</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.ladiesTime}
                onChangeText={(v) => handleChange('ladiesTime', v)}
                placeholder="Enter ladies time"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}
          {category === 'Bridle makeup/ Beauty care' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Service</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.services.join(', ')}
                onChangeText={(v) => handleArrayChange('services', v)}
                placeholder="Enter services (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Packages</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.packages
                  .map((p) => `${p.name}|${p.description}|${p.price}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('packages', v, [
                    'name',
                    'description',
                    'price',
                  ])
                }
                placeholder="Enter packages (name|description|price, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Prices</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.priceList
                  .map((p) => `${p.service}|${p.price}`)
                  .join(', ')}
                onChangeText={(v) =>
                  handleObjectArrayChange('priceList', v, ['service', 'price'])
                }
                placeholder="Enter prices (service|price, ...)"
              />
              <Text className="text-base text-black font-medium mb-1">Advance Received</Text>
              <Switch
                value={formData.advanceReceived}
                onValueChange={(v) => handleChange('advanceReceived', v)}
                style={{ marginBottom: 16 }}
              />
              <CustomDropdown
                label="Service Mode"
                value={formData.serviceMode}
                options={[
                  { label: 'Select service mode', value: '' },
                  { label: 'Online', value: 'Online' },
                  { label: 'In-Person', value: 'In-Person' },
                  { label: 'Hybrid', value: 'Hybrid' },
                ]}
                onSelect={(v) => handleChange('serviceMode', v)}
                placeholder="Select service mode"
              />
              <Text className="text-base text-black font-medium mb-1">Experience</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.experience}
                onChangeText={(v) => handleChange('experience', v)}
                placeholder="Enter experience"
              />
              <Text className="text-base text-black font-medium mb-1">Available for Wedding</Text>
              <Switch
                value={formData.availableForWedding}
                onValueChange={(v) => handleChange('availableForWedding', v)}
                style={{ marginBottom: 16 }}
              />
              <Text className="text-base text-black font-medium mb-1">Samples</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.samples.join(', ')}
                onChangeText={(v) => handleArrayChange('samples', v)}
                placeholder="Enter samples (comma separated)"
              />
              <Text className="text-base text-black font-medium mb-1">Availability Date</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.availabilityDate.join(', ')}
                onChangeText={(v) => handleArrayChange('availabilityDate', v)}
                placeholder="Enter availability dates (comma separated)"
              />
              <CustomDropdown
                label="Gender"
                value={formData.genderServed}
                options={[
                  { label: 'Select gender served', value: '' },
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Unisex', value: 'Unisex' },
                ]}
                onSelect={(v) => handleChange('genderServed', v)}
                placeholder="Select gender served"
              />
              <Text className="text-base text-black font-medium mb-1">Rating</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.rating.toString()}
                onChangeText={(v) => handleNumberChange('rating', v)}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
              />
              <Text className="text-base text-black font-medium mb-1">Reviews</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                value={formData.reviews
                  .map((r) => `${r.reviewer}|${r.comment}|${r.rating}`)
                  .join(', ')}
                onChangeText={(v) => handleReviewsChange(v)}
                placeholder="Enter reviews (reviewer|comment|rating, ...)"
                multiline
              />
            </View>
          )}

          {/* Location Fields */}
          <Text className="text-base text-black font-medium mb-1">Location</Text>
          <TextInput
            className="bg-gray-100 rounded-md px-4 py-3 mb-2 text-black"
            value={formData.location.address}
            onChangeText={(v) => handleChange('location.address', v)}
            placeholder="Enter address"
          />
          <TextInput
            className="bg-gray-100 rounded-md px-4 py-3 mb-2 text-black"
            value={formData.location.city}
            onChangeText={(v) => handleChange('location.city', v)}
            placeholder="Enter city"
          />
          <TextInput
            className="bg-gray-100 rounded-md px-4 py-3 mb-2 text-black"
            value={formData.location.state}
            onChangeText={(v) => handleChange('location.state', v)}
            placeholder="Enter state"
          />
          <TextInput
            className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
            value={formData.location.country}
            onChangeText={(v) => handleChange('location.country', v)}
            placeholder="Enter country"
          />
          <Text className="text-sm text-gray-500 mb-2">
            Coordinates: Lat: {formData.location.coordinates.lat.toFixed(4)}, Lng:{' '}
            {formData.location.coordinates.lng.toFixed(4)}
          </Text>
          <TouchableOpacity
            className="bg-colorA rounded-xl py-3 mb-4 items-center"
            onPress={selectLocation}
          >
            <Text className="text-black font-bold">Select Location on Map</Text>
          </TouchableOpacity>

          {/* Contact Info */}
          {category !== 'Ayurveda' && (
            <View>
              <Text className="text-base text-black font-medium mb-1">Contact Info</Text>
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-2 text-black"
                value={formData.contactInfo.phone.join(', ')}
                onChangeText={(v) => handleArrayChange('contactInfo.phone', v)}
                placeholder="Enter phone numbers (comma separated)"
              />
              <TextInput
                className="bg-gray-100 rounded-md px-4 py-3 mb-2 text-black"
                value={formData.contactInfo.email}
                onChangeText={(v) => handleChange('contactInfo.email', v)}
                placeholder="Enter email"
              />
              {(category === 'Hospital' || category === 'Saloon') && (
                <TextInput
                  className="bg-gray-100 rounded-md px-4 py-3 mb-2 text-black"
                  value={formData.contactInfo.website}
                  onChangeText={(v) => handleChange('contactInfo.website', v)}
                  placeholder="Enter website"
                />
              )}
              {category === 'Saloon' && (
                <TextInput
                  className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                  value={formData.contactInfo.socialMedia
                    .map((s) => `${s.platform}|${s.url}`)
                    .join(', ')}
                  onChangeText={handleSocialMediaChange}
                  placeholder="Enter social media (platform|url, ...)"
                />
              )}
            </View>
          )}

          {/* Images */}
          {category !== 'Private' &&
            category !== 'Hospital' &&
            category !== 'Labs' && (
              <View>
                <Text className="text-base text-black font-medium mb-1">Images</Text>
                <TouchableOpacity
                  className="bg-colorA rounded-xl py-3 mb-2 items-center"
                  onPress={selectImages}
                  disabled={compressing}
                >
                  {compressing ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text className="text-black font-bold">Select Images</Text>
                  )}
                </TouchableOpacity>
                <Text className="text-gray-600 mb-4">
                  Selected: {photosSelected.length}
                </Text>
              </View>
            )}

          {/* Description */}
          {category !== 'Hospital' &&
            category !== 'Private' &&
            category !== 'Labs' &&
            category !== 'Ayurveda' && (
              <View>
                <Text className="text-base text-black font-medium mb-1">Description</Text>
                <TextInput
                  className="bg-gray-100 rounded-md px-4 py-3 mb-4 text-black"
                  value={formData.description}
                  onChangeText={(v) => handleChange('description', v)}
                  placeholder="Enter description"
                  multiline
                />
              </View>
            )}

          <Text className="text-base text-black font-medium mb-1">
            Next Update Date
          </Text>
          <TextInput
            className="bg-gray-100 rounded-md px-4 py-3 mb-6 text-black"
            value={new Date(formData.nextUpdateDate).toISOString().split('T')[0]}
            onChangeText={(v) => handleChange('nextUpdateDate', v)}
            placeholder="Enter next update date (YYYY-MM-DD)"
          />

          <TouchableOpacity
            className="bg-colorA w-full rounded-xl py-4 items-center"
            onPress={handleSubmit}
          >
            <Text className="text-black font-bold text-lg">Submit Form</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

// Reusable FormField Component
const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, editable = true }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <TextInput
      className={`bg-gray-100 rounded-xl p-4 text-black ${multiline ? 'h-24' : ''} ${!editable ? 'bg-gray-200 text-gray-500' : ''}`}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      editable={editable}
    />
  </View>
);

// Reusable SwitchField Component
const SwitchField = ({ label, value, onValueChange }) => (
  <View className="flex-row justify-between items-center bg-white p-4 rounded-xl mb-4">
    <Text className="text-gray-600 font-medium text-base">{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={value ? '#2563EB' : '#9CA3AF'}
      trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
    />
  </View>
);

// Reusable DynamicListField Component for simple string arrays
const DynamicListField = ({ label, items, onUpdateItems, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      onUpdateItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    onUpdateItems(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
      {items.map((item, index) => (
        <View key={index} className="flex-row justify-between items-center bg-gray-200 p-3 rounded-lg mb-2">
          <Text className="text-black text-base">{item}</Text>
          <TouchableOpacity onPress={() => handleRemoveItem(index)}>
            <Ionicons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <View className="flex-row items-center mt-2">
        <TextInput
          className="flex-1 bg-gray-100 rounded-xl p-4 text-black"
          value={newItem}
          onChangeText={setNewItem}
          placeholder={placeholder || `Add a new ${label.slice(0, -1).toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          className="bg-colorA px-4 py-2 rounded-xl ml-2"
          onPress={handleAddItem}
        >
          <Text className="text-black font-bold">Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Reusable ComplexListField Component for objects
const ComplexListField = ({ label, items, onUpdateItems, fields, placeholder }) => {
  const [newItem, setNewItem] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const handleAddItem = () => {
    const isValid = fields.every(field => {
      if (field.required && !newItem[field.name].trim()) return false;
      if (field.type === 'number' && newItem[field.name] && isNaN(newItem[field.name])) return false;
      if (field.type === 'date' && newItem[field.name] && isNaN(new Date(newItem[field.name]).getTime())) return false;
      return true;
    });

    if (isValid) {
      onUpdateItems([...items, { ...newItem }]);
      setNewItem(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
    } else {
      Alert.alert('Error', 'Please fill all required fields correctly.');
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    onUpdateItems(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
      {items.map((item, index) => (
        <View key={index} className="bg-gray-200 p-3 rounded-lg mb-2">
          {fields.map((field, fieldIndex) => (
            <Text key={fieldIndex} className="text-black text-base">
              {field.label}: {item[field.name] || 'N/A'}
            </Text>
          ))}
          <TouchableOpacity
            className="absolute top-2 right-2"
            onPress={() => handleRemoveItem(index)}
          >
            <Ionicons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <View className="mt-2">
        {fields.map((field, fieldIndex) => (
          <FormField
            key={fieldIndex}
            label={field.label}
            value={newItem[field.name]}
            onChangeText={(val) => setNewItem(prev => ({ ...prev, [field.name]: val }))}
            placeholder={placeholder || `Enter ${field.label.toLowerCase()}`}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            multiline={field.multiline}
          />
        ))}
        <TouchableOpacity
          className="bg-colorB px-4 py-2 rounded-xl mt-2"
          onPress={handleAddItem}
        >
          <Text className="text-black font-bold text-center">Add {label.slice(0, -1)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Reusable LocationPicker Component
const LocationPicker = ({ location, onLocationChange }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">Location</Text>
    <View className="bg-white p-4 rounded-xl mb-4 flex-row items-center justify-between">
      <TouchableOpacity className="bg-colorB px-4 py-2 rounded-xl">
        <Text className="text-black font-bold">Pin Location on Map</Text>
      </TouchableOpacity>
      <View>
        <Text className="text-gray-600 text-sm">Lat: {location.coordinates.lat || 'Not set'}</Text>
        <Text className="text-gray-600 text-sm">Lng: {location.coordinates.lng || 'Not set'}</Text>
      </View>
    </View>
    <FormField
      label="Address"
      value={location.address}
      onChangeText={(val) => onLocationChange('address', val)}
      multiline
    />
    <FormField
      label="City"
      value={location.city}
      onChangeText={(val) => onLocationChange('city', val)}
    />
    <FormField
      label="State"
      value={location.state}
      onChangeText={(val) => onLocationChange('state', val)}
    />
    <FormField
      label="Country"
      value={location.country}
      onChangeText={(val) => onLocationChange('country', val)}
    />
    <View className="flex-row space-x-4 gap-2">
      <View className="flex-1">
        <FormField
          label="Latitude"
          value={location.coordinates.lat}
          onChangeText={(val) => onLocationChange('coordinates.lat', val)}
          keyboardType="numeric"
        />
      </View>
      <View className="flex-1">
        <FormField
          label="Longitude"
          value={location.coordinates.lng}
          onChangeText={(val) => onLocationChange('coordinates.lng', val)}
          keyboardType="numeric"
        />
      </View>
    </View>
  </View>
);

// Reusable ImageUploader Component with compression
const ImageUploader = ({ photos, onPhotosChange }) => {
  const [compressing, setCompressing] = useState(false);

  const handleFileSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setCompressing(true);
        const asset = result.assets[0];
        const compressedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const newPhotos = [{
          url: compressedImage.uri,
          caption: asset.fileName || `Image ${photos.length + 1}`,
          base64: `data:image/jpeg;base64,${base64}`,
        }];
        onPhotosChange([...photos, ...newPhotos]);
        setCompressing(false);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      Alert.alert('Error', 'Failed to process image');
      setCompressing(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    onPhotosChange(photos.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-600 mb-2 font-medium">Photos</Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {photos.map((photo, index) => (
          <View key={index} className="relative w-20 h-20">
            <Image
              source={{ uri: photo.url }}
              className="w-full h-full rounded-xl border border-gray-200"
            />
            <Text className="text-gray-600 text-xs mt-1">{photo.caption}</Text>
            <TouchableOpacity
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center shadow-sm"
              onPress={() => handleRemoveImage(index)}
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity
        className={`border-2 border-dashed border-colorA rounded-2xl p-5 items-center justify-center bg-gray-50 ${compressing ? 'opacity-70' : ''}`}
        onPress={handleFileSelect}
        disabled={compressing}
      >
        {compressing ? (
          <ActivityIndicator color="#000" />
        ) : (
          <View className="items-center">
            <Text className="text-gray-800 font-semibold text-base">
              {photos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
            </Text>
            <Text className="text-gray-500 text-xs mt-1 text-center">
              e.g., Service Images
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Reusable SectionHeader Component
const SectionHeader = ({ title }) => (
  <Text className="text-xl font-semibold text-black mt-6 mb-3">{title}</Text>
);

// Main ServiceForm Component
export default function ServiceForm() {
  const { categoryName } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const scrollViewRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: categoryName || 'General Service',
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
    priceRange: { min: '', max: '' },
    approximateFee: '',
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
      email: user?.email || '',
      website: '',
      socialMedia: [],
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: { lat: '', lng: '' },
    },
    areasCovered: [],
    languages: [],
    photos: [],
    description: '',
    rating: { average: '', count: '' },
    reviews: [],
    nextUpdateDate: '',
  });

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, email: user.email } }));
    }
  }, [user]);

  const handleChange = (field, value) => {
    const fields = field.split('.');
    if (fields.length > 2) {
      setFormData(prev => ({
        ...prev,
        [fields[0]]: {
          ...prev[fields[0]],
          [fields[1]]: {
            ...prev[fields[0]][fields[1]],
            [fields[2]]: value,
          },
        },
      }));
    } else if (fields.length > 1) {
      setFormData(prev => ({
        ...prev,
        [fields[0]]: {
          ...prev[fields[0]],
          [fields[1]]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLocationChange = (field, value) => {
    const fields = field.split('.');
    if (fields.length > 1) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [fields[1]]: value,
          },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('Service Name is required.');
      return false;
    }
    if (!formData.category) {
      setError('Category is required.');
      return false;
    }
    if (!formData.nextUpdateDate) {
      setError('Next Update Date is required.');
      return false;
    }
    if (formData.contactInfo.email && !/^\S+@\S+\.\S+$/.test(formData.contactInfo.email)) {
      setError('Please enter a valid email.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        photos: formData.photos.map(photo => ({
          url: photo.base64,
          caption: photo.caption,
        })),
      };
      await axios.post(
        'https://locato-backend-wxjj.onrender.com/api/service/serviceReq',
        requestData
      );
      setFormData({
        ...formData,
        name: '',
        category: categoryName || 'General Service',
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
        priceRange: { min: '', max: '' },
        approximateFee: '',
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
          email: user?.email || '',
          website: '',
          socialMedia: [],
        },
        location: {
          address: '',
          city: '',
          state: '',
          country: '',
          coordinates: { lat: '', lng: '' },
        },
        areasCovered: [],
        languages: [],
        photos: [],
        description: '',
        rating: { average: '', count: '' },
        reviews: [],
        nextUpdateDate: '',
      });
      Alert.alert('Success', 'Service request submitted successfully!');
      router.back();
    } catch (err) {
      console.error('Submission error:', err);
      if (err.response?.status === 400 && err.response.data?.message?.includes('email')) {
        setError('This email is already registered');
      } else {
        setError(err.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollViewRef} contentContainerClassName="p-6">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.push('(tabs)/profile/')} className="mr-4 p-1">
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <View>
              <Text className="text-3xl font-bold text-black">Create a New Service</Text>
              <Text className="text-base text-gray-500 mt-1">For {formData.category}</Text>
            </View>
          </View>

          {error ? (
            <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-200">
              <Text className="text-red-600 text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {/* General Information */}
          <SectionHeader title="General Information" />
          <FormField
            label="Service Name *"
            value={formData.name}
            onChangeText={(val) => handleChange('name', val)}
          />
          <FormField
            label="Category *"
            value={formData.category}
            onChangeText={(val) => handleChange('category', val)}
            editable={false}
          />
          <DynamicListField label="Sub-Categories" items={formData.subCategories} onUpdateItems={(val) => handleChange('subCategories', val)} />
          <DynamicListField label="Services Offered" items={formData.services} onUpdateItems={(val) => handleChange('services', val)} />
          <FormField label="Description" value={formData.description} onChangeText={(val) => handleChange('description', val)} multiline />
          <FormField label="Experience" value={formData.experience} onChangeText={(val) => handleChange('experience', val)} placeholder="e.g., 5+ years" />
          <DynamicListField label="Languages Spoken" items={formData.languages} onUpdateItems={(val) => handleChange('languages', val)} />

          {/* Contact Information */}
          <SectionHeader title="Contact Information" />
          <DynamicListField label="Phone Numbers" items={formData.contactInfo.phone} onUpdateItems={(val) => handleChange('contactInfo.phone', val)} />
          <FormField
            label="Email"
            value={formData.contactInfo.email}
            onChangeText={(val) => handleChange('contactInfo.email', val)}
            keyboardType="email-address"
            editable={false}
          />
          <FormField label="Website" value={formData.contactInfo.website} onChangeText={(val) => handleChange('contactInfo.website', val)} />
          <ComplexListField
            label="Social Media"
            items={formData.contactInfo.socialMedia}
            onUpdateItems={(val) => handleChange('contactInfo.socialMedia', val)}
            fields={[
              { name: 'platform', label: 'Platform', required: true },
              { name: 'url', label: 'URL', required: true },
            ]}
          />

          {/* Location & Coverage */}
          <SectionHeader title="Location & Coverage" />
          <LocationPicker location={formData.location} onLocationChange={handleLocationChange} />
          <DynamicListField label="Areas Covered" items={formData.areasCovered} onUpdateItems={(val) => handleChange('areasCovered', val)} />

          {/* Pricing & Payment */}
          <SectionHeader title="Pricing & Payment" />
          <FormField label="Pricing Method" value={formData.pricingMethod} onChangeText={(val) => handleChange('pricingMethod', val)} />
          <View className="flex-row space-x-4 gap-2">
            <View className="flex-1">
              <FormField
                label="Min Price (LKR)"
                value={formData.priceRange.min}
                onChangeText={(val) => handleChange('priceRange.min', val)}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Max Price (LKR)"
                value={formData.priceRange.max}
                onChangeText={(val) => handleChange('priceRange.max', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
          <FormField
            label="Approximate Fee (LKR)"
            value={formData.approximateFee}
            onChangeText={(val) => handleChange('approximateFee', val)}
            keyboardType="numeric"
          />
          <ComplexListField
            label="Price List"
            items={formData.priceList}
            onUpdateItems={(val) => handleChange('priceList', val)}
            fields={[
              { name: 'service', label: 'Service', required: true },
              { name: 'price', label: 'Price', type: 'number', required: true },
            ]}
          />
          <ComplexListField
            label="Discounts"
            items={formData.discounts}
            onUpdateItems={(val) => handleChange('discounts', val)}
            fields={[
              { name: 'description', label: 'Description', required: true },
              { name: 'percentage', label: 'Percentage', type: 'number', required: true },
            ]}
          />
          <ComplexListField
            label="Offers"
            items={formData.offers}
            onUpdateItems={(val) => handleChange('offers', val)}
            fields={[
              { name: 'description', label: 'Description', required: true },
              { name: 'validUntil', label: 'Valid Until', type: 'date', required: true },
            ]}
          />
          <DynamicListField label="Payment Methods" items={formData.paymentMethods} onUpdateItems={(val) => handleChange('paymentMethods', val)} />
          <SwitchField
            label="Membership Discount Available?"
            value={formData.membershipDiscount}
            onValueChange={(val) => handleChange('membershipDiscount', val)}
          />

          {/* Availability & Booking */}
          <SectionHeader title="Availability & Booking" />
          <FormField
            label="Opening Hours"
            value={formData.openHours}
            onChangeText={(val) => handleChange('openHours', val)}
            placeholder="e.g., 9:00 AM - 5:00 PM"
          />
          <DynamicListField label="Working Days" items={formData.workingDays} onUpdateItems={(val) => handleChange('workingDays', val)} />
          <FormField
            label="Availability"
            value={formData.availability}
            onChangeText={(val) => handleChange('availability', val)}
            placeholder="e.g., Weekends only"
          />
          <FormField
            label="Visiting Hours"
            value={formData.visitingHours}
            onChangeText={(val) => handleChange('visitingHours', val)}
            placeholder="e.g., 10:00 AM - 2:00 PM"
          />
          <SwitchField label="Open 24/7?" value={formData.open247} onValueChange={(val) => handleChange('open247', val)} />
          <SwitchField label="Appointment Needed?" value={formData.appointmentNeeded} onValueChange={(val) => handleChange('appointmentNeeded', val)} />
          <SwitchField label="Walk-ins Allowed?" value={formData.walkInAllowed} onValueChange={(val) => handleChange('walkInAllowed', val)} />
          <FormField label="Booking Method" value={formData.bookingMethod} onChangeText={(val) => handleChange('bookingMethod', val)} />
          <FormField
            label="Next Update Date *"
            value={formData.nextUpdateDate}
            onChangeText={(val) => handleChange('nextUpdateDate', val)}
            placeholder="YYYY-MM-DD"
          />

          {/* Service Specifics */}
          <SectionHeader title="Service Specifics" />
          <FormField
            label="Service Type"
            value={formData.type}
            onChangeText={(val) => handleChange('type', val)}
            placeholder="e.g., Private, Online, Store"
          />
          <FormField
            label="Gender Served"
            value={formData.genderServed}
            onChangeText={(val) => handleChange('genderServed', val)}
            placeholder="e.g., Unisex"
          />
          <FormField
            label="Service Mode"
            value={formData.serviceMode}
            onChangeText={(val) => handleChange('serviceMode', val)}
            placeholder="e.g., Online, In-Person, Hybrid"
          />
          <SwitchField label="Delivery Available?" value={formData.deliveryAvailable} onValueChange={(val) => handleChange('deliveryAvailable', val)} />
          <FormField label="Delivery Info" value={formData.deliveryInfo} onChangeText={(val) => handleChange('deliveryInfo', val)} />
          <DynamicListField label="Delivery Portals" items={formData.deliveryPortals} onUpdateItems={(val) => handleChange('deliveryPortals', val)} />
          <FormField
            label="Dine-In/Takeaway"
            value={formData.dineInTakeaway}
            onChangeText={(val) => handleChange('dineInTakeaway', val)}
            placeholder="e.g., Dine-In, Takeaway, Both"
          />
          <SwitchField label="Parking Available?" value={formData.parkingAvailable} onValueChange={(val) => handleChange('parkingAvailable', val)} />
          <SwitchField label="Advance Received?" value={formData.advanceReceived} onValueChange={(val) => handleChange('advanceReceived', val)} />
          <SwitchField label="Available for Wedding?" value={formData.availableForWedding} onValueChange={(val) => handleChange('availableForWedding', val)} />
          <DynamicListField label="Samples" items={formData.samples} onUpdateItems={(val) => handleChange('samples', val)} />
          <DynamicListField label="Availability Dates" items={formData.availabilityDate} onUpdateItems={(val) => handleChange('availabilityDate', val)} />

          {/* Tutoring Details */}
          <SectionHeader title="Tutoring Details" />
          <FormField label="Subject Stream" value={formData.subjectStream} onChangeText={(val) => handleChange('subjectStream', val)} />
          <FormField label="Subject" value={formData.subject} onChangeText={(val) => handleChange('subject', val)} />

          {/* Health & Wellness Details */}
          <SectionHeader title="Health & Wellness Details" />
          <SwitchField
            label="Certified Therapist?"
            value={formData.certificateTherapist}
            onValueChange={(val) => handleChange('certificateTherapist', val)}
          />
          <FormField label="Service Duration" value={formData.serviceDuration} onChangeText={(val) => handleChange('serviceDuration', val)} />
          <SwitchField label="24/7 Emergency?" value={formData.emergency24x7} onValueChange={(val) => handleChange('emergency24x7', val)} />
          <SwitchField label="Ambulance Available?" value={formData.ambulance} onValueChange={(val) => handleChange('ambulance', val)} />
          <SwitchField label="Home Treatment Available?" value={formData.homeTreat} onValueChange={(val) => handleChange('homeTreat', val)} />
          <DynamicListField label="Tests Offered" items={formData.testOffered} onUpdateItems={(val) => handleChange('testOffered', val)} />
          <FormField label="Sample Collection" value={formData.sampleCollection} onChangeText={(val) => handleChange('sampleCollection', val)} />
          <DynamicListField label="Facilities" items={formData.facilities} onUpdateItems={(val) => handleChange('facilities', val)} />

          {/* Retail & Product Details */}
          <SectionHeader title="Retail & Product Details" />
          <DynamicListField label="Brands" items={formData.brandList} onUpdateItems={(val) => handleChange('brandList', val)} />
          <DynamicListField label="Products Sold" items={formData.productSold} onUpdateItems={(val) => handleChange('productSold', val)} />
          <FormField label="Warranty Info" value={formData.warrantyInfo} onChangeText={(val) => handleChange('warrantyInfo', val)} />
          <FormField label="Stock Status" value={formData.stockStatus} onChangeText={(val) => handleChange('stockStatus', val)} />
          <FormField label="Department" value={formData.department} onChangeText={(val) => handleChange('department', val)} />
          <DynamicListField label="Sizes" items={formData.sizes} onUpdateItems={(val) => handleChange('sizes', val)} />
          <FormField label="Style" value={formData.style} onChangeText={(val) => handleChange('style', val)} />

          {/* Restaurant Details */}
          <SectionHeader title="Restaurant Details" />
          <DynamicListField label="Cuisine Types" items={formData.cuisineTypes} onUpdateItems={(val) => handleChange('cuisineTypes', val)} />
          <DynamicListField label="Menu Highlights" items={formData.menuHighlights} onUpdateItems={(val) => handleChange('menuHighlights', val)} />

          {/* Gym & Event Details */}
          <SectionHeader title="Gym & Event Details" />
          <DynamicListField label="Trainers Available" items={formData.trainersAvailable} onUpdateItems={(val) => handleChange('trainersAvailable', val)} />
          <ComplexListField
            label="Membership Plans"
            items={formData.membershipPlans}
            onUpdateItems={(val) => handleChange('membershipPlans', val)}
            fields={[
              { name: 'name', label: 'Plan Name', required: true },
              { name: 'price', label: 'Price', type: 'number', required: true },
              { name: 'duration', label: 'Duration', required: true },
            ]}
          />
          <FormField label="Ladies Time" value={formData.ladiesTime} onChangeText={(val) => handleChange('ladiesTime', val)} />
          <ComplexListField
            label="Packages"
            items={formData.packages}
            onUpdateItems={(val) => handleChange('packages', val)}
            fields={[
              { name: 'name', label: 'Package Name', required: true },
              { name: 'description', label: 'Description', multiline: true },
              { name: 'price', label: 'Price', type: 'number', required: true },
            ]}
          />

          {/* Ratings & Reviews */}
          <SectionHeader title="Ratings & Reviews" />
          <View className="flex-row space-x-4 gap-2">
            <View className="flex-1">
              <FormField
                label="Average Rating"
                value={formData.rating.average}
                onChangeText={(val) => handleChange('rating.average', val)}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Rating Count"
                value={formData.rating.count}
                onChangeText={(val) => handleChange('rating.count', val)}
                keyboardType="numeric"
              />
            </View>
          </View>
          <ComplexListField
            label="Reviews"
            items={formData.reviews}
            onUpdateItems={(val) => handleChange('reviews', val)}
            fields={[
              { name: 'user', label: 'User', required: true },
              { name: 'comment', label: 'Comment', multiline: true },
              { name: 'rating', label: 'Rating', type: 'number', required: true },
              { name: 'date', label: 'Date', type: 'date', required: true },
            ]}
          />

          {/* Photos & Media */}
          <SectionHeader title="Photos & Media" />
          <ImageUploader photos={formData.photos} onPhotosChange={(val) => handleChange('photos', val)} />

          <TouchableOpacity
            className="bg-colorA w-full rounded-xl py-4 items-center mt-8"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-bold text-lg">Save Service</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
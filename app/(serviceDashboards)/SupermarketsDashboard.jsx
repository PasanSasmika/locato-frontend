import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// Reusable Components
const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <TextInput
      className={`bg-gray-100 rounded-xl p-4 text-black border border-gray-200 ${multiline ? 'h-36' : ''}`}
      placeholder={placeholder} placeholderTextColor="#9CA3AF" value={value}
      onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const SelectionField = ({ label, options, selectedValue, onSelect }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity key={option} onPress={() => onSelect(option)} className={`px-4 py-2 rounded-full border ${selectedValue === option ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}>
          <Text className={`font-medium ${selectedValue === option ? 'text-white' : 'text-gray-700'}`}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const DynamicListField = ({ label, placeholder, items, onAddItem, onRemoveItem, setItem, item }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <View className="flex-row gap-2 items-center mb-2">
      <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border border-gray-200" placeholder={placeholder} value={item} onChangeText={setItem} />
      <TouchableOpacity onPress={onAddItem} className="bg-blue-500 p-3 rounded-full h-14 w-14 justify-center items-center">
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
    <View className="flex-row flex-wrap gap-2">
      {items.map((val, index) => (
        <View key={index} className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
          <Text className="text-blue-800">{val}</Text>
          <TouchableOpacity onPress={() => onRemoveItem(index)} className="ml-2">
            <Ionicons name="close-circle" size={18} color="red" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  </View>
);

// Main Component
export default function CreateSupermarket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    storeType: '',
    isOpenNow: null,
    deliveryAvailable: null,
    paymentMethods: [],
    areasCovered: [],
    rating: 0,
    categoriesAvailable: [],
    parkingAvailable: null,
    offersAvailable: '',
    is24HourOpen: null,
    membershipDiscount: '',
    contactInfo: { phone: '', email: '', socialMedia: '' },
    description: '',
    nextUpdateDate: '',
    location: '',
    images: [],
    storeHours: '',
    loyaltyProgram: '',
    onlineOrdering: null,
  });

  const [tempItem, setTempItem] = useState({ paymentMethod: '', area: '', category: '' });

  const handleChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = (listName, item) => {
    if (item.trim()) {
      setFormData(prev => ({ ...prev, [listName]: [...prev[listName], item.trim()] }));
      return true;
    }
    return false;
  };

  const handleRemoveItem = (listName, index) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets) {
        setLoading(true);
        const processedImages = [];
        for (const asset of result.assets) {
          const compressed = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          processedImages.push(`data:image/jpeg;base64,${base64}`);
        }
        setFormData(prev => ({ ...prev, images: [...prev.images, ...processedImages] }));
        setLoading(false);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process images.');
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Supermarket name is required.');
      return false;
    }
    if (!formData.storeType) {
      setError('Store type is required.');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required.');
      return false;
    }
    if (!formData.contactInfo.phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const submissionData = {
      ...formData,
      isOpenNow: formData.isOpenNow === 'Yes',
      deliveryAvailable: formData.deliveryAvailable === 'Yes',
      parkingAvailable: formData.parkingAvailable === 'Yes',
      is24HourOpen: formData.is24HourOpen === 'Yes',
      onlineOrdering: formData.onlineOrdering === 'Yes',
    };
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/supermarkets';
      await axios.post(API_URL, submissionData);
      Alert.alert('Success!', 'Supermarket listing has been created.');
      router.back();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="p-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add New Supermarket</Text>
          </View>
          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Basic Information</Text>
            <FormField label="Name" placeholder="e.g., FreshMart" value={formData.name} onChangeText={v => handleChange('name', v)} />
            <SelectionField label="Store Type" options={['Grocery', 'Hypermarket', 'Convenience', 'Specialty', 'Other']} selectedValue={formData.storeType} onSelect={v => handleChange('storeType', v)} />
            <FormField label="Location" placeholder="e.g., Colombo 5" value={formData.location} onChangeText={v => handleChange('location', v)} />
            <FormField label="Description" multiline={true} placeholder="e.g., Your one-stop shop for fresh groceries" value={formData.description} onChangeText={v => handleChange('description', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Services & Operations</Text>
            <SelectionField label="Open Now" options={['Yes', 'No']} selectedValue={formData.isOpenNow} onSelect={v => handleChange('isOpenNow', v)} />
            <SelectionField label="Delivery Available" options={['Yes', 'No']} selectedValue={formData.deliveryAvailable} onSelect={v => handleChange('deliveryAvailable', v)} />
            <DynamicListField label="Payment Methods" placeholder="e.g., Credit Card" items={formData.paymentMethods} item={tempItem.paymentMethod} setItem={v => setTempItem(p => ({ ...p, paymentMethod: v }))} onAddItem={() => { if (handleAddItem('paymentMethods', tempItem.paymentMethod)) setTempItem(p => ({ ...p, paymentMethod: '' })); }} onRemoveItem={(i) => handleRemoveItem('paymentMethods', i)} />
            <DynamicListField label="Areas Covered" placeholder="e.g., Colombo" items={formData.areasCovered} item={tempItem.area} setItem={v => setTempItem(p => ({ ...p, area: v }))} onAddItem={() => { if (handleAddItem('areasCovered', tempItem.area)) setTempItem(p => ({ ...p, area: '' })); }} onRemoveItem={(i) => handleRemoveItem('areasCovered', i)} />
            <DynamicListField label="Categories Available" placeholder="e.g., Fresh Produce" items={formData.categoriesAvailable} item={tempItem.category} setItem={v => setTempItem(p => ({ ...p, category: v }))} onAddItem={() => { if (handleAddItem('categoriesAvailable', tempItem.category)) setTempItem(p => ({ ...p, category: '' })); }} onRemoveItem={(i) => handleRemoveItem('categoriesAvailable', i)} />
            <SelectionField label="Parking Available" options={['Yes', 'No']} selectedValue={formData.parkingAvailable} onSelect={v => handleChange('parkingAvailable', v)} />
            <SelectionField label="24/7 Open" options={['Yes', 'No']} selectedValue={formData.is24HourOpen} onSelect={v => handleChange('is24HourOpen', v)} />
            <SelectionField label="Online Ordering" options={['Yes', 'No']} selectedValue={formData.onlineOrdering} onSelect={v => handleChange('onlineOrdering', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Offers & Contact</Text>
            <FormField label="Offers Available" multiline={true} placeholder="e.g., Buy 1 Get 1 Free on Dairy" value={formData.offersAvailable} onChangeText={v => handleChange('offersAvailable', v)} />
            <FormField label="Membership Discount" placeholder="e.g., 10% off for members" value={formData.membershipDiscount} onChangeText={v => handleChange('membershipDiscount', v)} />
            <FormField label="Loyalty Program" multiline={true} placeholder="e.g., Earn points for every purchase" value={formData.loyaltyProgram} onChangeText={v => handleChange('loyaltyProgram', v)} />
            <FormField label="Store Hours" placeholder="e.g., Mon-Sun 8AM-10PM" value={formData.storeHours} onChangeText={v => handleChange('storeHours', v)} />
            <FormField label="Contact Phone" placeholder="Enter phone number" value={formData.contactInfo.phone} onChangeText={v => handleChange('contactInfo.phone', v)} keyboardType="phone-pad" />
            <FormField label="Contact Email" placeholder="e.g., contact@freshmart.com" value={formData.contactInfo.email} onChangeText={v => handleChange('contactInfo.email', v)} keyboardType="email-address" />
            <FormField label="Social Media" placeholder="e.g., instagram.com/freshmart" value={formData.contactInfo.socialMedia} onChangeText={v => handleChange('contactInfo.socialMedia', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Additional Details</Text>
            <FormField label="Next Update Date" placeholder="YYYY-MM-DD" value={formData.nextUpdateDate} onChangeText={v => handleChange('nextUpdateDate', v)} />
            <Text className="text-gray-600 mb-2 font-medium">Photos</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Tap to upload photos</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.images.map((uri, index) => (
                <View key={index} className="relative mr-3">
                  <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                  <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-blue-600 w-full rounded-xl py-4 items-center mt-4">
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Supermarket Listing</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
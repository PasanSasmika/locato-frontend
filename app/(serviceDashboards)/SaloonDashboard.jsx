import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// Reusable Components (No changes needed)
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
export default function CreateSaloon() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    genderServed: '',
    services: [],
    priceList: '',
    workingDays: [],
    appointmentNeeded: null,
    walkInAllowed: null,
    serviceModes: [],
    contactInfo: { phone: '', socialMedia: '' },
    location: '',
    languages: [],
    images: [],
    nextUpdateDate: '',
  });

  const [tempItem, setTempItem] = useState({ service: '', day: '', language: '', mode: '' });

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
encoding: 'base64',          });
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
    // Placeholder validation logic (unchanged as per request)
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const submissionData = {
      ...formData,
      appointmentNeeded: formData.appointmentNeeded === 'Yes',
      walkInAllowed: formData.walkInAllowed === 'Yes',
    };
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/saloons';
      await axios.post(API_URL, submissionData);
      Alert.alert('Success!', 'Saloon has been created.');
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
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add New Saloon</Text>
          </View>
          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Basic Information</Text>
            <FormField label="Name" placeholder="e.g., Crown Hair & Beauty" value={formData.name} onChangeText={v => handleChange('name', v)} />
            <FormField label="Location" placeholder="e.g., Colombo 5" value={formData.location} onChangeText={v => handleChange('location', v)} />
            <SelectionField label="Gender Served" options={['Male', 'Female', 'Unisex']} selectedValue={formData.genderServed} onSelect={v => handleChange('genderServed', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Services & Pricing</Text>
            <DynamicListField label="Services Offered" placeholder="e.g., Haircut" items={formData.services} item={tempItem.service} setItem={v => setTempItem(p => ({ ...p, service: v }))} onAddItem={() => { if (handleAddItem('services', tempItem.service)) setTempItem(p => ({ ...p, service: '' })); }} onRemoveItem={(i) => handleRemoveItem('services', i)} />
            <FormField label="Price List" multiline={true} placeholder="e.g., Haircut: LKR 1000&#x0a;Shave: LKR 500" value={formData.priceList} onChangeText={v => handleChange('priceList', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Operations & Contact</Text>
            <DynamicListField label="Working Days" placeholder="e.g., Monday" items={formData.workingDays} item={tempItem.day} setItem={v => setTempItem(p => ({ ...p, day: v }))} onAddItem={() => { if (handleAddItem('workingDays', tempItem.day)) setTempItem(p => ({ ...p, day: '' })); }} onRemoveItem={(i) => handleRemoveItem('workingDays', i)} />
            <SelectionField label="Appointment Needed" options={['Yes', 'No']} selectedValue={formData.appointmentNeeded} onSelect={v => handleChange('appointmentNeeded', v)} />
            <SelectionField label="Walk-ins Allowed" options={['Yes', 'No']} selectedValue={formData.walkInAllowed} onSelect={v => handleChange('walkInAllowed', v)} />
            <DynamicListField label="Service Modes" placeholder="e.g., Home Visits" items={formData.serviceModes} item={tempItem.mode} setItem={v => setTempItem(p => ({ ...p, mode: v }))} onAddItem={() => { if (handleAddItem('serviceModes', tempItem.mode)) setTempItem(p => ({ ...p, mode: '' })); }} onRemoveItem={(i) => handleRemoveItem('serviceModes', i)} />
            <FormField label="Contact Details" placeholder="Enter phone number" value={formData.contactInfo.phone} onChangeText={v => handleChange('contactInfo.phone', v)} keyboardType="phone-pad" />
            <FormField label="Social Media" placeholder="e.g., instagram.com/saloon" value={formData.contactInfo.socialMedia} onChangeText={v => handleChange('contactInfo.socialMedia', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Other Details</Text>
            <DynamicListField label="Languages Spoken" placeholder="e.g., English" items={formData.languages} item={tempItem.language} setItem={v => setTempItem(p => ({ ...p, language: v }))} onAddItem={() => { if (handleAddItem('languages', tempItem.language)) setTempItem(p => ({ ...p, language: '' })); }} onRemoveItem={(i) => handleRemoveItem('languages', i)} />
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
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Saloon Listing</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
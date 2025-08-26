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
      className={`bg-gray-100 rounded-xl p-4 text-black border border-gray-200 ${multiline ? 'h-28' : ''}`}
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
      <TextInput className="flex-1 bg-gray-100 rounded-xl p-4 text-black border-gray-200" placeholder={placeholder} value={item} onChangeText={setItem} />
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
export default function CreateAyurveda() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    centreName: '',
    serviceInfo: '',
    languages: [],
    location: '',
    contactInfo: { phone: '', email: '', website: '' },
    openingHours: '',
    practitioners: [],
    treatmentsOffered: [],
    facilities: [],
    priceRange: '',
    appointmentRequired: null,
    emergencyCare: null,
    specialPackages: [],
    certifications: [],
    images: [],
    nextUpdateDate: '',
  });

  const [tempItem, setTempItem] = useState({ lang: '', practitioner: '', treatment: '', facility: '', package: '', certification: '' });

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
    return true; // Fixed: Corrected 'return Opened true' to 'return true'
  }
  return false;
};

  const handleRemoveItem = (listName, index) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use MediaTypeOptions
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
    const requiredFields = ['centreName', 'location', 'contactInfo.phone', 'openingHours'];
    for (const field of requiredFields) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!formData[parent][child]) {
          setError(`Please provide ${child.charAt(0).toUpperCase() + child.slice(1)} in Contact Info.`);
          return false;
        }
      } else if (!formData[field]) {
        setError(`Please provide ${field.charAt(0).toUpperCase() + field.slice(1)}.`);
        return false;
      }
    }
    if (formData.appointmentRequired === null) {
      setError('Please specify if an appointment is required.');
      return false;
    }
    if (formData.emergencyCare === null) {
      setError('Please specify if emergency care is available.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const submissionData = {
      ...formData,
      appointmentRequired: formData.appointmentRequired === 'Yes',
      emergencyCare: formData.emergencyCare === 'Yes',
    };
    try {
      const API_URL = 'https://locato-backend-wxjj.onrender.com/api/ayurveda';
      const response = await axios.post(API_URL, submissionData);
      if (response.status === 201) {
        Alert.alert('Success!', 'Ayurveda Centre has been created.');
        router.back();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while submitting.');
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
            <Text className="text-3xl font-bold text-gray-800 ml-2">Add Ayurveda Centre</Text>
          </View>
          {error && <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-200">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>}

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Basic Information</Text>
            <FormField label="Centre Name" placeholder="e.g., Ayurvedic Wellness Centre" value={formData.centreName} onChangeText={v => handleChange('centreName', v)} />
            <FormField label="Location" placeholder="e.g., Colombo 7" value={formData.location} onChangeText={v => handleChange('location', v)} />
            <FormField label="Service Info / Description" multiline={true} placeholder="Describe services offered" value={formData.serviceInfo} onChangeText={v => handleChange('serviceInfo', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Contact & Hours</Text>
            <FormField label="Contact No." placeholder="Enter phone number" value={formData.contactInfo.phone} onChangeText={v => handleChange('contactInfo.phone', v)} keyboardType="phone-pad" />
            <FormField label="Email" placeholder="e.g., contact@centre.com" value={formData.contactInfo.email} onChangeText={v => handleChange('contactInfo.email', v)} keyboardType="email-address" />
            <FormField label="Website" placeholder="e.g., https://centre.lk" value={formData.contactInfo.website} onChangeText={v => handleChange('contactInfo.website', v)} keyboardType="url" />
            <FormField label="Opening Hours" placeholder="e.g., 8:00 AM - 6:00 PM" value={formData.openingHours} onChangeText={v => handleChange('openingHours', v)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Services & Treatments</Text>
            <SelectionField label="Appointment Required" options={['Yes', 'No']} selectedValue={formData.appointmentRequired} onSelect={v => handleChange('appointmentRequired', v)} />
            <SelectionField label="Emergency Care Available" options={['Yes', 'No']} selectedValue={formData.emergencyCare} onSelect={v => handleChange('emergencyCare', v)} />
            <FormField label="Price Range" placeholder="e.g., LKR 5,000 - 15,000" value={formData.priceRange} onChangeText={v => handleChange('priceRange', v)} />
            <DynamicListField label="Treatments Offered" placeholder="e.g., Panchakarma" items={formData.treatmentsOffered} item={tempItem.treatment} setItem={v => setTempItem(prev => ({ ...prev, treatment: v }))} onAddItem={() => { if (handleAddItem('treatmentsOffered', tempItem.treatment)) setTempItem(prev => ({ ...prev, treatment: '' })); }} onRemoveItem={(i) => handleRemoveItem('treatmentsOffered', i)} />
            <DynamicListField label="Practitioners" placeholder="e.g., Dr. Perera" items={formData.practitioners} item={tempItem.practitioner} setItem={v => setTempItem(prev => ({ ...prev, practitioner: v }))} onAddItem={() => { if (handleAddItem('practitioners', tempItem.practitioner)) setTempItem(prev => ({ ...prev, practitioner: '' })); }} onRemoveItem={(i) => handleRemoveItem('practitioners', i)} />
            <DynamicListField label="Special Packages" placeholder="e.g., 7-Day Detox" items={formData.specialPackages} item={tempItem.package} setItem={v => setTempItem(prev => ({ ...prev, package: v }))} onAddItem={() => { if (handleAddItem('specialPackages', tempItem.package)) setTempItem(prev => ({ ...prev, package: '' })); }} onRemoveItem={(i) => handleRemoveItem('specialPackages', i)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Facilities & Credentials</Text>
            <DynamicListField label="Facilities" placeholder="e.g., In-house Pharmacy" items={formData.facilities} item={tempItem.facility} setItem={v => setTempItem(prev => ({ ...prev, facility: v }))} onAddItem={() => { if (handleAddItem('facilities', tempItem.facility)) setTempItem(prev => ({ ...prev, facility: '' })); }} onRemoveItem={(i) => handleRemoveItem('facilities', i)} />
            <DynamicListField label="Languages Spoken" placeholder="e.g., English" items={formData.languages} item={tempItem.lang} setItem={v => setTempItem(prev => ({ ...prev, lang: v }))} onAddItem={() => { if (handleAddItem('languages', tempItem.lang)) setTempItem(prev => ({ ...prev, lang: '' })); }} onRemoveItem={(i) => handleRemoveItem('languages', i)} />
            <DynamicListField label="Certifications" placeholder="e.g., ISO 9001" items={formData.certifications} item={tempItem.certification} setItem={v => setTempItem(prev => ({ ...prev, certification: v }))} onAddItem={() => { if (handleAddItem('certifications', tempItem.certification)) setTempItem(prev => ({ ...prev, certification: '' })); }} onRemoveItem={(i) => handleRemoveItem('certifications', i)} />
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Text className="text-xl font-semibold text-gray-700 mb-4">Other Details</Text>
            <FormField label="Next Update Date" placeholder="YYYY-MM-DD" value={formData.nextUpdateDate} onChangeText={v => handleChange('nextUpdateDate', v)} />
            <Text className="text-gray-600 mb-2 font-medium">Images</Text>
            <TouchableOpacity onPress={pickImages} className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50 mb-4">
              <Ionicons name="cloud-upload-outline" size={40} color="gray" />
              <Text className="text-gray-500 mt-2">Tap to upload images</Text>
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
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-lg">Create Ayurveda Centre</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
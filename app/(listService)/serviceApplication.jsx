import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

const FormField = ({ label, value, onChangeText, keyboardType, multiline, editable = true }) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2 font-medium">{label}</Text>
    <TextInput
      className={`bg-gray-100 rounded-xl p-4 text-black ${
        multiline ? 'h-24' : ''
      } ${!editable ? 'bg-gray-200 text-gray-500' : ''}`}
      placeholder={`Enter ${label.toLowerCase()}`}
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

export default function ServiceApplication() {
  const { categoryName } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobileNo: '',
    nic: '',
    address: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setCompressing(true);
        setError('');
        const asset = result.assets[0];
        const compressedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImage({
          uri: compressedImage.uri,
          base64: base64,
        });
        setCompressing(false);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image');
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.mobileNo || !formData.nic || !formData.address) {
      setError('All fields are required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!image) {
      setError('Please upload an identity or proof of ownership document');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const imageData = `data:image/jpeg;base64,${image.base64}`;
      const requestData = {
        ...formData,
        serviceType: categoryName,
        Images: imageData,
      };
      await axios.post(
        'https://locato-backend-wxjj.onrender.com/api/service/serviceReq',
        requestData
      );
      setFormData({ email: user?.email || '', firstName: '', lastName: '', mobileNo: '', nic: '', address: '' });
      setImage(null);
      Alert.alert('Success', 'Service request submitted successfully!');
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView ref={scrollViewRef} contentContainerClassName="p-6">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <View>
              <Text className="text-3xl font-bold text-black">Service Application</Text>
              <Text className="text-base text-gray-500 mt-1">For {categoryName}</Text>
            </View>
          </View>

          {error ? (
            <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-200">
              <Text className="text-red-600 text-center font-medium">{error}</Text>
            </View>
          ) : null}

          <FormField
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            editable={false}
          />

          <View className="flex-row space-x-4 gap-2">
            <View className="flex-1">
              <FormField
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
              />
            </View>
          </View>
          
          <View className="flex-row space-x-4 gap-2">
            <View className="flex-1">
              <FormField
                label="Mobile Number"
                value={formData.mobileNo}
                onChangeText={(text) => handleChange('mobileNo', text)}
                keyboardType="phone-pad"
              />
            </View>
            <View className="flex-1">
              <FormField
                label="NIC Number"
                value={formData.nic}
                onChangeText={(text) => handleChange('nic', text)}
              />
            </View>
          </View>
          
          <FormField
            label="Full Address"
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            multiline={true}
          />

          <View className="mt-4">
            <Text className="text-gray-600 mb-2 font-medium">Proof Document</Text>
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity
                className={`flex-1 border-2 border-dashed border-colorA rounded-2xl p-5 items-center justify-center bg-gray-50 ${compressing ? 'opacity-70' : ''}`}
                onPress={pickImage}
                disabled={compressing}
              >
                {compressing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View className="items-center">
                    <Text className="text-gray-800 font-semibold text-base">
                      {image ? 'Change Document' : 'Upload Document'}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1 text-center">
                      e.g., National ID, Proof of Ownership
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {image && (
                <View className="relative w-20 h-20">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-full h-full rounded-xl border border-gray-200"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center shadow-sm"
                    onPress={removeImage}
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="bg-colorA w-full rounded-xl py-4 items-center mt-8"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-bold text-lg">Submit Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// components/MasterHabitsManager.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust path as needed
import { User } from 'firebase/auth'; // Import User type
import styles from '../app/styles/habits.styles'; // Re-use habits styles
import { CLASSIC_HABITS } from '../constants/habits';

// Define a list of common MaterialCommunityIcons for custom habits
const ICON_OPTIONS = [
  'star', 'heart', 'check-circle', 'calendar', 'run', 'dumbbell', 'book-open-outline',
  'food-apple-outline', 'meditation', 'sleep', 'water', 'pencil', 'palette', 'lightbulb',
  'emoticon-happy-outline', 'flower', 'leaf', 'tree', 'moon-waning-gibbous',
  'fire', 'trophy', 'rocket', 'puzzle', 'music', 'coffee', 'brush', 'spa',
  'brain', 'robot', 'laptop', 'camera', 'microphone', 'account-group', 'home-heart',
  'chart-line', 'cloud-sync', 'weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-snowy'
];

interface Habit {
  id: string;
  name: string;
  icon?: string;
  isCustom: boolean; // Explicitly define if it's a custom habit
}

interface MasterHabitsManagerProps {
  user: User | null;
  onClose: () => void; // Callback to close the modal
}

export default function MasterHabitsManager({ user, onClose }: MasterHabitsManagerProps) {
  const [selectedMasterHabitIds, setSelectedMasterHabitIds] = useState<string[]>([]); // Only store IDs in Firestore for master list
  const [allCustomHabitsPool, setAllCustomHabitsPool] = useState<Habit[]>([]); // User's pool of custom habits (full objects)
  const [newCustomHabitName, setNewCustomHabitName] = useState('');
  const [selectedCustomHabitIcon, setSelectedCustomHabitIcon] = useState('star'); // Default icon for new custom habits
  const [isLoading, setIsLoading] = useState(true);

  // Firestore collection references
  const masterHabitsCollection = collection(db, 'user_master_habits');
  const customHabitsPoolCollection = collection(db, 'user_custom_habits_pool');

  // Fetch the user's master list of habit IDs
  const fetchMasterHabitIds = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(masterHabitsCollection, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setSelectedMasterHabitIds(docData.habitIds || []);
      } else {
        setSelectedMasterHabitIds([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load your master habits list.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch the user's global pool of custom habit definitions
  const fetchCustomHabitsPool = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(customHabitsPoolCollection, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setAllCustomHabitsPool(docData.customHabits || []);
      } else {
        setAllCustomHabitsPool([]);
      }
    } catch (error) {
    }
  }, [user]);

  // Helper to update Firestore for master habits (only stores IDs)
  const updateMasterHabitIdsInFirestore = useCallback(async (updatedIds: string[]) => {
    if (!user) return;
    try {
      const userDocRef = doc(masterHabitsCollection, user.uid); // Use user.uid as doc ID
      await setDoc(userDocRef, { userId: user.uid, habitIds: updatedIds }, { merge: true });
      setSelectedMasterHabitIds(updatedIds); // Update local state
    } catch (error) {
      Alert.alert('Error', 'Failed to save master habits changes.');
    }
  }, [user]);

  // Helper to update Firestore for the custom habits pool
  const updateCustomHabitsPoolInFirestore = useCallback(async (updatedCustomHabits: Habit[]) => {
    if (!user) return;
    try {
      const userDocRef = doc(customHabitsPoolCollection, user.uid); // Use user.uid as doc ID
      await setDoc(userDocRef, { userId: user.uid, customHabits: updatedCustomHabits }, { merge: true });
      setAllCustomHabitsPool(updatedCustomHabits); // Update local state
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom habit changes.');
    }
  }, [user]);

  // Add a habit (by its ID) to the user's master list
  const addHabitToMasterList = useCallback(async (habitId: string) => {
    if (!user) return;
    if (selectedMasterHabitIds.includes(habitId)) {
      Alert.alert('Already Added', `This habit is already in your master list.`);
      return;
    }
    const updatedIds = [...selectedMasterHabitIds, habitId];
    await updateMasterHabitIdsInFirestore(updatedIds);
  }, [user, selectedMasterHabitIds, updateMasterHabitIdsInFirestore]);

  // Remove a habit (by its ID) from the user's master list
  const removeHabitFromMasterList = useCallback(async (habitId: string) => {
    if (!user) return;
    const updatedIds = selectedMasterHabitIds.filter(id => id !== habitId);
    await updateMasterHabitIdsInFirestore(updatedIds);
  }, [user, selectedMasterHabitIds, updateMasterHabitIdsInFirestore]);

  // Add a new custom habit to the user's global pool of custom habits
  const addNewCustomHabitToPool = useCallback(async () => {
    if (!user || !newCustomHabitName.trim()) {
      Alert.alert('Input Required', 'Please enter a name for your custom habit.');
      return;
    }

    const newHabitId = newCustomHabitName.trim().toLowerCase().replace(/\s/g, '_');
    // Check against custom pool and classic habits for ID collision
    if (allCustomHabitsPool.some(h => h.id === newHabitId) || CLASSIC_HABITS.some(h => h.id === newHabitId)) {
        Alert.alert('Duplicate Name', 'A habit with this name already exists (either custom or classic).');
        return;
    }

    const newHabit: Habit = {
      id: newHabitId,
      name: newCustomHabitName.trim(),
      isCustom: true,
      icon: selectedCustomHabitIcon // Use the selected icon
    };

    const updatedCustomHabitsPool = [...allCustomHabitsPool, newHabit];
    await updateCustomHabitsPoolInFirestore(updatedCustomHabitsPool);
    setNewCustomHabitName(''); // Clear input
    setSelectedCustomHabitIcon('star'); // Reset icon
  }, [user, newCustomHabitName, selectedCustomHabitIcon, allCustomHabitsPool, updateCustomHabitsPoolInFirestore]);

  // Delete a custom habit from the user's global pool of custom habits
  const deleteCustomHabitFromPool = useCallback(async (habitToDelete: Habit) => {
    if (!user || !habitToDelete.isCustom) return;

    Alert.alert(
      'Delete Custom Habit',
      `Are you sure you want to permanently delete "${habitToDelete.name}"? This will remove it from your custom habit options and your master list if it's there.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Remove from master list first if present
            const updatedMasterHabitIds = selectedMasterHabitIds.filter(id => id !== habitToDelete.id);
            if (updatedMasterHabitIds.length !== selectedMasterHabitIds.length) {
              await updateMasterHabitIdsInFirestore(updatedMasterHabitIds);
            }

            // Then remove from the custom habits pool
            const updatedCustomHabitsPool = allCustomHabitsPool.filter(h => h.id !== habitToDelete.id);
            await updateCustomHabitsPoolInFirestore(updatedCustomHabitsPool);
          }
        }
      ]
    );
  }, [user, selectedMasterHabitIds, allCustomHabitsPool, updateMasterHabitIdsInFirestore, updateCustomHabitsPoolInFirestore]);

  useEffect(() => {
    fetchMasterHabitIds();
    fetchCustomHabitsPool();
  }, [fetchMasterHabitIds, fetchCustomHabitsPool]); // Depend on memoized functions

  // Derive the full list of habits in the master list for display
  const masterHabitsForDisplay: Habit[] = useMemo(() => {
    return selectedMasterHabitIds.map(habitId => {
      const classic = CLASSIC_HABITS.find(h => h.id === habitId);
      if (classic) return classic;
      const custom = allCustomHabitsPool.find(h => h.id === habitId);
      if (custom) return custom;
      return { id: habitId, name: `Unknown Habit (${habitId})`, icon: 'alert-circle', isCustom: false }; // Fallback
    }).filter(Boolean) as Habit[];
  }, [selectedMasterHabitIds, allCustomHabitsPool]);

  // Render functions for FlatList items
  const renderMasterHabitItem = useCallback(({ item }: { item: Habit }) => (
    <View style={styles.masterHabitItem}>
      <MaterialCommunityIcons name={item.icon || 'circle-outline'} size={20} color="#333" />
      <Text style={styles.masterHabitName}>{item.name} {item.isCustom && '(Custom)'}</Text>
      <TouchableOpacity
        onPress={() => removeHabitFromMasterList(item.id)}
        style={[styles.addRemoveMasterHabitButton, styles.removeMasterHabitButton]}
      >
        <MaterialCommunityIcons name="minus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  ), [removeHabitFromMasterList]);

  const renderClassicHabitItem = useCallback(({ item }: { item: Habit }) => (
    <View style={styles.masterHabitItem}>
      <MaterialCommunityIcons name={item.icon || 'circle-outline'} size={20} color="#007AFF" />
      <Text style={styles.masterHabitName}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => addHabitToMasterList(item.id)}
        style={[styles.addRemoveMasterHabitButton, styles.addMasterHabitButton]}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  ), [addHabitToMasterList]);

  const renderCustomHabitPoolItem = useCallback(({ item }: { item: Habit }) => (
    <View style={styles.habitOptionWithDelete}>
        <TouchableOpacity
          style={styles.customHabitOption}
          onPress={() => addHabitToMasterList(item.id)}
        >
          <MaterialCommunityIcons name={item.icon || 'star'} size={20} color="#FFA500" />
          <Text style={styles.habitOptionText}>{item.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteCustomHabitFromPool(item)}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#E74C3C" />
        </TouchableOpacity>
    </View>
  ), [addHabitToMasterList, deleteCustomHabitFromPool]);

  const renderIconOption = useCallback(({ item: iconName }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.iconOption,
        selectedCustomHabitIcon === iconName && styles.iconOptionSelected
      ]}
      onPress={() => setSelectedCustomHabitIcon(iconName)}
    >
      <MaterialCommunityIcons name={iconName} size={24} color="#333" />
    </TouchableOpacity>
  ), [selectedCustomHabitIcon, setSelectedCustomHabitIcon]);

  // Data structure for the main FlatList to render different sections
  const sectionsData = useMemo(() => {
    const data = [
      { id: 'header', type: 'header' },
      { id: 'master_list_section_header', type: 'section_header', title: 'Your Master List:' },
      { id: 'master_list', type: 'master_list_content', data: masterHabitsForDisplay },
      { id: 'classic_habits_section_header', type: 'section_header', title: 'Add Classic Habits:' },
      { id: 'classic_habits', type: 'classic_habits_content', data: CLASSIC_HABITS },
      { id: 'manage_custom_habits_section_header', type: 'section_header', title: 'Manage Custom Habits:' },
      { id: 'add_new_custom_habit_form', type: 'add_form' },
      { id: 'icon_picker_section_header', type: 'section_header', title: 'Choose Icon for New Habit:' },
      { id: 'icon_picker', type: 'icon_picker_content', data: ICON_OPTIONS },
      { id: 'custom_habits_pool_section_header', type: 'section_header', title: 'Your Custom Habits Pool:' },
      { id: 'custom_habits_pool', type: 'custom_habits_pool_content', data: allCustomHabitsPool },
    ];
    return data;
  }, [masterHabitsForDisplay, allCustomHabitsPool]);


  // Main render item for the single FlatList
  const renderSectionItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.modalTitle}>Manage Master Habits</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        );
      case 'section_header':
        return <Text style={styles.modalSectionTitle}>{item.title}</Text>;
      case 'master_list_content':
        return item.data.length === 0 ? (
          <Text style={styles.emptyStateText}>No habits in your master list yet. Add some below!</Text>
        ) : (
          <FlatList
            data={item.data}
            renderItem={renderMasterHabitItem}
            keyExtractor={(habit) => habit.id}
            style={styles.masterHabitsScrollView}
            // scrollEnabled={false} // REMOVED: Let the outer FlatList handle it
            ListEmptyComponent={<Text style={styles.emptyStateText}>No habits in your master list yet. Add some below!</Text>}
          />
        );
      case 'classic_habits_content':
        return (
          <FlatList
            data={item.data}
            renderItem={renderClassicHabitItem}
            keyExtractor={(habit) => habit.id}
            style={styles.masterHabitsScrollView}
            // scrollEnabled={false} // REMOVED: Let the outer FlatList handle it
          />
        );
      case 'add_form':
        return (
          <View style={styles.addNewCustomHabitContainer}>
            <TextInput
              style={styles.customHabitInput}
              placeholder="Create new custom habit..."
              value={newCustomHabitName}
              onChangeText={setNewCustomHabitName}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.addCustomHabitButton}
              onPress={addNewCustomHabitToPool}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addCustomHabitButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        );
      case 'icon_picker_content':
        return (
          <View style={styles.iconPickerContainer}>
            <FlatList
              data={item.data}
              renderItem={renderIconOption}
              keyExtractor={(iconName) => iconName}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconGrid}
              // scrollEnabled={false} // REMOVED: Let the outer FlatList handle it
            />
          </View>
        );
      case 'custom_habits_pool_content':
        return item.data.length === 0 ? (
          <Text style={styles.emptyStateText}>No custom habits yet. Create one above!</Text>
        ) : (
          <FlatList
            data={item.data}
            renderItem={renderCustomHabitPoolItem}
            keyExtractor={(habit) => habit.id}
            style={styles.customHabitsListContainer}
            // scrollEnabled={false} // REMOVED: Let the outer FlatList handle it
            ListEmptyComponent={<Text style={styles.emptyStateText}>No custom habits yet. Create one above!</Text>}
          />
        );
      default:
        return null;
    }
  }, [
    onClose,
    renderMasterHabitItem,
    renderClassicHabitItem,
    newCustomHabitName,
    addNewCustomHabitToPool,
    renderIconOption,
    selectedCustomHabitIcon,
    renderCustomHabitPoolItem,
    masterHabitsForDisplay,
    allCustomHabitsPool
  ]);


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.addHabitModalContent}>
            <FlatList
              data={sectionsData}
              renderItem={renderSectionItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContentContainer}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}
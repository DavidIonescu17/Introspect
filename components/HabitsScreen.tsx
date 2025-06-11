// components/HabitsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  addDoc,
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
import styles from '../app/styles/habits.styles';
import { CLASSIC_HABITS } from '../constants/habits'; // Corrected import path

interface Habit {
  id: string;
  name: string;
  icon?: string;
  isCustom: boolean; // Explicitly define if it's a custom habit
}

interface UserHabit {
  id: string;
  name: string;
  icon?: string;
  isCustom: boolean;
  completed: boolean;
}

interface HabitsScreenProps {
  date: string;
  user: User | null;
}

export default function HabitsScreen({ date, user }: HabitsScreenProps) {
  const [dailyHabits, setDailyHabits] = useState<UserHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dailyHabitsCollection = collection(db, 'daily_habits');
  const masterHabitsCollection = collection(db, 'user_master_habits');
  const customHabitsPoolCollection = collection(db, 'user_custom_habits_pool');


  // Helper function to get a clean date for comparison
  const getCleanDate = (dateString: string): Date => {
    const d = new Date(dateString);
    d.setHours(0, 0, 0, 0); // Set to start of the day to ignore time
    return d;
  };

  // Fetch daily habits for the specific date
  const fetchDailyHabits = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const today = getCleanDate(new Date().toISOString().split('T')[0]); // Get today's date without time
    const targetDate = getCleanDate(date); // Get target date without time
    const isPastDate = targetDate < today;

    try {
      const q = query(
        dailyHabitsCollection,
        where('userId', '==', user.uid),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);

      let habitsToSet: UserHabit[] = [];
      let docRef = null;

      if (!querySnapshot.empty) {
        // A daily habits document exists for this date
        const docSnap = querySnapshot.docs[0];
        const docData = docSnap.data();
        docRef = docSnap.ref;

        // --- NEW LOGIC START ---
        if (isPastDate) {
            // For past dates: ALWAYS load habits exactly as found in Firestore.
            // Do NOT try to merge with master list or repopulate from master if array is empty.            habitsToSet = (docData.habits || []) as UserHabit[];
        } else {
            // It's today or a future date:
            if (docData.habits && docData.habits.length > 0) {
                // If the document has habits, use them and then merge with master habits for new ones
                habitsToSet = docData.habits as UserHabit[];

                const masterQ = query(masterHabitsCollection, where('userId', '==', user.uid));
                const masterSnapshot = await getDocs(masterQ);

                let habitIdsFromMaster: string[] = [];
                if (!masterSnapshot.empty) {
                  const masterDocData = masterSnapshot.docs[0].data();
                  habitIdsFromMaster = masterDocData.habitIds || [];
                }

                const customHabitsQ = query(customHabitsPoolCollection, where('userId', '==', user.uid));
                const customHabitsSnapshot = await getDocs(customHabitsQ);
                let customHabitsPool: Habit[] = [];
                if (!customHabitsSnapshot.empty) {
                  customHabitsPool = customHabitsSnapshot.docs[0].data().customHabits || [];
                }

                const existingHabitIds = new Set(habitsToSet.map(h => h.id));
                const newHabitsFromMaster: UserHabit[] = habitIdsFromMaster
                  .filter(masterId => !existingHabitIds.has(masterId)) // Only get habits not already in this day's list
                  .map(habitId => {
                    const classic = CLASSIC_HABITS.find(h => h.id === habitId);
                    if (classic) return { ...classic, completed: false };
                    const custom = customHabitsPool.find(h => h.id === habitId);
                    if (custom) return { ...custom, completed: false, isCustom: true };
                    console.warn(`Habit ID "${habitId}" from master list not found in CLASSIC_HABITS or custom pool during merge.`);
                    return null;
                  }).filter(Boolean) as UserHabit[];

                if (newHabitsFromMaster.length > 0) {
                    habitsToSet = [...habitsToSet, ...newHabitsFromMaster];
                    await updateDoc(docRef, { habits: habitsToSet });
                }

            } else {
                // Document exists but habits array is empty (for today/future), populate from master list

                const masterQ = query(masterHabitsCollection, where('userId', '==', user.uid));
                const masterSnapshot = await getDocs(masterQ);
                let habitIdsFromMaster: string[] = [];
                if (!masterSnapshot.empty) {
                  habitIdsFromMaster = masterSnapshot.docs[0].data().habitIds || [];
                }
                const customHabitsQ = query(customHabitsPoolCollection, where('userId', '==', user.uid));
                const customHabitsSnapshot = await getDocs(customHabitsQ);
                let customHabitsPool: Habit[] = [];
                if (!customHabitsSnapshot.empty) {
                  customHabitsPool = customHabitsSnapshot.docs[0].data().customHabits || [];
                }

                habitsToSet = habitIdsFromMaster.map(habitId => {
                  const classic = CLASSIC_HABITS.find(h => h.id === habitId);
                  if (classic) return { ...classic, completed: false };
                  const custom = customHabitsPool.find(h => h.id === habitId);
                  if (custom) return { ...custom, completed: false, isCustom: true };
                  return null;
                }).filter(Boolean) as UserHabit[];

                if (habitsToSet.length > 0) {
                    await updateDoc(docRef, { habits: habitsToSet });
                    console.log(`Existing daily habits document for ${date} updated with master list habits.`);
                }
            }
        }
        // --- NEW LOGIC END ---
      } else {
        // No daily habits document exists for this date at all.
        // This applies to brand new days (future dates) or past dates never visited before.

        const masterQ = query(masterHabitsCollection, where('userId', '==', user.uid));
        const masterSnapshot = await getDocs(masterQ);
        let habitIdsFromMaster: string[] = [];
        if (!masterSnapshot.empty) {
          habitIdsFromMaster = masterSnapshot.docs[0].data().habitIds || [];
        }
        const customHabitsQ = query(customHabitsPoolCollection, where('userId', '==', user.uid));
        const customHabitsSnapshot = await getDocs(customHabitsQ);
        let customHabitsPool: Habit[] = [];
        if (!customHabitsSnapshot.empty) {
          customHabitsPool = customHabitsSnapshot.docs[0].data().customHabits || [];
        }

        habitsToSet = habitIdsFromMaster.map(habitId => {
          const classic = CLASSIC_HABITS.find(h => h.id === habitId);
          if (classic) return { ...classic, completed: false };
          const custom = customHabitsPool.find(h => h.id === habitId);
          if (custom) return { ...custom, completed: false, isCustom: true };
          return null;
        }).filter(Boolean) as UserHabit[];

        if (habitsToSet.length > 0) {
            await addDoc(dailyHabitsCollection, {
                userId: user.uid,
                date: date,
                habits: habitsToSet
            });
        } else {
        }
      }
      setDailyHabits(habitsToSet); // Always set state with the final habits
    } catch (error) {
      console.error('Error fetching or initializing daily habits:', error);
      Alert.alert('Error', 'Failed to load habits for this day.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle completion status of a habit for the day
  const toggleHabitCompletion = async (habitToToggle: UserHabit) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        dailyHabitsCollection,
        where('userId', '==', user.uid),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'daily_habits', querySnapshot.docs[0].id);
        const currentHabits = querySnapshot.docs[0].data().habits as UserHabit[];
        const updatedHabits = currentHabits.map(h =>
          (h.id === habitToToggle.id && h.isCustom === habitToToggle.isCustom)
            ? { ...h, completed: !h.completed }
            : h
        );
        await updateDoc(docRef, { habits: updatedHabits });
        setDailyHabits(updatedHabits); // Update state directly for faster UI
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      Alert.alert('Error', 'Failed to update habit status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a habit from the current day's list (EXCEPTION)
  const removeHabitFromDay = async (habitToRemove: UserHabit) => {
    if (!user) return;
    Alert.alert(
      'Remove Habit for Today',
      `Are you sure you want to remove "${habitToRemove.name}" just for today? It will still be in your master list.`
      ,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const q = query(
                dailyHabitsCollection,
                where('userId', '==', user.uid),
                where('date', '==', date)
              );
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const docRef = doc(db, 'daily_habits', querySnapshot.docs[0].id);
                const currentHabits = querySnapshot.docs[0].data().habits as UserHabit[];
                const updatedHabits = currentHabits.filter(h =>
                  !(h.id === habitToRemove.id && h.isCustom === habitToRemove.isCustom)
                );
                await updateDoc(docRef, { habits: updatedHabits });
                setDailyHabits(updatedHabits); // Update state directly
              }
            } catch (error) {
              console.error('Error removing habit from day:', error);
              Alert.alert('Error', 'Failed to remove habit from today.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchDailyHabits();
  }, [date, user]);


  return (
    <View style={styles.habitsContainer}>
      {/* List of Habits for the Day */}
      <ScrollView style={styles.dailyHabitsList}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : dailyHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-all" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No habits set for this day. Manage your master list from the Profile section!
            </Text>
          </View>
        ) : (
          dailyHabits.map((habit) => (
            // Ensure a unique key using both id and isCustom to differentiate between classic and custom habits with same name/id
            <View key={`${habit.id}-${habit.isCustom ? 'custom' : 'classic'}`} style={styles.habitItem}>
              <TouchableOpacity
                style={styles.habitContent}
                onPress={() => toggleHabitCompletion(habit)}
              >
                <MaterialCommunityIcons
                  name={habit.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={24}
                  color={habit.completed ? '#4CAF50' : '#888'}
                  style={styles.habitIcon}
                />
                <Text style={[styles.habitText, habit.completed && styles.completedHabitText]}>
                  {habit.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeHabitFromDay(habit)} // "Delete just for that day"
                style={styles.deleteHabitButton}
              >
                <MaterialCommunityIcons name="close-circle" size={20} color="#FF6347" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* The "Add Habit" button and modal are now removed as master habits are managed elsewhere */}
    </View>
  );
}

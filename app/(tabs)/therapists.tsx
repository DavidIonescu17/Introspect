import styles from '../styles/therapists.styles';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Firebase Firestore Import
import { db, auth } from '../../firebaseConfig'; 
import { collection, getDocs, query, orderBy, limit, startAfter, where } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { router, useFocusEffect } from 'expo-router';

// Translation Maps
const specializationTranslations = {
  "psihologie clinică": "Clinical Psychology",
  "psihoterapie": "Psychotherapy",
  "psihologie educațională": "Educational Psychology",
  "psihologia muncii și organizațională": "Work and Organizational Psychology",
  "consiliere psihologică": "Psychological Counseling",
  "psihoterapii cognitiv-comportamentale": "Cognitive-Behavioral Psychotherapies",
  "psihologia transporturilor": "Transportation Psychology",
};

const professionalTypeTranslations = {
  "psiholog": "Psychologist",
  "psihoterapeut": "Psychotherapist",
  "psihoterapeut_in_supervizare": "Psychotherapist in Supervision",
  "alt_profesionist": "Other Professional",
};

// Helper function for diacritics removal and normalization
const normalizeText = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[ăâ]/g, 'a')
    .replace(/[îì]/g, 'i')
    .trim();
};

// Helper function to get translation or return original if not found
const translateTerm = (term, map) => {
  if (!term) return '';
  const normalizedTerm = normalizeText(String(term));
  const translated = map[normalizedTerm] || term;
  return translated;
};

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ITEMS_PER_PAGE = 50; // Load 50 items at a time
const INITIAL_LOAD_SIZE = 100; // Load more initially for better filtering

function buildFirestoreQuery(lastDoc, showTSAOnly, showChildCareOnly) {
  const base = collection(db, 'therapists');
  const order = orderBy('nume_prenume');
  const lim = limit(INITIAL_LOAD_SIZE);

  if (showTSAOnly && showChildCareOnly) {
    // Both toggled ON
    return lastDoc
      ? query(base, where('registru_sursa', 'array-contains-any', ['TSA', 'GRIJA_COPII']), order, startAfter(lastDoc), lim)
      : query(base, where('registru_sursa', 'array-contains-any', ['TSA', 'GRIJA_COPII']), order, lim);
  } else if (showTSAOnly) {
    // TSA only
    return lastDoc
      ? query(base, where('registru_sursa', 'array-contains', 'TSA'), order, startAfter(lastDoc), lim)
      : query(base, where('registru_sursa', 'array-contains', 'TSA'), order, lim);
  } else if (showChildCareOnly) {
    // Child Care only
    return lastDoc
      ? query(base, where('registru_sursa', 'array-contains', 'GRIJA_COPII'), order, startAfter(lastDoc), lim)
      : query(base, where('registru_sursa', 'array-contains', 'GRIJA_COPII'), order, lim);
  } else {
    // Neither toggled, show all
    return lastDoc
      ? query(base, order, startAfter(lastDoc), lim)
      : query(base, order, lim);
  }
}

const App = () => {
  // State for search and filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState(''); // Combined city/county search
  const [selectedSpecializationValue, setSelectedSpecializationValue] = useState(null);
  
  // Registry source filters
  const [showChildCareOnly, setShowChildCareOnly] = useState(false); // GRIJA_COPII
  const [showAutismOnly, setShowAutismOnly] = useState(false); // TSA

  // Debounced search values for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedLocationQuery = useDebounce(locationQuery, 300);

  // State for DropDownPicker
  const [openSpecializationDropdown, setOpenSpecializationDropdown] = useState(false);
  const [specializationDropdownItems, setSpecializationDropdownItems] = useState([]);

  // State for data management
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [displayedProfessionals, setDisplayedProfessionals] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // State for custom modal alert
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Cache for normalized search data
  const [searchCache, setSearchCache] = useState(new Map());

  const user = getAuth().currentUser;

  // Auth state management
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        if (router && router.replace) {
          router.replace('/');
        } else {
          console.warn('Router not available for redirection. User not logged in.');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Create search cache with normalized data
  const createSearchCache = useCallback((professionals) => {
    const cache = new Map();
    professionals.forEach((professional, index) => {
      const searchData = {
        id: professional.id,
        index,
        normalizedName: normalizeText(professional.nume_prenume || ''),
        normalizedCounty: normalizeText(professional.judet || ''),
        normalizedCity: normalizeText(professional.localitate || ''),
        normalizedLocation: normalizeText(`${professional.judet || ''} ${professional.localitate || ''}`),
        specializations: (professional.specializari || []).map(s => normalizeText(s)),
        registrySource: professional.registru_sursa || '',
      };
      cache.set(professional.id, searchData);
    });
    setSearchCache(cache);
  }, []);

  // Progressive data loading for better performance
  const loadMoreProfessionals = useCallback(async () => {
    if (isLoadingMore || !hasMoreData || !user) return;

    try {
      setIsLoadingMore(true);
      
      let q;
      if (lastDoc) {
        q = buildFirestoreQuery(
          lastDoc,
          showAutismOnly,
          showChildCareOnly
        );
      } else {
        return; // Already loaded initial data
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMoreData(false);
        return;
      }
      
      const newProfessionals = [];
      querySnapshot.forEach(doc => {
        newProfessionals.push({ id: doc.id, ...doc.data() });
      });
      
      // Update last document for pagination
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      // Add new professionals to existing data
      const updatedProfessionals = [...allProfessionals, ...newProfessionals];
      setAllProfessionals(updatedProfessionals);
      
      // Update search cache with new data
      createSearchCache(updatedProfessionals);
      
    } catch (error) {
      console.error("Error loading more professionals:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreData, user, lastDoc, allProfessionals, createSearchCache, showAutismOnly, showChildCareOnly]);

  // Initial fetch with progressive loading capability
  const fetchProfessionals = useCallback(async () => {
    if (!user) {
      setAllProfessionals([]);
      setFilteredProfessionals([]);
      setDisplayedProfessionals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Reset pagination state when fetching new data
      setCurrentPage(1);
      setLastDoc(null);
      setHasMoreData(true);
      
      // Fetch first batch
      const q = buildFirestoreQuery(
        null,
        showAutismOnly,
        showChildCareOnly
      );
      
      const querySnapshot = await getDocs(q);
      const professionalsList = [];
      
      querySnapshot.forEach(doc => {
        professionalsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Set last document for pagination
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMoreData(querySnapshot.docs.length === INITIAL_LOAD_SIZE);
      }
      
      setAllProfessionals(professionalsList);
      
      // Create search cache
      createSearchCache(professionalsList);
      
      // Extract unique specializations for dropdown (normalized)
      const allSpecializations = professionalsList.flatMap((item) =>
        item.specializari ? item.specializari.map(s => normalizeText(s)) : []
      );
      
      const uniqueSpecializations = Array.from(new Set(allSpecializations))
        .sort()
        .map((item) => ({ 
          label: translateTerm(item, specializationTranslations),
          value: item
        }));

      setSpecializationDropdownItems([
        { label: 'All Specializations', value: null }, 
        ...uniqueSpecializations
      ]);

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      setModalMessage("Failed to load professionals. Please check your internet connection.");
      setIsModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [user, createSearchCache, showAutismOnly, showChildCareOnly]);

  // Optimized filtering - removed duplicate registry source filters since they're handled in fetchProfessionals
  const applyFilters = useCallback(() => {
    let currentData = allProfessionals;

    // Name search
    if (debouncedSearchQuery.trim() !== '') {
      const normalizedSearchQuery = normalizeText(debouncedSearchQuery.trim());
      currentData = currentData.filter((item) => {
        const cachedData = searchCache.get(item.id);
        return cachedData && cachedData.normalizedName.includes(normalizedSearchQuery);
      });
    }

    // Location search (city or county)
    if (debouncedLocationQuery.trim() !== '') {
      const normalizedLocationQuery = normalizeText(debouncedLocationQuery.trim());
      currentData = currentData.filter((item) => {
        const cachedData = searchCache.get(item.id);
        return cachedData && (
          cachedData.normalizedCounty.includes(normalizedLocationQuery) ||
          cachedData.normalizedCity.includes(normalizedLocationQuery) ||
          cachedData.normalizedLocation.includes(normalizedLocationQuery)
        );
      });
    }

    // Specialization filter
    if (selectedSpecializationValue) {
      currentData = currentData.filter((item) => {
        const cachedData = searchCache.get(item.id);
        return cachedData && cachedData.specializations.includes(selectedSpecializationValue);
      });
    }

    setFilteredProfessionals(currentData);
    setCurrentPage(1);
  }, [
    debouncedSearchQuery, 
    debouncedLocationQuery, 
    selectedSpecializationValue, 
    allProfessionals, 
    searchCache
  ]);

  // Paginate displayed professionals
  const updateDisplayedProfessionals = useCallback(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const newDisplayed = filteredProfessionals.slice(startIndex, endIndex);
    
    setDisplayedProfessionals(newDisplayed);
    
    // Check if we need to load more data from Firestore
    const hasMoreDisplayed = endIndex < filteredProfessionals.length;
    
    // If we're showing filtered results and approaching the end, try to load more from Firestore
    if (!hasMoreDisplayed && filteredProfessionals.length > 0 && hasMoreData && 
        (debouncedLocationQuery.trim() !== '' || debouncedSearchQuery.trim() !== '')) {
      loadMoreProfessionals();
    }
  }, [filteredProfessionals, currentPage, hasMoreData, debouncedLocationQuery, debouncedSearchQuery, loadMoreProfessionals]);

  // Load more data for pagination
  const loadMoreData = useCallback(() => {
    if (!loadingMore) {
      const hasMoreDisplayed = (currentPage * ITEMS_PER_PAGE) < filteredProfessionals.length;
      
      if (hasMoreDisplayed) {
        setLoadingMore(true);
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
          setLoadingMore(false);
        }, 100);
      } else if (hasMoreData && (debouncedLocationQuery.trim() !== '' || debouncedSearchQuery.trim() !== '')) {
        // Load more from Firestore for filtered searches
        loadMoreProfessionals();
      }
    }
  }, [loadingMore, currentPage, filteredProfessionals.length, hasMoreData, debouncedLocationQuery, debouncedSearchQuery, loadMoreProfessionals]);

  // Handle toggle changes - refetch data when toggles change
  const handleToggleChange = useCallback((toggleType, value) => {
    if (toggleType === 'childcare') {
      setShowChildCareOnly(value);
    } else if (toggleType === 'autism') {
      setShowAutismOnly(value);
    }
    
    // Reset state and refetch data
    setAllProfessionals([]);
    setFilteredProfessionals([]);
    setDisplayedProfessionals([]);
    setCurrentPage(1);
    setLastDoc(null);
    setHasMoreData(true);
  }, []);

  // Effects
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchProfessionals();
      }
    }, [user, fetchProfessionals, showAutismOnly, showChildCareOnly])
  );

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    updateDisplayedProfessionals();
  }, [filteredProfessionals, currentPage, updateDisplayedProfessionals]);

  // Memoized render item for better performance
  const renderProfessionalItem = useCallback(({ item }) => {
    // Normalize and ensure all text values are strings
    const name = item.nume_prenume || 'N/A';
    const county = item.judet || 'N/A';
    const city = item.localitate || '';
    const location = city ? `${city}, ${county}` : county;
    
    const emails = Array.isArray(item.email) ? item.email.filter(e => e).join(', ') : '';
    const phones = Array.isArray(item.telefon) ? item.telefon.filter(p => p).join(', ') : '';
    const specializations = Array.isArray(item.specializari) 
      ? item.specializari.map(s => translateTerm(s, specializationTranslations)).join(', ')
      : '';
    const office = item.sediul_profesional || '';
    const professionalType = translateTerm(item.tip_profesionist, professionalTypeTranslations);
    const regime = item.regim_exercitare || '';
    
    // Registry source badge - handle both string and array cases
    const getRegistryBadge = () => {
      const registrySource = item.registru_sursa;
      
      // Handle array case
      if (Array.isArray(registrySource)) {
        if (registrySource.includes('GRIJA_COPII')) {
          return { text: 'Child Care', color: '#FF6B6B' };
        } else if (registrySource.includes('TSA')) {
          return { text: 'Autism Specialist', color: '#4ECDC4' };
        }
      } 
      // Handle string case
      else if (typeof registrySource === 'string') {
        if (registrySource === 'GRIJA_COPII') {
          return { text: 'Child Care', color: '#FF6B6B' };
        } else if (registrySource === 'TSA') {
          return { text: 'Autism Specialist', color: '#4ECDC4' };
        }
      }
      
      return null;
    };
    
    const registryBadge = getRegistryBadge();

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.badgeContainer}>
            {registryBadge && (
              <View style={[styles.badge, { backgroundColor: registryBadge.color + '20' }]}>
                <Text style={[styles.badgeText, { color: registryBadge.color }]}>
                  {registryBadge.text}
                </Text>
              </View>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{location}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          {emails && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#6B4EFF" />
              <Text style={styles.infoText}>{emails}</Text>
            </View>
          )}
          
          {phones && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#6B4EFF" />
              <Text style={styles.infoText}>{phones}</Text>
            </View>
          )}
          
          {specializations && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="certificate-outline" size={20} color="#6B4EFF" />
              <Text style={styles.infoText}>{specializations}</Text>
            </View>
          )}
          
          {office && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="office-building" size={20} color="#6B4EFF" />
              <Text style={styles.infoText}>{office}</Text>
            </View>
          )}

          {professionalType && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color="#6B4EFF" />
              <Text style={styles.infoText}>{professionalType}</Text>
            </View>
          )}

          {regime && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="briefcase-outline" size={20} color="#6B4EFF" />
              <Text style={styles.infoText}>{regime}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, []);

  // Memoized footer component
  const renderFooter = useCallback(() => {
    if (!loadingMore && !isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6B4EFF" />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore, isLoadingMore]);

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.centeredView} onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Text style={styles.header}>Psychology Experts</Text>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="account-search" size={20} color="#6B4EFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#6B4EFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city or county..."
            value={locationQuery}
            onChangeText={setLocationQuery}
            placeholderTextColor="#999"
          />
        </View>

        <DropDownPicker
          open={openSpecializationDropdown}
          value={selectedSpecializationValue}
          items={specializationDropdownItems}
          setOpen={setOpenSpecializationDropdown}
          setValue={setSelectedSpecializationValue}
          setItems={setSpecializationDropdownItems}
          placeholder="Select Specialization"
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          zIndex={3000}
          zIndexInverse={1000}
        />

        {/* Registry Source Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <MaterialCommunityIcons name="baby-face" size={20} color="#FF6B6B" />
            <Text style={styles.filterLabel}>Child Care Specialists Only</Text>
            <Switch
              value={showChildCareOnly}
              onValueChange={(val) => handleToggleChange('childcare', val)}
              trackColor={{ false: '#767577', true: '#FF6B6B' }}
              thumbColor={showChildCareOnly ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.filterRow}>
            <MaterialCommunityIcons name="puzzle" size={20} color="#4ECDC4" />
            <Text style={styles.filterLabel}>Autism Specialists Only</Text>
            <Switch
              value={showAutismOnly}
              onValueChange={(val) => handleToggleChange('autism', val)}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={showAutismOnly ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={styles.loadingText}>Loading experts...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProfessionals}
          keyExtractor={(item) => item.id}
          renderItem={renderProfessionalItem}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 220, // Approximate item height (increased for badges)
            offset: 220 * index,
            index,
          })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#6B4EFF" />
              <Text style={styles.noResults}>
                {filteredProfessionals.length === 0 ? 'No results found' : 'Loading...'}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default App;
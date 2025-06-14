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
  // Removed ScrollView import as it's no longer used
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
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
  "all": "All Professional Types", // Added "All" option for the picker
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

// Modified buildFirestoreQuery: Removed specializationFilter from DB query
function buildFirestoreQuery(lastDoc, showTSAOnly, showChildCareOnly, professionalTypeFilter = 'all') {
  const base = collection(db, 'therapists');
  const order = orderBy('nume_prenume'); // Ordering by name
  const lim = limit(INITIAL_LOAD_SIZE);

  let conditions = [];

  // Registry source conditions
  if (showTSAOnly && showChildCareOnly) {
    conditions.push(where('registru_sursa', 'array-contains-any', ['TSA', 'GRIJA_COPII']));
  } else if (showTSAOnly) {
    conditions.push(where('registru_sursa', 'array-contains', 'TSA'));
  } else if (showChildCareOnly) {
    conditions.push(where('registru_sursa', 'array-contains', 'GRIJA_COPII'));
  }

  // Professional Type condition
  if (professionalTypeFilter !== 'all') {
    conditions.push(where('tip_profesionist', '==', professionalTypeFilter));
  }

  // Build query based on conditions
  let finalQuery;
  if (conditions.length === 0) { // If no conditions, just apply order and limit
    finalQuery = lastDoc
      ? query(base, order, startAfter(lastDoc), lim)
      : query(base, order, lim);
  } else { // If conditions exist, apply them, then order and limit
    finalQuery = lastDoc
      ? query(base, ...conditions, order, startAfter(lastDoc), lim)
      : query(base, ...conditions, order, lim);
  }
  return finalQuery;
}

const App = () => {
  // State for search and filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState(''); // Combined city/county search
  const [specializationQuery, setSpecializationQuery] = useState(''); // Searchable specialization (now client-side filtered)
  const [professionalTypeFilter, setProfessionalTypeFilter] = useState('all'); // 'all', 'psiholog', 'psihoterapeut', 'psihoterapeut_in_supervizare', 'alt_profesionist'

  // Registry source filters
  const [showChildCareOnly, setShowChildCareOnly] = useState(false); // GRIJA_COPII
  const [showAutismOnly, setShowAutismOnly] = useState(false); // TSA

  // Debounced search values for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedLocationQuery = useDebounce(locationQuery, 300);
  const debouncedSpecializationQuery = useDebounce(specializationQuery, 300);

  // State for data management
  const [allProfessionals, setAllProfessionals] = useState([]); // This will hold a broader set of data now
  const [filteredProfessionals, setFilteredProfessionals] = useState([]); // Filtered subset for display
  const [displayedProfessionals, setDisplayedProfessionals] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]); // Store all unique specializations (for dropdown/suggestions, not direct DB filtering)

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

  // Fetch all unique specializations once (still useful for autocomplete/suggestions if desired)
  const fetchAllSpecializations = useCallback(async () => {
    try {
      // Fetch a large sample to get most specializations
      const q = query(collection(db, 'therapists'), limit(1000));

      const querySnapshot = await getDocs(q);

      const specializationsSet = new Set();
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.specializari && Array.isArray(data.specializari)) {
          data.specializari.forEach(spec => {
            if (spec && spec.trim()) {
              specializationsSet.add(spec.trim());
            }
          });
        }
      });

      const uniqueSpecializations = Array.from(specializationsSet).sort();
      setAllSpecializations(uniqueSpecializations);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  }, []);

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

  // Create search cache with normalized data for client-side filtering
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
        specializations: (professional.specializari || []).map(s => normalizeText(s)), // Normalize specializations for searching
        originalSpecializations: professional.specializari || [],
        registrySource: professional.registru_sursa || '',
        normalizedProfessionalType: normalizeText(professional.tip_profesionist || ''),
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

      // Build Firestore query without specializationFilter
      let q = buildFirestoreQuery(
        lastDoc,
        showAutismOnly,
        showChildCareOnly,
        professionalTypeFilter
      );

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
  }, [isLoadingMore, hasMoreData, user, lastDoc, allProfessionals, createSearchCache, showAutismOnly, showChildCareOnly, professionalTypeFilter]);

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

      // Fetch first batch without specializationFilter
      const q = buildFirestoreQuery(
        null,
        showAutismOnly,
        showChildCareOnly,
        professionalTypeFilter
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
      } else {
        setHasMoreData(false); // No data found
      }

      setAllProfessionals(professionalsList);

      // Create search cache
      createSearchCache(professionalsList);

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      setModalMessage("Failed to load professionals. Please check your internet connection.");
      setIsModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [user, createSearchCache, showAutismOnly, showChildCareOnly, professionalTypeFilter]);

  // Optimized filtering (client-side) - Now handles specialization filter
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

    // Specialization search - Client-side filtering for partial matches
    if (debouncedSpecializationQuery.trim() !== '') {
      const normalizedSpecQuery = normalizeText(debouncedSpecializationQuery.trim());
      currentData = currentData.filter((item) => {
        const cachedData = searchCache.get(item.id);
        // Check if any of the professional's specializations include the search query
        return cachedData && cachedData.specializations.some(spec =>
          spec.includes(normalizedSpecQuery)
        );
      });
    }
    // Professional Type filter is primarily handled by Firestore query, so no client-side filtering needed here for it.

    setFilteredProfessionals(currentData);
    setCurrentPage(1);
  }, [
    debouncedSearchQuery,
    debouncedLocationQuery,
    debouncedSpecializationQuery, // Keep this here to re-run client-side filtering when text changes
    allProfessionals,
    searchCache
  ]);

  // Paginate displayed professionals
  const updateDisplayedProfessionals = useCallback(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const newDisplayed = filteredProfessionals.slice(startIndex, endIndex);

    setDisplayedProfessionals(newDisplayed);

    // If we're showing filtered results and approaching the end of the client-side data,
    // and there's potentially more data in Firestore, load more.
    const isEndOfClientFilteredData = endIndex >= filteredProfessionals.length;

    if (isEndOfClientFilteredData && hasMoreData && !isLoadingMore) {
        // Only load more from Firestore if no client-side search query is active
        // or if the DB query is already broad enough (which it now is for specialization)
        // This condition ensures we don't try to load more if all data is already loaded or we are fetching.
        loadMoreProfessionals();
    }
  }, [filteredProfessionals, currentPage, hasMoreData, isLoadingMore, loadMoreProfessionals]);


  // Load more data for FlatList's onEndReached (triggers pagination of `displayedProfessionals`)
  const loadMoreData = useCallback(() => {
    if (!loadingMore && (currentPage * ITEMS_PER_PAGE) < filteredProfessionals.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setLoadingMore(false);
      }, 100);
    }
    // The `updateDisplayedProfessionals` effect will handle triggering `loadMoreProfessionals`
    // when client-side filtered data runs out and there's more data in Firestore.
  }, [loadingMore, currentPage, filteredProfessionals.length]);

  // Handle registry source toggle changes
  const handleRegistryToggleChange = useCallback((toggleType, value) => {
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

  // Handle professional type filter change
  const handleProfessionalTypeFilterChange = useCallback((type) => {
    setProfessionalTypeFilter(type);
    // Reset state and refetch data when filter changes
    setAllProfessionals([]);
    setFilteredProfessionals([]);
    setDisplayedProfessionals([]);
    setCurrentPage(1);
    setLastDoc(null);
    setHasMoreData(true);
  }, []);

  // Effects
  useEffect(() => {
    if (user) {
      fetchAllSpecializations();
    }
  }, [user, fetchAllSpecializations]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        // Dependencies now include all filters that trigger a Firestore refetch
        // specializationQuery is NOT here because it's now client-side filtered
        fetchProfessionals();
      }
    }, [user, fetchProfessionals, showAutismOnly, showChildCareOnly, professionalTypeFilter])
  );

  useEffect(() => {
    // This effect runs whenever filter inputs change (debounced for search and location,
    // and immediately for specialization as it's now client-side).
    // It will re-filter `allProfessionals` into `filteredProfessionals`.
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    // This effect runs whenever `filteredProfessionals` changes or `currentPage` changes,
    // updating the visible list and potentially triggering more Firestore fetches.
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

  // ListHeaderComponent for FlatList, containing all search and filter inputs
  const ListHeader = () => (
    <View>
      <Text style={styles.header}>Licensed Mental Health Professionals</Text>
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

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="certificate-outline" size={20} color="#6B4EFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by specialization..."
            value={specializationQuery}
            onChangeText={setSpecializationQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Professional Type Filter - Now a Picker (Dropdown) */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Filter by Professional Type:</Text>
          {/* Apply searchContainer style to make it look consistent with other inputs */}
          <View style={[styles.searchContainer, styles.pickerInputWrapper]}>
            {/* The actual Picker component */}
            <Picker
              selectedValue={professionalTypeFilter}
              onValueChange={(itemValue) => handleProfessionalTypeFilterChange(itemValue)}
              style={styles.picker}
              // Note: itemStyle is not consistently supported on all platforms for Picker.Item
            >
              {/* Loop through the translation map to create picker items */}
              {Object.entries(professionalTypeTranslations).map(([key, value]) => (
                <Picker.Item key={key} label={value} value={key} />
              ))}
            </Picker>
          </View>
        </View>


        {/* Registry Source Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <MaterialCommunityIcons name="baby-face" size={20} color="#FF6B6B" />
            <Text style={styles.filterLabel}>Child Care Specialists Only</Text>
            <Switch
              value={showChildCareOnly}
              onValueChange={(val) => handleRegistryToggleChange('childcare', val)}
              trackColor={{ false: '#767577', true: '#FF6B6B' }}
              thumbColor={showChildCareOnly ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.filterRow}>
            <MaterialCommunityIcons name="puzzle" size={20} color="#4ECDC4" />
            <Text style={styles.filterLabel}>Autism Specialists Only</Text>
          <Switch
              value={showAutismOnly}
              onValueChange={(val) => handleRegistryToggleChange('autism', val)}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={showAutismOnly ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>
    </View>
    </View>
  );

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

      {/* FlatList with ListHeaderComponent for filters */}
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
          ListHeaderComponent={ListHeader} // Render all filters as the header of the FlatList
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          // getItemLayout can be removed or adjusted if card height varies significantly due to text wrapping
          // getItemLayout={(data, index) => ({
          //   length: 220, // Approximate item height (increased for badges)
          //   offset: 220 * index,
          //   index,
          // })}
          ListEmptyComponent={() => (
            // Only show empty state if not loading and filters are applied resulting in no results
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

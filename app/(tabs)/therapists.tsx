import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import experti from '../../assets/data/experti.json';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSpecializare, setSelectedSpecializare] = useState(null);
  const [filialaQuery, setFilialaQuery] = useState('');
  const [specializari, setSpecializari] = useState([]);
  const [openSpecializare, setOpenSpecializare] = useState(false);

  useEffect(() => {
    setFilteredData(experti);
    const specializariUnice = Array.from(
      new Set(
        experti.flatMap((item) =>
          item["Specialitate / specialități expert psiholog"].split(', ')
        )
      )
    )
      .sort()
      .map((item) => ({ label: item, value: item }));

    setSpecializari([{ label: 'Toate specializările', value: null }, ...specializariUnice]);
  }, []);

  const filterData = () => {
    let data = experti;

    if (searchQuery.trim() !== '') {
      data = data.filter((item) =>
        item["Nume și prenume psiholog cu drept de liberă practică"]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (filialaQuery.trim() !== '') {
      data = data.filter((item) =>
        item["Filiala"].toLowerCase().includes(filialaQuery.toLowerCase())
      );
    }

    if (selectedSpecializare) {
      data = data.filter((item) =>
        item["Specialitate / specialități expert psiholog"]
          .split(', ')
          .includes(selectedSpecializare)
      );
    }

    setFilteredData(data);
  };

  useEffect(() => {
    filterData();
  }, [searchQuery, filialaQuery, selectedSpecializare]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>
          {item["Nume și prenume psiholog cu drept de liberă practică"]}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item["Filiala"]}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#6B4EFF" />
          <Text style={styles.infoText}>{item["Email"]}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone-outline" size={20} color="#6B4EFF" />
          <Text style={styles.infoText}>{item["Telefon"]}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="certificate-outline" size={20} color="#6B4EFF" />
          <Text style={styles.infoText}>
            {item["Specialitate / specialități expert psiholog"]}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="office-building" size={20} color="#6B4EFF" />
          <Text style={styles.infoText}>
            {item["Forma de exercitare a profesiei de psiholog cu drept de liberă practică"]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Experți Psihologi</Text>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="account-search" size={20} color="#6B4EFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută după nume"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#6B4EFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută după filială"
            value={filialaQuery}
            onChangeText={setFilialaQuery}
            placeholderTextColor="#999"
          />
        </View>

        <DropDownPicker
          open={openSpecializare}
          value={selectedSpecializare}
          items={specializari}
          setOpen={setOpenSpecializare}
          setValue={setSelectedSpecializare}
          placeholder="Selectează specializarea"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          zIndex={3000}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#6B4EFF" />
            <Text style={styles.noResults}>Nu s-au găsit rezultate</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginVertical: 20,
  },
  searchSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: 12,
  },
  dropdownContainer: {
    borderColor: '#E5E5E5',
    borderRadius: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  badge: {
    backgroundColor: '#6B4EFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#6B4EFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#4A4A4A',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResults: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});

export default App;
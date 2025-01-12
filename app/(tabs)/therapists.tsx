import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import experti from '../../assets/data/experti.json'; // Importă JSON-ul

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedFiliala, setSelectedFiliala] = useState(null);
  const [selectedSpecializare, setSelectedSpecializare] = useState(null);
  const [filialaQuery, setFilialaQuery] = useState('');
  const [specializari, setSpecializari] = useState([]);
  const [openSpecializare, setOpenSpecializare] = useState(false);

  useEffect(() => {
    // Inițializează datele filtrate
    setFilteredData(experti);

    const specializariUnice = Array.from(
      new Set(
        experti.flatMap((item) =>
          item["Specialitate / specialități expert psiholog"].split(', ')
        )
      )
    )
      .sort() // Sortează alfabetic
      .map((item) => ({ label: item, value: item }));

    setSpecializari([{ label: 'Toate', value: null }, ...specializariUnice]);
  }, []);

  // Funcție de filtrare principală
  const filterData = () => {
    let data = experti;

    // Filtrare după căutare
    if (searchQuery.trim() !== '') {
      data = data.filter((item) =>
        item["Nume și prenume psiholog cu drept de liberă practică"]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Filtrare după filială
    if (filialaQuery.trim() !== '') {
      data = data.filter((item) =>
        item["Filiala"]
          .toLowerCase()
          .includes(filialaQuery.toLowerCase())
      );
    }

    // Filtrare după specializare
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
    filterData(); // Refiltrează datele când se modifică filtrele
  }, [searchQuery, filialaQuery, selectedSpecializare]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item["Nume și prenume psiholog cu drept de liberă practică"]}
      </Text>
      <Text style={styles.info}>Filiala: {item["Filiala"]}</Text>
      <Text style={styles.info}>Email: {item["Email"]}</Text>
      <Text style={styles.info}>Telefon: {item["Telefon"]}</Text>
      <Text style={styles.info}>
        Specializări: {item["Specialitate / specialități expert psiholog"]}
      </Text>
      <Text style={styles.info}>
        Forma exercitare:{" "}
        {item["Forma de exercitare a profesiei de psiholog cu drept de liberă practică"]}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista Experților Psihologi</Text>

      {/* Căutare */}
      <TextInput
        style={styles.searchInput}
        placeholder="Caută după nume"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Caută după filială"
        value={filialaQuery}
        onChangeText={setFilialaQuery}
      />


      <Text style={styles.filterLabel}>Specializare:</Text>
      <DropDownPicker
        open={openSpecializare}
        value={selectedSpecializare}
        items={specializari}
        setOpen={setOpenSpecializare}
        setValue={setSelectedSpecializare}
        placeholder="Selectează o specializare"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.noResults}>Nu s-au găsit rezultate!</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginTop: 50
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default App;

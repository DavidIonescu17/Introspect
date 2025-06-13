import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';


function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -12 }} {...props}  />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8a4fff",
        tabBarInactiveTintColor: "black",
        tabBarShowLabel: false,
        headerShown: false,
          // 2) Style the whole bar as a floating white pill
        tabBarStyle: {
        
          bottom: 0,
          left: 4,
          right: 4,
          borderRadius: 0,
          backgroundColor: '#FFFFFF',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },

        // Style for the labels (text below icons)
       tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="all-entries"
        options={{
          title: 'All-entries',
           headerShown: false,
           href: null,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color }) => <TabBarIcon name="android" color={color} />,
        }}
      />
      <Tabs.Screen
        name="therapists"
        options={{
          title: 'Therapists',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-md" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="hospitals"
        options={{
          title: 'Hospitals',
          headerShown: false,
           href: null,
          tabBarIcon: ({ color }) => <TabBarIcon name="building" color={color} />, 
        }}
      />
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
           headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="specific-day"
        options={{
          title: 'Specific-Day',
           headerShown: false,
           href: null,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />, 
        }}
      />
    
    </Tabs>
  );
}

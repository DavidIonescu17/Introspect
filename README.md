# Introspect 📱🧠  
**A privacy-first mobile app for holistic mental well-being. Features AI support, encrypted journaling, habit tracking, personalized insights, and a verified therapist directory.**

## 🧩 Overview

**Introspect** is a React Native mobile app developed as part of a Bachelor's thesis in Computer Science. It is designed to provide users with a secure, integrated, and evidence-based platform for managing their mental health through self-reflection, journaling, habit tracking, and AI-powered emotional support.  

The app emphasizes **privacy**, **usability**, and **psychological value**, integrating theoretical foundations from Cognitive Behavioral Therapy (CBT), Positive Psychology, and Self-Determination Theory.

---

## 🚀 Features

- 📓 **End-to-end encrypted journaling**  
- 🎯 **Customizable habit tracker and streak system**
- 🤖 **AI Assistant** (empathetic, non-clinical support via OpenAI API)
- 📈 **Mood and sentiment analysis**  
- 🧘‍♀️ **Achievements and gamification** to promote well-being  
- 📚 **Directory of licensed therapists in Romania**
- 📆 **Calendar-based progress reflection**
- 🔒 **Client-side encryption for sensitive user data** (Firebase + CryptoJS)
- 🎵 *(Optional)* **Music association with journal entries via Spotify API** *(experimental)*

---

## 🛠️ Tech Stack

- **React Native** (Expo)
- **TypeScript**
- **Firebase** (Authentication, Firestore, Storage)
- **OpenAI API** (Chatbot functionality)
- **CryptoJS** (End-to-end encryption)
- **react-native-chart-kit** (Data visualization)
- **AsyncStorage** (Local persistence)

---

## 🧪 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DavidIonescu17/Introspect.git
   cd Introspect
2. Install dependencies:
   ```bash
   npm install
3. Set up your API keys:
   Create a key.ts file in the root folder and add your OpenAI API key:
    ```bash
   export const OPENAI_API_KEY = 'your-key-here';
4. Configure Firebase
    Add your Firebase config file firebaseConfig.ts
    Ensure Firestore, Auth, and Storage are properly initialized
5. Run the app:
   ```bash
   npx expo start


🧠 Security Notes
All sensitive data (journal entries, chat messages) are encrypted client-side using AES encryption. The app follows best practices for ethical AI use and does not provide medical diagnoses.

🎓 Academic Context
This application was developed as part of a Bachelor’s thesis at [UBB Cluj-Napoca – Faculty of Mathematics and Computer Science]. The work focuses on bridging gaps in mental health accessibility through ethical, user-centered technology.

For more details, refer to the thesis.pdf included in the repository.

📌 Future Work
  Clinical validation through empirical user studies
  Explore implementing tools to help users identify suitable therapy types and directly book appointments with relevant professionals.
  Wearable device integration (e.g., sleep, HRV)
  Advanced AI personalization (memory, proactive suggestions)
  Multilingual support and localization


👩‍💻 Author
David Ionescu

🏫 Babeș-Bolyai University, Faculty of Mathematics and Computer Science

📬 davidionescu365@gmail.com

🌐 GitHub: DavidIonescu17

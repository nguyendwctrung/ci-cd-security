# **Software Requirements Specification (SRS) \- Pokémon Community & Mapping Web Application**

## **1\. Project Information**

* **Course:** Introduction to Software Engineering  
* **Department:** Software Engineering Department, Faculty of Information and Technology  
* **Institution:** University of Science, TP. HO CHI MINH

## **2\. Problem Statement**

The goal is to create a fast, simple web application for Pokémon players to effectively search for Pokémon and build a community, replacing slow, ad-filled wikis.

* **Operating Environment:** \* **Frontend:** ReactJS and Tailwind CSS.  
  * **Backend:** NodeJS with Express framework.  
  * **Database:** MongoDB for user data (profiles, posts, comments).  
  * **Data Source:** Pokémon locations fetched from the public PokéAPI.  
  * **Hosting:** Local server supporting HTML5.  
  * **Language:** JavaScript.

## ---

**3\. Requirements Overview**

### **3.1 Stakeholders**

1. **Project Sponsor:** Responsible for funding.  
2. **Players/Users:** Main users of software features.  
3. **Moderators:** Maintain the social environment.  
4. **Pokémon Parent Company:** Intellectual Property holders.

### **3.2 Functional Requirements**

#### **User Requirements \- Main Page**

* **Access:** Users must access a login window upon first visit.  
* **Social Interaction:** Users can view, like, and comment on posts.  
* **Profile Management:** Users can customize profiles and view others' profiles via avatars.  
* **Navigation:** Direct access to the map from the main page.

#### **Moderator Requirements**

* **Content Control:** Option to warn users or delete inappropriate posts.  
* **Accountability:** Must provide text reasoning when issuing warnings or deletions.

#### **Player Requirements \- Map Page**

* **Pokémon Search:** Ability to select Pokémon from a system list.  
* **Tracking:** Map displays pins for all possible locations of a tracked Pokémon.  
* **Interactivity:** Easy-to-use zoom functions for the map.

### **3.3 Non-Functional Requirements**

* **Performance:** Main page must load within 3 seconds; interactions must provide feedback within 5 seconds.  
* **Usability:** Zoom must be controllable via pinch gestures and buttons.  
* **Reliability:** System uptime from 6 AM to 10 PM; error rates for post creation \< 1%.  
* **Security:** Password encryption using bcrypt; OTP for registration valid for 10 minutes.

## ---

**4\. Requirements Analysis**

### **4.1 Use Case Model Summary**

The system is divided into two primary sub-systems:

1. **Social Media System:** Includes Login, Logout, Register Account, Follow Users, View Posts, Like/Comment, and Profile Customization .  
2. **Map System:** Includes View Map, Find Pokémon, Track Pokémon, and Select Games .

### **4.2 Key Use Case Specifications (Selected)**

* **U001 \- Register Account:** User inputs credentials, system validates format and sends OTP to email/phone.  
* **U014 \- Read Pokédex:** System requests data from PokéAPI and displays entries in ascending order.  
* **U015 \- Provide Pokémon Data:** Establishes connection to PokéAPI and fetches requested list .  
* **U020 \- Find Pokémon:** Displays locations of specific Pokémon as pins on the map; supports search by name or type .  
* **U022 \- Change Systems:** Transitions between Map and Social Media systems while preserving user state.

## ---

**5\. Prototype/Mockup**

The system interface includes:

* **Dashboard:** Highlighting user posts and social interactions.  
* **Profile Page:** Displaying followers, following, and post history.  
* **Pokédex Page:** Grid view of Pokémon entries with entry numbers and names.  
* **Detailed Pokémon View:** Displays height, weight, category, abilities, type, weaknesses, and evolution chain.


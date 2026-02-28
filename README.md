# 🚀 DevDostHub

**A Cloud-Native, Serverless Tech Community Platform**

DevDostHub is a complete platform built to manage, engage, and grow a tech community of 3,000+ university students. It provides a central place for students to discover tech events, RSVP, and get instant, AI-powered career roadmaps. 

This project demonstrates a modern cloud architecture using a serverless backend, a cross-platform mobile app, and a reactive web admin dashboard.

## ✨ Key Features

* 📱 **Student Mobile App:** A smooth, cross-platform mobile application where students can view upcoming bootcamps, workshops, and meetups.
* 💻 **Admin Web Dashboard:** A secure web portal for community leaders to manage users, create new events, and track RSVPs in real-time.
* 🤖 **AI Career Mentor:** Integrated AI that allows students to ask questions (e.g., "How do I start with AWS?") and instantly receive structured learning roadmaps.
* ⚡ **Serverless Architecture:** The backend only runs when needed, ensuring zero cost when idle and massive scalability when thousands of students use the app at once.

## 🛠️ Tech Stack

**Frontend & Mobile:**
* **Mobile App:** Flutter & Dart
* **Web Dashboard:** React.js, Tailwind CSS
* **API Calling:** Axios / HTTP package

**Backend & Cloud:**
* **Server:** Node.js, Express.js
* **Cloud Hosting:** AWS Lambda (Serverless), AWS API Gateway
* **Database:** MongoDB Atlas (Advanced indexing and aggregation)
* **AI Integration:** Google Gemini API

## 🏗️ System Architecture

1.  **Client Layer:** Users interact with either the Flutter mobile app or the React web dashboard.
2.  **API Gateway:** AWS API Gateway securely receives all incoming network requests.
3.  **Compute Layer:** AWS Lambda functions execute the Node.js logic on-demand (Parallel Distributed Systems).
4.  **Data Layer:** MongoDB stores user profiles, event details, and RSVP connections. External calls are made to the Gemini API for the AI features.

[Download Mobile App for users - Android Version](https://drive.google.com/file/d/1oJlj49qroZ8wGsQfhOIk2c4VSQwVJqQ2/view?usp=sharing) <br>
[Live Admin Site - Where Admin/Organizers can manage everything!]()

👨‍💻 Author! <br>
Mubashar Ghazi <br> [LinkedIn](https://www.linkedin.com/in/mubasharghazi/)
[Website](https://mubasharghazi.dev/)

If you like this project, please give it a ⭐ on GitHub!

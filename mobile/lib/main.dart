// -----------------------------------------------
// main.dart — App Entry Point
// -----------------------------------------------
// This is the starting point of the Flutter app.
// It sets up the Material theme (with Google Fonts)
// and launches the LoginScreen as the first page.
// -----------------------------------------------

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const DevDostHubApp());
}

class DevDostHubApp extends StatelessWidget {
  const DevDostHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DevDostHub',
      debugShowCheckedModeBanner: false, // Hide the debug banner
      // -----------------------------------------------
      // App-wide Theme Configuration
      // -----------------------------------------------
      theme: ThemeData(
        // Use Google Fonts "Poppins" across the entire app
        textTheme: GoogleFonts.poppinsTextTheme(),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5), // Indigo-600
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        // Consistent input field styling
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey.shade50,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
      ),

      // Start with the Login screen
      home: const LoginScreen(),
    );
  }
}

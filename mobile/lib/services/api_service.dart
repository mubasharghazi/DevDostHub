import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/event_model.dart';
import '../models/user_model.dart';

class ApiService {
  // Live backend URL (AWS Lambda)
  static const String _liveUrl =
      'https://4y2z4p1e6h.execute-api.ap-south-1.amazonaws.com/api';

  // Set to true to use local backend during development
  static const bool _useLocal = false;

  static String get baseUrl {
    if (_useLocal) {
      // Web browser → localhost, Android emulator → 10.0.2.2
      if (kIsWeb) return 'http://localhost:5000/api';
      return 'http://10.0.2.2:5000/api';
    }
    return _liveUrl;
  }

  // JWT token stored in memory (persists during app session)
  static String? _token;
  static UserModel? _currentUser;

  static String? get token => _token;
  static UserModel? get currentUser => _currentUser;
  static bool get isLoggedIn => _token != null && _currentUser != null;

  // Auth headers
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  // -----------------------------------------------
  // Session Persistence
  // -----------------------------------------------
  static Future<void> saveSession() async {
    final prefs = await SharedPreferences.getInstance();
    if (_token != null) {
      await prefs.setString('auth_token', _token!);
    }
    if (_currentUser != null) {
      await prefs.setString('user_data', jsonEncode(_currentUser!.toJson()));
    }
  }

  static Future<bool> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('auth_token');
    final savedUser = prefs.getString('user_data');
    if (savedToken != null && savedUser != null) {
      _token = savedToken;
      try {
        _currentUser = UserModel.fromJson(jsonDecode(savedUser));
        // Verify token is still valid by fetching profile
        final profile = await getMyProfile();
        if (profile != null) {
          return true;
        }
        // Token expired — clear
        await clearSession();
        return false;
      } catch (_) {
        await clearSession();
        return false;
      }
    }
    return false;
  }

  static Future<void> clearSession() async {
    _token = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  static void logout() {
    clearSession();
  }

  // -----------------------------------------------
  // AUTH: Sign Up
  // -----------------------------------------------
  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String password,
    String role = 'student',
    List<String> skills = const [],
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': role,
          'skills': skills,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        _token = data['token'];
        _currentUser = UserModel.fromJson(data['data']);
        await saveSession();
        return {'success': true, 'user': data['data']};
      }
      return {
        'success': false,
        'message': data['message'] ?? 'Registration failed',
      };
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // -----------------------------------------------
  // AUTH: Login
  // -----------------------------------------------
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _token = data['token'];
        _currentUser = UserModel.fromJson(data['data']);
        await saveSession();
        return {'success': true, 'user': data['data']};
      }
      return {'success': false, 'message': data['message'] ?? 'Login failed'};
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // -----------------------------------------------
  // PROFILE: Get current user
  // -----------------------------------------------
  static Future<UserModel?> getMyProfile() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/me'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _currentUser = UserModel.fromJson(data['data']);
        return _currentUser;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // -----------------------------------------------
  // PROFILE: Update current user
  // -----------------------------------------------
  static Future<Map<String, dynamic>> updateProfile({
    String? name,
    List<String>? skills,
    String? bio,
    String? github,
    String? linkedin,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      if (skills != null) body['skills'] = skills;
      if (bio != null) body['bio'] = bio;
      if (github != null) body['github'] = github;
      if (linkedin != null) body['linkedin'] = linkedin;

      final response = await http.put(
        Uri.parse('$baseUrl/users/me'),
        headers: _headers,
        body: jsonEncode(body),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _currentUser = UserModel.fromJson(data['data']);
        return {'success': true, 'user': data['data']};
      }
      return {'success': false, 'message': data['message'] ?? 'Update failed'};
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // -----------------------------------------------
  // EVENTS: Fetch all events (with optional search/filter)
  // -----------------------------------------------
  static Future<List<EventModel>> fetchEvents({
    String? search,
    String? category,
  }) async {
    try {
      final params = <String, String>{};
      if (search != null && search.isNotEmpty) params['search'] = search;
      if (category != null && category.isNotEmpty) {
        params['category'] = category;
      }

      final uri = Uri.parse(
        '$baseUrl/events',
      ).replace(queryParameters: params.isNotEmpty ? params : null);
      final response = await http.get(uri, headers: _headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final eventsList = data['data'] as List;
        return eventsList.map((json) => EventModel.fromJson(json)).toList();
      }
      throw Exception('Failed to load events');
    } catch (e) {
      throw Exception('Connection error: $e');
    }
  }

  // -----------------------------------------------
  // EVENTS: Get single event details
  // -----------------------------------------------
  static Future<Map<String, dynamic>?> getEventDetails(String eventId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/events/$eventId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // -----------------------------------------------
  // EVENTS: Get categories
  // -----------------------------------------------
  static Future<List<Map<String, dynamic>>> getCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/events/categories'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['data']);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // -----------------------------------------------
  // RSVP: RSVP to an event
  // -----------------------------------------------
  static Future<Map<String, dynamic>> rsvpToEvent(String eventId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/rsvps'),
        headers: _headers,
        body: jsonEncode({'eventId': eventId}),
      );

      final data = jsonDecode(response.body);
      return {
        'success': response.statusCode == 201,
        'message': data['message'] ?? 'Something went wrong',
      };
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // -----------------------------------------------
  // RSVP: Cancel RSVP
  // -----------------------------------------------
  static Future<Map<String, dynamic>> cancelRsvp(String eventId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/rsvps/$eventId'),
        headers: _headers,
      );

      final data = jsonDecode(response.body);
      return {
        'success': response.statusCode == 200,
        'message': data['message'] ?? 'Something went wrong',
      };
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // -----------------------------------------------
  // RSVP: Get my RSVPed events
  // -----------------------------------------------
  static Future<List<EventModel>> getMyRsvps() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/rsvps/my'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final eventsList = data['data'] as List;
        return eventsList.map((json) => EventModel.fromJson(json)).toList();
      }
      throw Exception('Failed to load RSVPs');
    } catch (e) {
      throw Exception('Connection error: $e');
    }
  }

  // -----------------------------------------------
  // RSVP: Check if user RSVPed to event
  // -----------------------------------------------
  static Future<bool> checkRsvp(String eventId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/rsvps/check/$eventId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['hasRSVPed'] ?? false;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // -----------------------------------------------
  // COMMUNITY: Fetch all users
  // -----------------------------------------------
  static Future<List<UserModel>> fetchAllUsers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List users = data['data'] ?? [];
        return users.map((u) => UserModel.fromJson(u)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // -----------------------------------------------
  // STATS: Get event stats (for home screen)
  // -----------------------------------------------
  static Future<Map<String, dynamic>> getEventStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/events/stats'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? {};
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  // -----------------------------------------------
  // AI: Ask Gemini a question
  // -----------------------------------------------
  static Future<Map<String, dynamic>> askAI(String question) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ai/ask'),
        headers: _headers,
        body: jsonEncode({'question': question}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'answer': data['answer'] ?? ''};
      }
      return {
        'success': false,
        'answer': data['message'] ?? 'Failed to get AI response.',
      };
    } catch (e) {
      return {
        'success': false,
        'answer': 'Could not connect to AI service. Check your connection.',
      };
    }
  }
}

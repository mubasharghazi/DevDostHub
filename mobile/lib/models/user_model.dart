class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final List<String> skills;
  final String bio;
  final String avatar;
  final String github;
  final String linkedin;
  final String createdAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.skills = const [],
    this.bio = '',
    this.avatar = '',
    this.github = '',
    this.linkedin = '',
    this.createdAt = '',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'student',
      skills: List<String>.from(json['skills'] ?? []),
      bio: json['bio'] ?? '',
      avatar: json['avatar'] ?? '',
      github: json['github'] ?? '',
      linkedin: json['linkedin'] ?? '',
      createdAt: json['createdAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'email': email,
    'role': role,
    'skills': skills,
    'bio': bio,
    'avatar': avatar,
    'github': github,
    'linkedin': linkedin,
  };

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  String get memberSince {
    try {
      final dt = DateTime.parse(createdAt);
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return '${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return '';
    }
  }
}

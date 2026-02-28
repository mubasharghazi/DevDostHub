class EventModel {
  final String id;
  final String title;
  final String description;
  final String date;
  final String? endDate;
  final String location;
  final String speaker;
  final String category;
  final int capacity;
  final List<String> tags;
  final bool isOnline;
  final String meetingLink;
  final String status;
  final int rsvpCount;
  final String? createdByName;

  EventModel({
    required this.id,
    required this.title,
    this.description = '',
    required this.date,
    this.endDate,
    required this.location,
    required this.speaker,
    this.category = 'meetup',
    this.capacity = 0,
    this.tags = const [],
    this.isOnline = false,
    this.meetingLink = '',
    this.status = 'upcoming',
    this.rsvpCount = 0,
    this.createdByName,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? 'Untitled Event',
      description: json['description'] ?? '',
      date: json['date'] ?? '',
      endDate: json['endDate'],
      location: json['location'] ?? 'TBA',
      speaker: json['speaker'] ?? 'TBA',
      category: json['category'] ?? 'meetup',
      capacity: json['capacity'] ?? 0,
      tags: List<String>.from(json['tags'] ?? []),
      isOnline: json['isOnline'] ?? false,
      meetingLink: json['meetingLink'] ?? '',
      status: json['status'] ?? 'upcoming',
      rsvpCount: json['rsvpCount'] ?? 0,
      createdByName: json['createdBy'] is Map
          ? json['createdBy']['name']
          : null,
    );
  }

  String get formattedDate {
    try {
      final dt = DateTime.parse(date);
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
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return date;
    }
  }

  String get formattedTime {
    try {
      final dt = DateTime.parse(date);
      final hour = dt.hour > 12 ? dt.hour - 12 : dt.hour;
      final ampm = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '$hour:$min $ampm';
    } catch (_) {
      return '';
    }
  }

  String get categoryIcon {
    switch (category) {
      case 'workshop':
        return '🛠️';
      case 'webinar':
        return '🎥';
      case 'hackathon':
        return '💻';
      case 'meetup':
        return '🤝';
      case 'conference':
        return '🎤';
      case 'bootcamp':
        return '🏋️';
      default:
        return '📅';
    }
  }

  String get categoryLabel {
    return category[0].toUpperCase() + category.substring(1);
  }

  bool get isUpcoming {
    try {
      return DateTime.parse(date).isAfter(DateTime.now());
    } catch (_) {
      return true;
    }
  }

  String get spotsText {
    if (capacity == 0) return 'Unlimited spots';
    final remaining = capacity - rsvpCount;
    if (remaining <= 0) return 'Full';
    return '$remaining spots left';
  }
}

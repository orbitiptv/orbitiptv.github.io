import 'orbit_credentials.dart';

class OrbitSession {
  const OrbitSession({required this.credentials, required this.account});

  final OrbitCredentials credentials;
  final Map<String, dynamic> account;

  String get displayName =>
      (account['username'] as String?)?.trim().isNotEmpty == true
          ? account['username'] as String
          : credentials.username;
}

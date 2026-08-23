import 'package:shared_preferences/shared_preferences.dart';

import '../models/orbit_credentials.dart';

class CredentialStore {
  static const _usernameKey = 'orbit.username';
  static const _passwordKey = 'orbit.password';

  Future<OrbitCredentials?> read() async {
    final preferences = await SharedPreferences.getInstance();
    final username = preferences.getString(_usernameKey);
    final password = preferences.getString(_passwordKey);
    if (username == null || password == null) return null;
    return OrbitCredentials(username: username, password: password);
  }

  Future<void> save(OrbitCredentials credentials) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_usernameKey, credentials.username);
    await preferences.setString(_passwordKey, credentials.password);
  }

  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_usernameKey);
    await preferences.remove(_passwordKey);
  }
}

import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/orbit_credentials.dart';
import '../models/orbit_session.dart';

class XtreamApiException implements Exception {
  const XtreamApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class XtreamApi {
  XtreamApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<OrbitSession> login(OrbitCredentials credentials) async {
    final response = await _client
        .get(credentials.apiUri())
        .timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      throw XtreamApiException(
          'Server je vratio grešku ${response.statusCode}.');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const XtreamApiException('Odgovor servera nije ispravan.');
    }
    final userInfo = decoded['user_info'];
    if (userInfo is! Map<String, dynamic> || '${userInfo['auth']}' != '1') {
      throw const XtreamApiException('Username ili password nisu ispravni.');
    }
    return OrbitSession(credentials: credentials, account: userInfo);
  }

  Future<List<Map<String, dynamic>>> liveCategories(
    OrbitCredentials credentials,
  ) =>
      _list(credentials, 'get_live_categories');

  Future<List<Map<String, dynamic>>> liveStreams(
    OrbitCredentials credentials, {
    String? categoryId,
  }) =>
      _list(credentials, 'get_live_streams', categoryId: categoryId);

  Future<List<Map<String, dynamic>>> vodCategories(
    OrbitCredentials credentials,
  ) =>
      _list(credentials, 'get_vod_categories');

  Future<List<Map<String, dynamic>>> vodStreams(
    OrbitCredentials credentials, {
    String? categoryId,
  }) =>
      _list(credentials, 'get_vod_streams', categoryId: categoryId);

  Future<List<Map<String, dynamic>>> seriesCategories(
    OrbitCredentials credentials,
  ) =>
      _list(credentials, 'get_series_categories');

  Future<List<Map<String, dynamic>>> series(
    OrbitCredentials credentials, {
    String? categoryId,
  }) =>
      _list(credentials, 'get_series', categoryId: categoryId);

  Future<Map<String, dynamic>> vodInfo(
    OrbitCredentials credentials,
    String vodId,
  ) =>
      _map(credentials, 'get_vod_info', {'vod_id': vodId});

  Future<Map<String, dynamic>> seriesInfo(
    OrbitCredentials credentials,
    String seriesId,
  ) =>
      _map(credentials, 'get_series_info', {'series_id': seriesId});

  Future<List<Map<String, dynamic>>> shortEpg(
    OrbitCredentials credentials,
    String streamId, {
    int limit = 20,
  }) async {
    final data = await _map(credentials, 'get_short_epg', {
      'stream_id': streamId,
      'limit': '$limit',
    });
    final listings = data['epg_listings'];
    if (listings is! List) return const [];
    return listings
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  Future<List<Map<String, dynamic>>> _list(
    OrbitCredentials credentials,
    String action, {
    String? categoryId,
  }) async {
    final response = await _client
        .get(credentials.apiUri({
          'action': action,
          if (categoryId != null) 'category_id': categoryId,
        }))
        .timeout(const Duration(seconds: 20));
    if (response.statusCode != 200) {
      throw XtreamApiException(
          'Učitavanje nije uspjelo (${response.statusCode}).');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! List) return const [];
    return decoded
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  Future<Map<String, dynamic>> _map(
    OrbitCredentials credentials,
    String action,
    Map<String, String> parameters,
  ) async {
    final response = await _client
        .get(credentials.apiUri({'action': action, ...parameters}))
        .timeout(const Duration(seconds: 20));
    if (response.statusCode != 200) {
      throw XtreamApiException('Loading failed (${response.statusCode}).');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map) return const {};
    return Map<String, dynamic>.from(decoded);
  }

  void close() => _client.close();
}

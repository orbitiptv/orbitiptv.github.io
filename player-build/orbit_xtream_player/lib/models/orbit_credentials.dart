import '../config/orbit_config.dart';

class OrbitCredentials {
  const OrbitCredentials({required this.username, required this.password});

  final String username;
  final String password;

  Uri apiUri([Map<String, String> query = const {}]) {
    return Uri.parse('${OrbitConfig.serverUrl}/player_api.php').replace(
      queryParameters: {
        'username': username,
        'password': password,
        ...query,
      },
    );
  }

  Uri liveStreamUri(String streamId, {String extension = 'ts'}) => Uri.parse(
        '${OrbitConfig.serverUrl}/live/$username/$password/$streamId.$extension',
      );

  Uri movieUri(String streamId, {String extension = 'mp4'}) => Uri.parse(
        '${OrbitConfig.serverUrl}/movie/$username/$password/$streamId.$extension',
      );

  Uri seriesUri(String streamId, {String extension = 'mp4'}) => Uri.parse(
        '${OrbitConfig.serverUrl}/series/$username/$password/$streamId.$extension',
      );

  Uri catchupUri(
    String streamId, {
    required int durationMinutes,
    required String start,
  }) =>
      Uri.parse(
        '${OrbitConfig.serverUrl}/timeshift/$username/$password/'
        '$durationMinutes/$start/$streamId.ts',
      );
}

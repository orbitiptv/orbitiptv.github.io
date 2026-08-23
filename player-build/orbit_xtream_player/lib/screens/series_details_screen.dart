import 'package:flutter/material.dart';

import '../models/orbit_session.dart';
import '../services/provider_subtitles.dart';
import '../services/xtream_api.dart';
import 'player_screen.dart';

class SeriesDetailsScreen extends StatefulWidget {
  const SeriesDetailsScreen({
    required this.series,
    required this.session,
    required this.api,
    super.key,
  });

  final Map<String, dynamic> series;
  final OrbitSession session;
  final XtreamApi api;

  @override
  State<SeriesDetailsScreen> createState() => _SeriesDetailsScreenState();
}

class _SeriesDetailsScreenState extends State<SeriesDetailsScreen> {
  late final Future<Map<String, dynamic>> _details;

  @override
  void initState() {
    super.initState();
    _details = widget.api.seriesInfo(
      widget.session.credentials,
      '${widget.series['series_id']}',
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = '${widget.series['name'] ?? 'Series'}';
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _details,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('${snapshot.error}'));
          }
          final details = snapshot.data ?? const {};
          final rawEpisodes = details['episodes'];
          if (rawEpisodes is! Map) {
            return const Center(
                child: Text('No episodes supplied by provider.'));
          }
          final seasons = rawEpisodes.entries.toList()
            ..sort((a, b) =>
                int.tryParse('${a.key}')
                    ?.compareTo(int.tryParse('${b.key}') ?? 0) ??
                '${a.key}'.compareTo('${b.key}'));
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              for (final season in seasons)
                Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ExpansionTile(
                    initiallyExpanded: seasons.length == 1,
                    title: Text('Season ${season.key}'),
                    children: [
                      for (final episode in (season.value is List
                          ? season.value as List
                          : const []))
                        if (episode is Map)
                          ListTile(
                            leading: const CircleAvatar(
                              child: Icon(Icons.play_arrow_rounded),
                            ),
                            title: Text(
                              '${episode['title'] ?? episode['name'] ?? 'Episode ${episode['episode_num'] ?? ''}'}',
                            ),
                            subtitle: Text(
                              'Episode ${episode['episode_num'] ?? ''}',
                            ),
                            trailing: const Icon(Icons.chevron_right_rounded),
                            onTap: () => _play(
                              Map<String, dynamic>.from(episode),
                              details,
                            ),
                          ),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _play(
    Map<String, dynamic> episode,
    Map<String, dynamic> details,
  ) async {
    final id = '${episode['id'] ?? episode['stream_id'] ?? ''}';
    if (id.isEmpty) return;
    final extension = '${episode['container_extension'] ?? 'mp4'}';
    final subtitles = findProviderSubtitles([episode, details['info']]);
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PlayerScreen(
          title: '${episode['title'] ?? episode['name'] ?? 'Episode'}',
          streamUri: widget.session.credentials.seriesUri(
            id,
            extension: extension.isEmpty ? 'mp4' : extension,
          ),
          isLive: false,
          providerSubtitles: subtitles,
        ),
      ),
    );
  }
}

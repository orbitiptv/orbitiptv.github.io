import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

import '../services/provider_subtitles.dart';

class PlayerScreen extends StatefulWidget {
  const PlayerScreen({
    required this.title,
    required this.streamUri,
    required this.isLive,
    this.providerSubtitles = const [],
    super.key,
  });

  final String title;
  final Uri streamUri;
  final bool isLive;
  final List<ProviderSubtitle> providerSubtitles;

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late final Player _player;
  late final VideoController _controller;

  @override
  void initState() {
    super.initState();
    _player = Player();
    _controller = VideoController(_player);
    _player.open(Media(widget.streamUri.toString()), play: true);
    if (widget.providerSubtitles.isNotEmpty) {
      final subtitle = widget.providerSubtitles.first;
      _player.setSubtitleTrack(
        SubtitleTrack.uri(subtitle.url, title: subtitle.label),
      );
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(widget.title),
        actions: [
          StreamBuilder<Tracks>(
            stream: _player.stream.tracks,
            builder: (context, snapshot) {
              final tracks = snapshot.data ?? _player.state.tracks;
              return PopupMenuButton<AudioTrack>(
                tooltip: 'Audio tracks',
                icon: const Icon(Icons.audiotrack_rounded),
                onSelected: _player.setAudioTrack,
                itemBuilder: (_) => [
                  const PopupMenuItem(
                    value: AudioTrack('auto', null, null),
                    child: Text('Auto audio'),
                  ),
                  for (final track in tracks.audio)
                    PopupMenuItem(
                      value: track,
                      child: Text(
                          track.title ?? track.language ?? 'Audio ${track.id}'),
                    ),
                ],
              );
            },
          ),
          StreamBuilder<Tracks>(
            stream: _player.stream.tracks,
            builder: (context, snapshot) {
              final tracks = snapshot.data ?? _player.state.tracks;
              return PopupMenuButton<SubtitleTrack>(
                tooltip: 'Subtitles',
                icon: const Icon(Icons.subtitles_rounded),
                onSelected: _player.setSubtitleTrack,
                itemBuilder: (_) => [
                  PopupMenuItem(
                    value: SubtitleTrack.no(),
                    child: const Text('Subtitles off'),
                  ),
                  for (final track in tracks.subtitle)
                    PopupMenuItem(
                      value: track,
                      child: Text(
                        track.title ?? track.language ?? 'Subtitle ${track.id}',
                      ),
                    ),
                  for (final subtitle in widget.providerSubtitles)
                    PopupMenuItem(
                      value: SubtitleTrack.uri(
                        subtitle.url,
                        title: subtitle.label,
                      ),
                      child: Text(subtitle.label),
                    ),
                ],
              );
            },
          ),
          if (widget.isLive)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 18),
              child: Center(
                child: Text(
                  'UŽIVO',
                  style: TextStyle(
                    color: Color(0xFFFF425C),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: Center(
        child: Video(
          controller: _controller,
          controls: AdaptiveVideoControls,
        ),
      ),
    );
  }
}

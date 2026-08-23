import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

import '../models/orbit_session.dart';
import '../services/favorite_store.dart';
import '../services/xtream_api.dart';
import 'player_screen.dart';

class LiveTvScreen extends StatefulWidget {
  const LiveTvScreen({
    required this.session,
    required this.api,
    super.key,
  });

  final OrbitSession session;
  final XtreamApi api;

  @override
  State<LiveTvScreen> createState() => _LiveTvScreenState();
}

class _LiveTvScreenState extends State<LiveTvScreen> {
  final _favoritesStore = FavoriteStore();
  final _player = Player();
  late final VideoController _video = VideoController(_player);
  List<Map<String, dynamic>> _categories = const [];
  List<Map<String, dynamic>> _channels = const [];
  List<Map<String, dynamic>> _allChannels = const [];
  List<Map<String, dynamic>> _epg = const [];
  Set<String> _favorites = {};
  String? _categoryId;
  Map<String, dynamic>? _selected;
  String _categorySearch = '';
  String _channelSearch = '';
  bool _loading = true;
  bool _favoritesOnly = false;

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    final results = await Future.wait([
      widget.api.liveCategories(widget.session.credentials),
      widget.api.liveStreams(widget.session.credentials),
      _favoritesStore.read(),
    ]);
    if (!mounted) return;
    setState(() {
      _categories = results[0] as List<Map<String, dynamic>>;
      _channels = results[1] as List<Map<String, dynamic>>;
      _allChannels = results[1] as List<Map<String, dynamic>>;
      _favorites = results[2] as Set<String>;
      _loading = false;
    });
  }

  Future<void> _selectCategory(String? id) async {
    setState(() {
      _categoryId = id;
      _favoritesOnly = false;
      _loading = true;
      _selected = null;
      _epg = const [];
    });
    await _player.stop();
    final channels = await widget.api.liveStreams(
      widget.session.credentials,
      categoryId: id,
    );
    if (mounted) {
      setState(() {
        _channels = channels;
        _loading = false;
      });
    }
  }

  void _showFavorites() {
    setState(() {
      _favoritesOnly = true;
      _categoryId = null;
      _selected = null;
      _epg = const [];
      _channels = _allChannels
          .where((item) => _favorites.contains('live:${item['stream_id']}'))
          .toList();
    });
    _player.stop();
  }

  Future<void> _preview(Map<String, dynamic> channel) async {
    final id = '${channel['stream_id']}';
    setState(() {
      _selected = channel;
      _epg = const [];
    });
    await _player.open(
      Media(widget.session.credentials.liveStreamUri(id).toString()),
      play: true,
    );
    try {
      final epg = await widget.api.shortEpg(widget.session.credentials, id);
      if (mounted && _selected?['stream_id'] == channel['stream_id']) {
        setState(() => _epg = epg);
      }
    } catch (_) {
      // EPG is optional and may not be supplied for every channel.
    }
  }

  Future<void> _toggleFavorite(Map<String, dynamic> channel) async {
    final key = 'live:${channel['stream_id']}';
    final favorites = await _favoritesStore.toggle(key);
    if (mounted) {
      setState(() {
        _favorites = favorites;
        if (_favoritesOnly) {
          _channels = _allChannels
              .where((item) => _favorites.contains('live:${item['stream_id']}'))
              .toList();
        }
      });
    }
  }

  Future<void> _fullScreen() async {
    final channel = _selected;
    if (channel == null) return;
    await _player.stop();
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PlayerScreen(
          title: '${channel['name'] ?? 'Live TV'}',
          streamUri: widget.session.credentials.liveStreamUri(
            '${channel['stream_id']}',
          ),
          isLive: true,
        ),
      ),
    );
    if (mounted) await _preview(channel);
  }

  Future<void> _playCatchup(Map<String, dynamic> event) async {
    final channel = _selected;
    if (channel == null) return;
    final start = DateTime.tryParse('${event['start'] ?? ''}');
    if (start == null || start.isAfter(DateTime.now())) return;
    final end = DateTime.tryParse('${event['end'] ?? ''}');
    final duration =
        end == null ? 60 : end.difference(start).inMinutes.clamp(1, 1440);
    String two(int value) => value.toString().padLeft(2, '0');
    final providerStart = '${start.year}-${two(start.month)}-${two(start.day)}:'
        '${two(start.hour)}-${two(start.minute)}';
    await _player.stop();
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PlayerScreen(
          title: _decode(event['title']),
          streamUri: widget.session.credentials.catchupUri(
            '${channel['stream_id']}',
            durationMinutes: duration,
            start: providerStart,
          ),
          isLive: false,
        ),
      ),
    );
    if (mounted) await _preview(channel);
  }

  String _decode(Object? value) {
    final text = '$value';
    try {
      return utf8.decode(base64Decode(text));
    } catch (_) {
      return text;
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categories = _categories
        .where((item) => '${item['category_name']}'
            .toLowerCase()
            .contains(_categorySearch.toLowerCase()))
        .toList();
    final channels = _channels
        .where((item) => '${item['name']}'
            .toLowerCase()
            .contains(_channelSearch.toLowerCase()))
        .toList();
    return Row(
      children: [
        SizedBox(
          width: 280,
          child: Column(children: [
            _Search(
                hint: 'Search countries / categories',
                onChanged: (v) => setState(() => _categorySearch = v)),
            Expanded(
                child: ListView(children: [
              ListTile(
                selected: _categoryId == null && !_favoritesOnly,
                leading: const Icon(Icons.public_rounded),
                title: const Text('All channels'),
                onTap: () => _selectCategory(null),
              ),
              ListTile(
                selected: _favoritesOnly,
                leading: const Icon(Icons.favorite_rounded),
                title: const Text('Favorites'),
                trailing: Text('${_favorites.length}'),
                onTap: _showFavorites,
              ),
              for (final category in categories)
                ListTile(
                  selected: _categoryId == '${category['category_id']}',
                  leading: const Icon(Icons.folder_outlined),
                  title: Text('${category['category_name'] ?? 'Country'}',
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  onTap: () => _selectCategory('${category['category_id']}'),
                ),
            ])),
          ]),
        ),
        const VerticalDivider(width: 1),
        SizedBox(
          width: 390,
          child: Column(children: [
            _Search(
                hint: 'Search live channels',
                onChanged: (v) => setState(() => _channelSearch = v)),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: channels.length,
                      itemBuilder: (_, i) {
                        final channel = channels[i];
                        final favorite =
                            _favorites.contains('live:${channel['stream_id']}');
                        return ListTile(
                          selected:
                              _selected?['stream_id'] == channel['stream_id'],
                          leading: _ChannelLogo(
                              url: '${channel['stream_icon'] ?? ''}'),
                          title: Text('${channel['name'] ?? 'Channel'}',
                              maxLines: 2, overflow: TextOverflow.ellipsis),
                          trailing: IconButton(
                            icon: Icon(
                                favorite
                                    ? Icons.favorite_rounded
                                    : Icons.favorite_border_rounded,
                                color:
                                    favorite ? const Color(0xFFFF4D72) : null),
                            onPressed: () => _toggleFavorite(channel),
                          ),
                          onTap: () => _preview(channel),
                          onLongPress: () async {
                            await _preview(channel);
                            await _fullScreen();
                          },
                        );
                      },
                    ),
            ),
          ]),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          child: Column(children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: ColoredBox(
                color: Colors.black,
                child: _selected == null
                    ? const Center(child: Text('Select a channel for preview'))
                    : GestureDetector(
                        onDoubleTap: _fullScreen,
                        child: Video(
                            controller: _video,
                            controls: AdaptiveVideoControls)),
              ),
            ),
            ListTile(
              title: Text('${_selected?['name'] ?? 'Live preview'}'),
              subtitle: const Text('Double-click player for full screen'),
              trailing: IconButton(
                  onPressed: _selected == null ? null : _fullScreen,
                  icon: const Icon(Icons.fullscreen_rounded)),
            ),
            const Divider(height: 1),
            const ListTile(
                leading: Icon(Icons.calendar_month_rounded),
                title: Text('Electronic Program Guide'),
                trailing: Text('Catch-up')),
            Expanded(
              child: _epg.isEmpty
                  ? const Center(child: Text('No EPG supplied by provider'))
                  : ListView.builder(
                      itemCount: _epg.length,
                      itemBuilder: (_, i) {
                        final event = _epg[i];
                        return ListTile(
                          dense: true,
                          title: Text(_decode(event['title'])),
                          subtitle: Text(
                              '${event['start'] ?? ''}  –  ${event['end'] ?? ''}'),
                          trailing: '${_selected?['tv_archive']}' == '1'
                              ? IconButton(
                                  tooltip: 'Play catch-up',
                                  icon: const Icon(Icons.history_rounded),
                                  onPressed: () => _playCatchup(event),
                                )
                              : null,
                        );
                      },
                    ),
            ),
          ]),
        ),
      ],
    );
  }
}

class _Search extends StatelessWidget {
  const _Search({required this.hint, required this.onChanged});
  final String hint;
  final ValueChanged<String> onChanged;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(12),
        child: TextField(
            onChanged: onChanged,
            decoration: InputDecoration(
                hintText: hint,
                prefixIcon: const Icon(Icons.search_rounded),
                isDense: true)),
      );
}

class _ChannelLogo extends StatelessWidget {
  const _ChannelLogo({required this.url});
  final String url;
  @override
  Widget build(BuildContext context) => SizedBox.square(
        dimension: 42,
        child: url.startsWith('http')
            ? Image.network(url,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Icon(Icons.live_tv_rounded))
            : const Icon(Icons.live_tv_rounded),
      );
}

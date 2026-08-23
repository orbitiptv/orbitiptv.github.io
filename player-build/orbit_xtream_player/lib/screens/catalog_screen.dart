import 'package:flutter/material.dart';

import '../models/orbit_session.dart';
import '../services/provider_subtitles.dart';
import '../services/xtream_api.dart';
import '../services/favorite_store.dart';
import 'player_screen.dart';
import 'series_details_screen.dart';

enum CatalogType { live, movie, series }

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({
    required this.title,
    required this.icon,
    required this.loadCategories,
    required this.loadItems,
    required this.session,
    required this.type,
    required this.api,
    super.key,
  });

  final String title;
  final IconData icon;
  final Future<List<Map<String, dynamic>>> Function() loadCategories;
  final Future<List<Map<String, dynamic>>> Function(String? categoryId)
      loadItems;
  final OrbitSession session;
  final CatalogType type;
  final XtreamApi api;

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  List<Map<String, dynamic>> _categories = const [];
  List<Map<String, dynamic>> _items = const [];
  String? _categoryId;
  String _query = '';
  bool _loading = true;
  String? _error;
  final _favoriteStore = FavoriteStore();
  Set<String> _favorites = {};

  @override
  void initState() {
    super.initState();
    _favoriteStore.read().then((value) {
      if (mounted) setState(() => _favorites = value);
    });
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final categories = await widget.loadCategories();
      final items = await widget.loadItems(_categoryId);
      if (!mounted) return;
      setState(() {
        _categories = categories;
        _items = items;
      });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _selectCategory(String? id) async {
    setState(() {
      _categoryId = id;
      _loading = true;
    });
    try {
      final items = await widget.loadItems(id);
      if (mounted) setState(() => _items = items);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final visible = _items.where((item) {
      final name = '${item['name'] ?? item['title'] ?? ''}'.toLowerCase();
      return name.contains(_query.toLowerCase());
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(26, 22, 26, 12),
          child: Row(
            children: [
              Icon(widget.icon, size: 30),
              const SizedBox(width: 12),
              Text(widget.title,
                  style: Theme.of(context).textTheme.headlineSmall),
              const Spacer(),
              SizedBox(
                width: 320,
                child: TextField(
                  onChanged: (value) => setState(() => _query = value),
                  decoration: const InputDecoration(
                    hintText: 'Pretraži…',
                    prefixIcon: Icon(Icons.search_rounded),
                    isDense: true,
                  ),
                ),
              ),
              IconButton(
                  onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
            ],
          ),
        ),
        SizedBox(
          height: 54,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: const Text('Sve'),
                  selected: _categoryId == null,
                  onSelected: (_) => _selectCategory(null),
                ),
              ),
              ..._categories.map((category) {
                final id = '${category['category_id']}';
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text('${category['category_name'] ?? 'Kategorija'}'),
                    selected: _categoryId == id,
                    onSelected: (_) => _selectCategory(id),
                  ),
                );
              }),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!))
                  : GridView.builder(
                      padding: const EdgeInsets.all(24),
                      gridDelegate:
                          const SliverGridDelegateWithMaxCrossAxisExtent(
                        maxCrossAxisExtent: 210,
                        mainAxisExtent: 260,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                      ),
                      itemCount: visible.length,
                      itemBuilder: (context, index) => _CatalogCard(
                        item: visible[index],
                        onTap: () => _openItem(visible[index]),
                        favorite:
                            _favorites.contains(_favoriteKey(visible[index])),
                        onFavorite: () => _toggleFavorite(visible[index]),
                      ),
                    ),
        ),
      ],
    );
  }

  Future<void> _openItem(Map<String, dynamic> item) async {
    if (widget.type == CatalogType.series) {
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => SeriesDetailsScreen(
            series: item,
            session: widget.session,
            api: widget.api,
          ),
        ),
      );
      return;
    }
    final streamId = '${item['stream_id'] ?? ''}';
    if (streamId.isEmpty) return;
    final extension = '${item['container_extension'] ?? ''}';
    final uri = widget.type == CatalogType.live
        ? widget.session.credentials.liveStreamUri(
            streamId,
            extension: extension.isEmpty ? 'ts' : extension,
          )
        : widget.session.credentials.movieUri(
            streamId,
            extension: extension.isEmpty ? 'mp4' : extension,
          );
    var subtitles = const <ProviderSubtitle>[];
    if (widget.type == CatalogType.movie) {
      try {
        final details = await widget.api.vodInfo(
          widget.session.credentials,
          streamId,
        );
        subtitles = findProviderSubtitles(details);
      } catch (_) {}
    }
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PlayerScreen(
          title: '${item['name'] ?? item['title'] ?? 'ORBIT'}',
          streamUri: uri,
          isLive: widget.type == CatalogType.live,
          providerSubtitles: subtitles,
        ),
      ),
    );
  }

  String _favoriteKey(Map<String, dynamic> item) {
    final prefix = widget.type == CatalogType.movie ? 'movie' : 'series';
    final id = widget.type == CatalogType.series
        ? item['series_id']
        : item['stream_id'];
    return '$prefix:$id';
  }

  Future<void> _toggleFavorite(Map<String, dynamic> item) async {
    final favorites = await _favoriteStore.toggle(_favoriteKey(item));
    if (mounted) setState(() => _favorites = favorites);
  }
}

class _CatalogCard extends StatelessWidget {
  const _CatalogCard(
      {required this.item,
      required this.onTap,
      required this.favorite,
      required this.onFavorite});
  final Map<String, dynamic> item;
  final VoidCallback onTap;
  final bool favorite;
  final VoidCallback onFavorite;

  @override
  Widget build(BuildContext context) {
    final name = '${item['name'] ?? item['title'] ?? 'Bez naziva'}';
    final image = '${item['stream_icon'] ?? item['cover'] ?? ''}';
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: image.startsWith('http')
                  ? Image.network(
                      image,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const _ImageFallback(),
                    )
                  : const _ImageFallback(),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 6, 4, 6),
              child: Row(children: [
                Expanded(
                    child: Text(name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700))),
                IconButton(
                  tooltip: favorite ? 'Remove favorite' : 'Add favorite',
                  onPressed: onFavorite,
                  icon: Icon(
                      favorite
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      color: favorite ? const Color(0xFFFF4D72) : null),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageFallback extends StatelessWidget {
  const _ImageFallback();
  @override
  Widget build(BuildContext context) => const ColoredBox(
        color: Color(0xFF0A1626),
        child: Center(child: Icon(Icons.play_circle_outline_rounded, size: 50)),
      );
}

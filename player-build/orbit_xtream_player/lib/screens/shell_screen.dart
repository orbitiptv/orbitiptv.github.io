import 'package:flutter/material.dart';

import '../models/orbit_session.dart';
import '../services/app_settings.dart';
import '../services/xtream_api.dart';
import 'catalog_screen.dart';
import 'live_tv_screen.dart';
import 'settings_screen.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({required this.session, super.key});

  final OrbitSession session;

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  final _api = XtreamApi();
  var _index = 0;
  var _language = 'en';

  @override
  void initState() {
    super.initState();
    AppSettings().language().then((value) {
      if (mounted) setState(() => _language = value);
    });
  }

  @override
  void dispose() {
    _api.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      LiveTvScreen(
        session: widget.session,
        api: _api,
      ),
      CatalogScreen(
        title: orbitText(_language, 'movies'),
        icon: Icons.movie_creation_outlined,
        loadCategories: () => _api.vodCategories(widget.session.credentials),
        loadItems: (category) => _api.vodStreams(
          widget.session.credentials,
          categoryId: category,
        ),
        session: widget.session,
        type: CatalogType.movie,
        api: _api,
      ),
      CatalogScreen(
        title: orbitText(_language, 'series'),
        icon: Icons.video_library_outlined,
        loadCategories: () => _api.seriesCategories(widget.session.credentials),
        loadItems: (category) => _api.series(
          widget.session.credentials,
          categoryId: category,
        ),
        session: widget.session,
        type: CatalogType.series,
        api: _api,
      ),
      SettingsScreen(
        session: widget.session,
        language: _language,
        onLanguageChanged: (value) => setState(() => _language = value),
      ),
    ];

    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _index,
            onDestinationSelected: (value) => setState(() => _index = value),
            extended: MediaQuery.sizeOf(context).width >= 1050,
            backgroundColor: const Color(0xFF071222),
            leading: Padding(
              padding: const EdgeInsets.symmetric(vertical: 18),
              child:
                  Image.asset('assets/orbit-logo.png', width: 92, height: 54),
            ),
            destinations: [
              NavigationRailDestination(
                icon: const Icon(Icons.live_tv_outlined),
                selectedIcon: const Icon(Icons.live_tv_rounded),
                label: Text(orbitText(_language, 'live')),
              ),
              NavigationRailDestination(
                icon: const Icon(Icons.movie_outlined),
                selectedIcon: const Icon(Icons.movie_rounded),
                label: Text(orbitText(_language, 'movies')),
              ),
              NavigationRailDestination(
                icon: const Icon(Icons.video_library_outlined),
                selectedIcon: const Icon(Icons.video_library_rounded),
                label: Text(orbitText(_language, 'series')),
              ),
              NavigationRailDestination(
                icon: const Icon(Icons.settings_outlined),
                selectedIcon: const Icon(Icons.settings_rounded),
                label: Text(orbitText(_language, 'settings')),
              ),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: IndexedStack(index: _index, children: pages)),
        ],
      ),
    );
  }
}

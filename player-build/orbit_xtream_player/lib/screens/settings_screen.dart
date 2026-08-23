import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/orbit_session.dart';
import '../services/app_settings.dart';
import '../services/credential_store.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen(
      {required this.session,
      required this.language,
      required this.onLanguageChanged,
      super.key});
  final OrbitSession session;
  final String language;
  final ValueChanged<String> onLanguageChanged;
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _store = AppSettings();
  bool _autoplay = true,
      _resume = true,
      _hardware = true,
      _subtitles = true,
      _clock = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final values = await Future.wait([
      _store.boolean('autoplay', fallback: true),
      _store.boolean('resume', fallback: true),
      _store.boolean('hardware', fallback: true),
      _store.boolean('subtitles', fallback: true),
      _store.boolean('clock', fallback: true),
    ]);
    if (mounted) {
      setState(() {
        _autoplay = values[0];
        _resume = values[1];
        _hardware = values[2];
        _subtitles = values[3];
        _clock = values[4];
      });
    }
  }

  Widget _toggle(String key, String title, String subtitle, IconData icon,
          bool value, ValueChanged<bool> update) =>
      SwitchListTile(
        secondary: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        value: value,
        onChanged: (next) {
          update(next);
          _store.setBoolean(key, next);
        },
      );

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.all(28),
        children: [
          Text(orbitText(widget.language, 'settings'),
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 20),
          Card(
              child: Column(children: [
            ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person_rounded)),
                title: Text(widget.session.displayName),
                subtitle: Text(orbitText(widget.language, 'account'))),
            const Divider(height: 1),
            const ListTile(
                leading: Icon(Icons.dns_rounded),
                title: Text('Provider'),
                subtitle: Text('ORBIT IPTV')),
          ])),
          const SizedBox(height: 14),
          Card(
              child: Column(children: [
            ListTile(
              leading: const Icon(Icons.language_rounded),
              title: Text(orbitText(widget.language, 'language')),
              trailing: DropdownButton<String>(
                  value: widget.language,
                  items: AppSettings.languages.entries
                      .map((e) =>
                          DropdownMenuItem(value: e.key, child: Text(e.value)))
                      .toList(),
                  onChanged: (value) async {
                    if (value != null) {
                      await _store.setLanguage(value);
                      widget.onLanguageChanged(value);
                    }
                  }),
            ),
            const Divider(height: 1),
            _toggle(
                'autoplay',
                'Autoplay preview',
                'Start the small player when a channel is selected',
                Icons.play_circle_outline,
                _autoplay,
                (v) => setState(() => _autoplay = v)),
            _toggle(
                'resume',
                'Resume playback',
                'Continue movies and episodes from the last position',
                Icons.history_rounded,
                _resume,
                (v) => setState(() => _resume = v)),
            _toggle(
                'hardware',
                'Hardware decoding',
                'Use GPU acceleration when supported',
                Icons.memory_rounded,
                _hardware,
                (v) => setState(() => _hardware = v)),
            _toggle(
                'subtitles',
                'Provider subtitles',
                'Automatically load subtitles supplied by ORBIT',
                Icons.subtitles_rounded,
                _subtitles,
                (v) => setState(() => _subtitles = v)),
            _toggle(
                'clock',
                'Show clock in player',
                'Display current time during playback',
                Icons.schedule_rounded,
                _clock,
                (v) => setState(() => _clock = v)),
          ])),
          const SizedBox(height: 14),
          Card(
              child: Column(children: [
            const ListTile(
                leading: Icon(Icons.translate_rounded),
                title: Text('Preferred subtitle language'),
                subtitle: Text('Auto / English / BCS / German / Slovenian')),
            const Divider(height: 1),
            const ListTile(
                leading: Icon(Icons.lock_outline_rounded),
                title: Text('Parental control'),
                subtitle: Text('PIN protection for adult categories'),
                trailing: Icon(Icons.chevron_right_rounded)),
            const Divider(height: 1),
            ListTile(
                leading: const Icon(Icons.cached_rounded),
                title: const Text('Clear local cache'),
                subtitle: const Text('EPG, images and playback history'),
                onTap: () async {
                  final p = await SharedPreferences.getInstance();
                  final language = p.getString('orbit.language');
                  await p.clear();
                  if (language != null) {
                    await p.setString('orbit.language', language);
                  }
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Local cache cleared')));
                  }
                }),
            const Divider(height: 1),
            const ListTile(
                leading: Icon(Icons.info_outline_rounded),
                title: Text('Diagnostics'),
                subtitle: Text('Connection, codecs and app information'),
                trailing: Icon(Icons.chevron_right_rounded)),
          ])),
          const SizedBox(height: 18),
          OutlinedButton.icon(
              onPressed: () async {
                await CredentialStore().clear();
                if (!context.mounted) return;
                await Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (_) => false);
              },
              icon: const Icon(Icons.logout_rounded),
              label: Text(orbitText(widget.language, 'logout'))),
        ],
      );
}

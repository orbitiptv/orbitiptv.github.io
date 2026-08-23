import 'package:shared_preferences/shared_preferences.dart';

class AppSettings {
  static const languages = <String, String>{
    'en': 'English',
    'bs': 'Bosanski / Hrvatski / Srpski',
    'de': 'Deutsch',
    'sl': 'Slovenščina',
    'it': 'Italiano',
  };

  Future<String> language() async =>
      (await SharedPreferences.getInstance()).getString('orbit.language') ??
      'en';

  Future<void> setLanguage(String value) async =>
      (await SharedPreferences.getInstance())
          .setString('orbit.language', value);

  Future<bool> boolean(String key, {bool fallback = false}) async =>
      (await SharedPreferences.getInstance()).getBool('orbit.$key') ?? fallback;

  Future<void> setBoolean(String key, bool value) async =>
      (await SharedPreferences.getInstance()).setBool('orbit.$key', value);
}

String orbitText(String language, String key) {
  const values = <String, Map<String, String>>{
    'en': {
      'live': 'Live TV',
      'movies': 'Movies',
      'series': 'Series',
      'favorites': 'Favorites',
      'settings': 'Settings',
      'logout': 'Log out',
      'account': 'ORBIT IPTV account',
      'language': 'Language'
    },
    'bs': {
      'live': 'TV uživo',
      'movies': 'Filmovi',
      'series': 'Serije',
      'favorites': 'Favoriti',
      'settings': 'Postavke',
      'logout': 'Odjava',
      'account': 'ORBIT IPTV račun',
      'language': 'Jezik'
    },
    'de': {
      'live': 'Live-TV',
      'movies': 'Filme',
      'series': 'Serien',
      'favorites': 'Favoriten',
      'settings': 'Einstellungen',
      'logout': 'Abmelden',
      'account': 'ORBIT IPTV-Konto',
      'language': 'Sprache'
    },
    'sl': {
      'live': 'TV v živo',
      'movies': 'Filmi',
      'series': 'Serije',
      'favorites': 'Priljubljene',
      'settings': 'Nastavitve',
      'logout': 'Odjava',
      'account': 'Račun ORBIT IPTV',
      'language': 'Jezik'
    },
    'it': {
      'live': 'TV in diretta',
      'movies': 'Film',
      'series': 'Serie',
      'favorites': 'Preferiti',
      'settings': 'Impostazioni',
      'logout': 'Esci',
      'account': 'Account ORBIT IPTV',
      'language': 'Lingua'
    },
  };
  return values[language]?[key] ?? values['en']![key] ?? key;
}

import 'package:shared_preferences/shared_preferences.dart';

class FavoriteStore {
  static const _key = 'orbit.favorites';

  Future<Set<String>> read() async {
    final preferences = await SharedPreferences.getInstance();
    return (preferences.getStringList(_key) ?? const []).toSet();
  }

  Future<Set<String>> toggle(String id) async {
    final preferences = await SharedPreferences.getInstance();
    final favorites = (preferences.getStringList(_key) ?? const []).toSet();
    favorites.contains(id) ? favorites.remove(id) : favorites.add(id);
    await preferences.setStringList(_key, favorites.toList());
    return favorites;
  }
}

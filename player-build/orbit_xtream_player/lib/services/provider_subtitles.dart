class ProviderSubtitle {
  const ProviderSubtitle({required this.url, required this.label});
  final String url;
  final String label;
}

List<ProviderSubtitle> findProviderSubtitles(Object? value) {
  final found = <String, ProviderSubtitle>{};

  void visit(Object? node, [String label = 'Provider subtitle']) {
    if (node is String) {
      final lower = node.toLowerCase().split('?').first;
      if (node.startsWith('http') &&
          (lower.endsWith('.srt') ||
              lower.endsWith('.vtt') ||
              lower.endsWith('.ass') ||
              lower.endsWith('.ssa'))) {
        found[node] = ProviderSubtitle(url: node, label: label);
      }
    } else if (node is List) {
      for (final item in node) {
        visit(item, label);
      }
    } else if (node is Map) {
      final url = node['url'] ?? node['file'] ?? node['src'];
      final title =
          '${node['label'] ?? node['language'] ?? node['lang'] ?? label}';
      visit(url, title);
      for (final entry in node.entries) {
        visit(entry.value, '${entry.key}');
      }
    }
  }

  visit(value);
  return found.values.toList();
}

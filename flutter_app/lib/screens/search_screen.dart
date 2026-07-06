import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';
import '../widgets/business_details_modal.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _query = '';
  String? _selectedCategory;
  String? _selectedCity;

  static const List<String> _cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Dearborn', 'Dallas'
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final colorScheme = Theme.of(context).colorScheme;

    final filtered = provider.businesses.where((b) {
      if (b.status != BusinessStatus.active) return false;
      final matchQuery = _query.isEmpty ||
          b.name.toLowerCase().contains(_query.toLowerCase()) ||
          (b.description[lang] ?? '').toLowerCase().contains(_query.toLowerCase()) ||
          (b.subcategory[lang] ?? '').toLowerCase().contains(_query.toLowerCase());
      final matchCat = _selectedCategory == null || b.categoryId == _selectedCategory;
      final matchCity = _selectedCity == null || b.city == _selectedCity;
      return matchQuery && matchCat && matchCity;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'search')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            color: const Color(0xFF0F4C3A),
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: t(lang, 'searchPlaceholder'),
                hintStyle: TextStyle(color: Colors.grey[400]),
                filled: true,
                fillColor: Colors.white,
                prefixIcon: const Icon(LucideIcons.search, color: Color(0xFF0F4C3A)),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: const Icon(LucideIcons.x),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _query = '');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Filters row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                // City filter
                _FilterChip(
                  label: _selectedCity ?? t(lang, 'allCities'),
                  onTap: () => _showCityPicker(context, lang),
                  active: _selectedCity != null,
                ),
                const SizedBox(width: 8),
                // Category filter
                _FilterChip(
                  label: _selectedCategory != null
                      ? (provider.categories.firstWhere((c) => c.id == _selectedCategory, orElse: () => provider.categories.first).name[lang] ?? '')
                      : t(lang, 'allCategories'),
                  onTap: () => _showCategoryPicker(context, provider.categories, lang),
                  active: _selectedCategory != null,
                ),
                if (_selectedCity != null || _selectedCategory != null) ...[
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() {
                      _selectedCity = null;
                      _selectedCategory = null;
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Clear', style: TextStyle(color: Colors.red, fontSize: 12)),
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Results count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Text(
                  '${filtered.length} ${t(lang, 'resultsCount')}',
                  style: TextStyle(color: colorScheme.onSurface.withOpacity(0.6), fontSize: 13),
                ),
              ],
            ),
          ),

          // Results list
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.searchX, size: 48, color: colorScheme.onSurface.withOpacity(0.3)),
                        const SizedBox(height: 12),
                        Text(t(lang, 'noResults'), textAlign: TextAlign.center,
                            style: TextStyle(color: colorScheme.onSurface.withOpacity(0.5))),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      return _SearchResultTile(business: filtered[index], lang: lang);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _showCityPicker(BuildContext context, String lang) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          ListTile(
            title: Text(t(lang, 'allCities')),
            onTap: () {
              setState(() => _selectedCity = null);
              Navigator.pop(context);
            },
          ),
          ..._cities.map((city) => ListTile(
                title: Text(city),
                trailing: _selectedCity == city ? const Icon(LucideIcons.check, color: Color(0xFF0F4C3A)) : null,
                onTap: () {
                  setState(() => _selectedCity = city);
                  Navigator.pop(context);
                },
              )),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  void _showCategoryPicker(BuildContext context, List<Category> categories, String lang) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          ListTile(
            title: Text(t(lang, 'allCategories')),
            onTap: () {
              setState(() => _selectedCategory = null);
              Navigator.pop(context);
            },
          ),
          ...categories.map((cat) => ListTile(
                title: Text(cat.name[lang] ?? cat.name['en'] ?? ''),
                trailing: _selectedCategory == cat.id ? const Icon(LucideIcons.check, color: Color(0xFF0F4C3A)) : null,
                onTap: () {
                  setState(() => _selectedCategory = cat.id);
                  Navigator.pop(context);
                },
              )),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool active;
  const _FilterChip({required this.label, required this.onTap, required this.active});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF0F4C3A) : Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? const Color(0xFF0F4C3A) : Colors.grey.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: active ? Colors.white : Theme.of(context).colorScheme.onSurface,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            Icon(LucideIcons.chevronDown, size: 14, color: active ? Colors.white : Colors.grey),
          ],
        ),
      ),
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  final Business business;
  final String lang;
  const _SearchResultTile({required this.business, required this.lang});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => showBusinessDetailsModal(context, business),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 3))],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(
                business.logoUrl,
                width: 56,
                height: 56,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 56,
                  height: 56,
                  color: const Color(0xFF0F4C3A).withOpacity(0.2),
                  child: const Icon(LucideIcons.store, color: Color(0xFF0F4C3A)),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(business.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(
                    business.subcategory[lang] ?? business.subcategory['en'] ?? '',
                    style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.55)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.mapPin, size: 11, color: Color(0xFF0F4C3A)),
                      const SizedBox(width: 3),
                      Text('${business.city} · ${business.area}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF0F4C3A))),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.star, size: 13, color: Colors.amber),
                    const SizedBox(width: 3),
                    Text(business.rating.toStringAsFixed(1),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                if (business.isVerified)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Icon(LucideIcons.badgeCheck, size: 16, color: const Color(0xFF0F4C3A)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

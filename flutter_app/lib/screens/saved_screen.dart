import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../data/translations.dart';
import '../widgets/business_details_modal.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final colorScheme = Theme.of(context).colorScheme;

    final savedBusinesses = provider.businesses
        .where((b) => provider.favorites.contains(b.id))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'savedLists')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: savedBusinesses.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.heart, size: 64, color: colorScheme.onSurface.withOpacity(0.2)),
                    const SizedBox(height: 16),
                    Text(
                      t(lang, 'noSaved'),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: savedBusinesses.length,
              itemBuilder: (context, index) {
                final biz = savedBusinesses[index];
                return GestureDetector(
                  onTap: () => showBusinessDetailsModal(context, biz),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            biz.logoUrl,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 60,
                              height: 60,
                              color: const Color(0xFF0F4C3A).withOpacity(0.2),
                              child: const Icon(LucideIcons.store, color: Color(0xFF0F4C3A)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                biz.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                biz.subcategory[lang] ?? biz.subcategory['en'] ?? '',
                                style: TextStyle(fontSize: 12, color: colorScheme.onSurface.withOpacity(0.55)),
                              ),
                              const SizedBox(height: 5),
                              Row(
                                children: [
                                  const Icon(LucideIcons.mapPin, size: 12, color: Color(0xFF0F4C3A)),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${biz.city} · ${biz.area}',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFF0F4C3A)),
                                  ),
                                  const SizedBox(width: 10),
                                  const Icon(LucideIcons.star, size: 12, color: Colors.amber),
                                  const SizedBox(width: 3),
                                  Text(
                                    biz.rating.toStringAsFixed(1),
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.heart, color: Colors.red),
                          onPressed: () => provider.toggleFavorite(biz.id),
                          tooltip: 'Remove from saved',
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

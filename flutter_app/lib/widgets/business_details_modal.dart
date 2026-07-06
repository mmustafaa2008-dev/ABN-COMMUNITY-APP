import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';

/// Shows the business details modal bottom sheet.
void showBusinessDetailsModal(BuildContext context, Business business) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (_) => ChangeNotifierProvider.value(
      value: context.read<DirectoryProvider>(),
      child: _BusinessDetailsModal(business: business),
    ),
  );
}

class _BusinessDetailsModal extends StatefulWidget {
  final Business business;
  const _BusinessDetailsModal({required this.business});

  @override
  State<_BusinessDetailsModal> createState() => _BusinessDetailsModalState();
}

class _BusinessDetailsModalState extends State<_BusinessDetailsModal> {
  bool _showReviewForm = false;
  double _reviewRating = 5.0;
  final _commentCtrl = TextEditingController();

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final biz = widget.business;
    final isFav = provider.favorites.contains(biz.id);
    final reviews = provider.reviews.where((r) => r.businessId == biz.id).toList();

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollCtrl) => Column(
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4)),
          ),
          Expanded(
            child: ListView(
              controller: scrollCtrl,
              padding: EdgeInsets.zero,
              children: [
                // Cover image
                Stack(
                  children: [
                    ClipRRect(
                      child: Image.network(
                        biz.coverUrl,
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(height: 180, color: const Color(0xFF0F4C3A).withOpacity(0.2)),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: GestureDetector(
                        onTap: () => provider.toggleFavorite(biz.id),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                          child: Icon(LucideIcons.heart, color: isFav ? Colors.red : Colors.grey, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),

                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name + verified
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.network(biz.logoUrl, width: 50, height: 50, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(width: 50, height: 50, color: const Color(0xFF0F4C3A).withOpacity(0.2))),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(biz.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                    ),
                                    if (biz.isVerified) const Icon(LucideIcons.badgeCheck, color: Color(0xFF0F4C3A), size: 20),
                                  ],
                                ),
                                Text(biz.subcategory[lang] ?? biz.subcategory['en'] ?? '',
                                    style: TextStyle(fontSize: 13, color: Colors.grey[600])),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Rating + city
                      Row(
                        children: [
                          const Icon(LucideIcons.star, size: 15, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text('${biz.rating.toStringAsFixed(1)} (${biz.reviewsCount})',
                              style: const TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(width: 16),
                          const Icon(LucideIcons.mapPin, size: 14, color: Color(0xFF0F4C3A)),
                          const SizedBox(width: 4),
                          Expanded(child: Text('${biz.city} · ${biz.area} · ${biz.address}', style: const TextStyle(fontSize: 12))),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Description
                      Text(biz.description[lang] ?? biz.description['en'] ?? '', style: const TextStyle(fontSize: 13, height: 1.5)),
                      const SizedBox(height: 12),

                      // Working hours
                      _InfoRow(icon: LucideIcons.clock, text: biz.workingHours[lang] ?? biz.workingHours['en'] ?? ''),
                      if (biz.website != null && biz.website!.isNotEmpty)
                        _InfoRow(icon: LucideIcons.globe, text: biz.website!),
                      const SizedBox(height: 16),

                      // Contact buttons
                      Text(t(lang, 'contactBusiness'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _ContactButton(icon: LucideIcons.phone, label: t(lang, 'callNow'), color: Colors.blue),
                          _ContactButton(icon: LucideIcons.messageCircle, label: t(lang, 'openWhatsapp'), color: Colors.green),
                          if (biz.website != null && biz.website!.isNotEmpty)
                            _ContactButton(icon: LucideIcons.globe, label: t(lang, 'openWebsite'), color: Colors.purple),
                          _ContactButton(icon: LucideIcons.mapPin, label: t(lang, 'openMap'), color: Colors.orange),
                        ],
                      ),

                      const SizedBox(height: 20),
                      const Divider(),

                      // Reviews section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(t(lang, 'reviews'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          TextButton.icon(
                            onPressed: () => setState(() => _showReviewForm = !_showReviewForm),
                            icon: Icon(_showReviewForm ? LucideIcons.x : LucideIcons.penLine, size: 16),
                            label: Text(t(lang, 'writeReview')),
                            style: TextButton.styleFrom(foregroundColor: const Color(0xFF0F4C3A)),
                          ),
                        ],
                      ),

                      // Review form
                      if (_showReviewForm) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text(t(lang, 'ratingLabel'), style: const TextStyle(fontSize: 13)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Slider(
                                value: _reviewRating,
                                min: 1,
                                max: 5,
                                divisions: 8,
                                activeColor: const Color(0xFF0F4C3A),
                                label: _reviewRating.toStringAsFixed(1),
                                onChanged: (v) => setState(() => _reviewRating = v),
                              ),
                            ),
                            Text(_reviewRating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                        TextField(
                          controller: _commentCtrl,
                          maxLines: 3,
                          decoration: InputDecoration(
                            hintText: t(lang, 'commentPlaceholder'),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              if (_commentCtrl.text.isEmpty) return;
                              final user = provider.currentUser;
                              provider.addReview(Review(
                                id: 'rev-${DateTime.now().millisecondsSinceEpoch}',
                                businessId: biz.id,
                                userName: user?.name ?? 'Anonymous',
                                rating: _reviewRating,
                                comment: _commentCtrl.text,
                                date: DateTime.now().toIso8601String().split('T')[0],
                              ));
                              _commentCtrl.clear();
                              setState(() { _showReviewForm = false; _reviewRating = 5.0; });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F4C3A),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: Text(t(lang, 'submitReview')),
                          ),
                        ),
                        const SizedBox(height: 10),
                      ],

                      // Review list
                      ...reviews.map((r) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.5),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 14,
                                        backgroundColor: const Color(0xFF0F4C3A).withOpacity(0.15),
                                        child: Text(r.userName[0].toUpperCase(),
                                            style: const TextStyle(color: Color(0xFF0F4C3A), fontSize: 12)),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(r.userName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                      ),
                                      Row(
                                        children: List.generate(
                                          5,
                                          (i) => Icon(LucideIcons.star, size: 12,
                                              color: i < r.rating.round() ? Colors.amber : Colors.grey[300]),
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(r.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(r.comment, style: const TextStyle(fontSize: 13, height: 1.4)),
                                  const SizedBox(height: 4),
                                  Text(r.date, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                                ],
                              ),
                            ),
                          )),

                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 14, color: const Color(0xFF0F4C3A)),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }
}

class _ContactButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _ContactButton({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

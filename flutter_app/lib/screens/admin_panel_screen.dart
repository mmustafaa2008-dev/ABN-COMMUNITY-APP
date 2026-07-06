import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;

    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'adminPanel')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: [
            Tab(text: t(lang, 'allBusinesses')),
            Tab(text: t(lang, 'users')),
            Tab(text: t(lang, 'payments')),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BusinessesTab(provider: provider, lang: lang),
          _UsersTab(provider: provider, lang: lang),
          _PaymentsTab(provider: provider, lang: lang),
        ],
      ),
    );
  }
}

class _BusinessesTab extends StatelessWidget {
  final DirectoryProvider provider;
  final String lang;
  const _BusinessesTab({required this.provider, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final businesses = provider.businesses;

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: businesses.length,
      itemBuilder: (context, index) {
        final biz = businesses[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 3))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(biz.logoUrl, width: 40, height: 40, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(width: 40, height: 40, color: const Color(0xFF0F4C3A).withOpacity(0.2))),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(biz.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text(biz.city, style: TextStyle(fontSize: 12, color: colorScheme.onSurface.withOpacity(0.55))),
                      ],
                    ),
                  ),
                  _StatusBadge(status: biz.status),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Text(t(lang, 'expiresOn'), style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  Text(biz.membershipExpiryDate, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  if (biz.isVerified) ...[
                    const SizedBox(width: 8),
                    const Icon(LucideIcons.badge_check, size: 14, color: Color(0xFF0F4C3A)),
                  ],
                ],
              ),
              const SizedBox(height: 10),
              // Action buttons
              Wrap(
                spacing: 8,
                children: [
                  if (biz.status == BusinessStatus.pending)
                    _ActionButton(
                      label: t(lang, 'approve'),
                      color: Colors.green,
                      onTap: () {
                        provider.updateBusiness(
                          biz.copyWith(status: BusinessStatus.active, isVerified: true),
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(t(lang, 'approvedSuccessfully'))),
                        );
                      },
                    ),
                  if (biz.status == BusinessStatus.active)
                    _ActionButton(
                      label: t(lang, 'suspendFlag'),
                      color: Colors.orange,
                      onTap: () {
                        provider.updateBusiness(biz.copyWith(status: BusinessStatus.suspended));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(t(lang, 'statusUpdated'))),
                        );
                      },
                    ),
                  if (biz.status == BusinessStatus.suspended)
                    _ActionButton(
                      label: t(lang, 'activateFlag'),
                      color: Colors.blue,
                      onTap: () {
                        provider.updateBusiness(biz.copyWith(status: BusinessStatus.active));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(t(lang, 'statusUpdated'))),
                        );
                      },
                    ),
                  _ActionButton(
                    label: t(lang, 'reject'),
                    color: Colors.red,
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (_) => AlertDialog(
                          title: const Text('Confirm Delete'),
                          content: Text('Remove "${biz.name}" from the directory?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context);
                                provider.removeBusiness(biz.id);
                              },
                              child: const Text('Delete', style: TextStyle(color: Colors.red)),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _UsersTab extends StatelessWidget {
  final DirectoryProvider provider;
  final String lang;
  const _UsersTab({required this.provider, required this.lang});

  @override
  Widget build(BuildContext context) {
    // Collect unique owner IDs from businesses
    final ownerIds = provider.businesses.map((b) => b.ownerId).toSet();
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        if (provider.currentUser != null) ...[
          _UserTile(
            name: provider.currentUser!.name,
            email: provider.currentUser!.email,
            role: provider.currentUser!.role,
            isCurrentUser: true,
          ),
          const Divider(),
        ],
        ...ownerIds.map((id) {
          final biz = provider.businesses.firstWhere((b) => b.ownerId == id, orElse: () => provider.businesses.first);
          return _UserTile(
            name: biz.name + ' (Owner)',
            email: id,
            role: UserRole.business,
            isCurrentUser: false,
          );
        }),
      ],
    );
  }
}

class _UserTile extends StatelessWidget {
  final String name;
  final String email;
  final UserRole role;
  final bool isCurrentUser;
  const _UserTile({required this.name, required this.email, required this.role, required this.isCurrentUser});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: const Color(0xFF0F4C3A).withOpacity(0.15),
        child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'U',
            style: const TextStyle(color: Color(0xFF0F4C3A), fontWeight: FontWeight.bold)),
      ),
      title: Row(
        children: [
          Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          if (isCurrentUser) ...[
            const SizedBox(width: 6),
            const Icon(LucideIcons.badge_check, size: 14, color: Color(0xFF0F4C3A)),
          ],
        ],
      ),
      subtitle: Text(email, style: const TextStyle(fontSize: 12)),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFF0F4C3A).withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(role.name, style: const TextStyle(fontSize: 11, color: Color(0xFF0F4C3A), fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class _PaymentsTab extends StatelessWidget {
  final DirectoryProvider provider;
  final String lang;
  const _PaymentsTab({required this.provider, required this.lang});

  @override
  Widget build(BuildContext context) {
    final total = provider.payments.fold(0.0, (sum, p) => sum + (p.status == PaymentStatus.success ? p.amount : 0));
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF0F4C3A), Color(0xFF1a7a5e)]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(t(lang, 'totalRevenue'), style: const TextStyle(color: Colors.white, fontSize: 14)),
              Text('\$${total.toStringAsFixed(2)}',
                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: provider.payments.length,
            itemBuilder: (context, index) {
              final p = provider.payments[index];
              final biz = provider.businesses.where((b) => b.id == p.businessId).firstOrNull;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.withOpacity(0.15)),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.receipt, size: 18, color: Color(0xFF0F4C3A)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(biz?.name ?? p.businessId, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          Text(p.refNo, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('\$${p.amount.toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F4C3A))),
                        Text(p.date, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final BusinessStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (status) {
      case BusinessStatus.active:
        color = Colors.green;
        label = 'Active';
        break;
      case BusinessStatus.suspended:
        color = Colors.orange;
        label = 'Suspended';
        break;
      case BusinessStatus.pending:
        color = Colors.blue;
        label = 'Pending';
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionButton({required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.4)),
        ),
        child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

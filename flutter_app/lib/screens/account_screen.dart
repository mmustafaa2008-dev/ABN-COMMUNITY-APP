import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';
import 'edit_business_profile_screen.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final user = provider.currentUser;

    if (user == null) {
      return _GuestAccountView(lang: lang);
    }

    final myNotifications = provider.notifications
        .where((n) => n.receiverRole == 'all' || n.receiverRole == user.role.name)
        .toList();
    final unreadCount = myNotifications.where((n) => !n.isRead).length;
    final myBusiness = user.role == UserRole.business
        ? provider.businesses.where((b) => b.ownerId == user.id).firstOrNull
        : null;
    final categoryName = myBusiness != null
        ? provider.categories
            .where((c) => c.id == myBusiness.categoryId)
            .map((c) => c.name[lang] ?? c.name['en'] ?? '')
            .firstOrNull
        : null;

    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'account')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(LucideIcons.bell),
                onPressed: () => _showNotificationsSheet(context, provider, myNotifications, lang),
              ),
              if (unreadCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Center(
                      child: Text('$unreadCount', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: const Color(0xFF0F4C3A).withOpacity(0.15),
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(color: Color(0xFF0F4C3A), fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.email, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(
                        'Signed in (${user.role.name})',
                        style: TextStyle(fontSize: 12, color: Colors.green[600], fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () => provider.signOut(),
                  child: Text(t(lang, 'signOut'), style: const TextStyle(color: Color(0xFF0F4C3A), fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (myBusiness != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.briefcase, size: 18, color: Color(0xFF0F4C3A)),
                      const SizedBox(width: 8),
                      Text(t(lang, 'businessProfileMetadata'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _MetadataRow(label: t(lang, 'businessName'), value: myBusiness.name),
                  _MetadataRow(
                    label: t(lang, 'subscriptionStatus'),
                    value: myBusiness.status == BusinessStatus.active
                        ? '${t(lang, 'businessPlan')} (${t(lang, 'expiresOn')} ${myBusiness.membershipExpiryDate})'
                        : t(lang, 'suspended'),
                  ),
                  _MetadataRow(label: t(lang, 'referenceId'), value: myBusiness.id),
                  _MetadataRow(
                    label: t(lang, 'selectCategory'),
                    value: categoryName ?? myBusiness.subcategory[lang] ?? myBusiness.subcategory['en'] ?? '',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            ListTile(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EditBusinessProfileScreen(business: myBusiness),
                  ),
                );
              },
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(color: Colors.grey.withOpacity(0.2)),
              ),
              tileColor: Theme.of(context).colorScheme.surface,
              leading: const Text('📝', style: TextStyle(fontSize: 20)),
              title: Text(t(lang, 'editBusinessProfile'), style: const TextStyle(fontWeight: FontWeight.w600)),
              trailing: const Icon(LucideIcons.chevron_right, size: 18),
            ),
            const SizedBox(height: 8),
          ],

          _SettingsCard(
            title: t(lang, 'languageSelection'),
            child: Column(
              children: [
                RadioListTile<String>(
                  title: const Text('English'),
                  value: 'en',
                  groupValue: lang,
                  activeColor: const Color(0xFF0F4C3A),
                  onChanged: (v) => provider.setLanguage(v!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  title: const Text('العربية'),
                  value: 'ar',
                  groupValue: lang,
                  activeColor: const Color(0xFF0F4C3A),
                  onChanged: (v) => provider.setLanguage(v!),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          _SettingsCard(
            title: 'Theme',
            child: Column(
              children: [
                RadioListTile<ThemeMode>(
                  title: const Text('System'),
                  value: ThemeMode.system,
                  groupValue: provider.themeMode,
                  activeColor: const Color(0xFF0F4C3A),
                  onChanged: (v) => provider.setThemeMode(v!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<ThemeMode>(
                  title: const Text('Light'),
                  value: ThemeMode.light,
                  groupValue: provider.themeMode,
                  activeColor: const Color(0xFF0F4C3A),
                  onChanged: (v) => provider.setThemeMode(v!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<ThemeMode>(
                  title: const Text('Dark'),
                  value: ThemeMode.dark,
                  groupValue: provider.themeMode,
                  activeColor: const Color(0xFF0F4C3A),
                  onChanged: (v) => provider.setThemeMode(v!),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          _SettingsCard(
            title: t(lang, 'notifications'),
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(LucideIcons.bell, color: Color(0xFF0F4C3A)),
              title: Text(t(lang, 'notifications')),
              trailing: unreadCount > 0
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(12)),
                      child: Text('$unreadCount NEW', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    )
                  : const Icon(LucideIcons.chevron_right),
              onTap: () => _showNotificationsSheet(context, provider, myNotifications, lang),
            ),
          ),
          const SizedBox(height: 12),

          _SettingsCard(
            title: t(lang, 'privacy'),
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(LucideIcons.lock, color: Color(0xFF0F4C3A)),
              title: Text(t(lang, 'privacy')),
              trailing: const Icon(LucideIcons.chevron_right),
              onTap: () => _showPrivacySheet(context, lang),
            ),
          ),
        ],
      ),
    );
  }

  void _showPrivacySheet(BuildContext context, String lang) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(t(lang, 'privacy'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Text(
              'The Shia Community Business Directory operates as an index to discover verified local businesses. '
              'All communication happens outside the platform via direct calling or WhatsApp.',
              style: TextStyle(fontSize: 13, color: Colors.grey[600], height: 1.5),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showNotificationsSheet(BuildContext context, DirectoryProvider provider, List<AppNotification> notifications, String lang) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.3,
        expand: false,
        builder: (_, scrollCtrl) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(t(lang, 'notifications'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Row(
                    children: [
                      TextButton(onPressed: () => provider.markAllNotificationsAsRead(), child: Text(t(lang, 'markAllRead'), style: const TextStyle(fontSize: 12))),
                      TextButton(onPressed: () { provider.clearNotifications(); Navigator.pop(context); }, child: Text(t(lang, 'clearAll'), style: const TextStyle(fontSize: 12, color: Colors.red))),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: notifications.isEmpty
                  ? Center(child: Text(t(lang, 'noNotifications'), style: TextStyle(color: Colors.grey[500])))
                  : ListView.builder(
                      controller: scrollCtrl,
                      itemCount: notifications.length,
                      itemBuilder: (_, i) {
                        final n = notifications[i];
                        return ListTile(
                          leading: Icon(n.isRead ? LucideIcons.bell : LucideIcons.bell_ring,
                              color: n.isRead ? Colors.grey : const Color(0xFF0F4C3A)),
                          title: Text(n.title, style: TextStyle(fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold)),
                          subtitle: Text(n.message, maxLines: 2, overflow: TextOverflow.ellipsis),
                          trailing: Text(n.date, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetadataRow extends StatelessWidget {
  final String label;
  final String value;
  const _MetadataRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          ),
          Expanded(
            flex: 3,
            child: Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class _GuestAccountView extends StatelessWidget {
  final String lang;
  const _GuestAccountView({required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'account')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.account_circle, size: 72, color: Color(0xFF0F4C3A)),
              const SizedBox(height: 16),
              Text(t(lang, 'guestUser'), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(t(lang, 'signInPrompt'), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SettingsCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

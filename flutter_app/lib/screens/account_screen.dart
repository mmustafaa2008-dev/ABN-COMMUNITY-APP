import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final user = provider.currentUser;
    final colorScheme = Theme.of(context).colorScheme;

    if (user == null) {
      return _GuestAccountView(lang: lang);
    }

    final myNotifications = provider.notifications
        .where((n) => n.receiverRole == 'all' || n.receiverRole == user.role.name)
        .toList();
    final unreadCount = myNotifications.where((n) => !n.isRead).length;

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
          // Profile card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F4C3A), Color(0xFF1a7a5e)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white24,
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                      const SizedBox(height: 2),
                      Text(user.email, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          user.role.name.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Language selection
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

          // Theme selection
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
          const SizedBox(height: 20),

          // Sign out
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => provider.signOut(),
              icon: const Icon(LucideIcons.logOut, color: Colors.red),
              label: Text(t(lang, 'signOut'), style: const TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
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
                          leading: Icon(n.isRead ? LucideIcons.bell : LucideIcons.bellRing,
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
              const Icon(LucideIcons.userCircle, size: 72, color: Color(0xFF0F4C3A)),
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

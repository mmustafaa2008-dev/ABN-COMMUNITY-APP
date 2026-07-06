import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/directory_provider.dart';
import 'screens/home_screen.dart';
import 'screens/search_screen.dart';
import 'screens/saved_screen.dart';
import 'screens/business_portal_screen.dart';
import 'screens/account_screen.dart';
import 'screens/admin_panel_screen.dart';
import 'models/models.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'data/translations.dart';
import 'widgets/auth_modal.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => DirectoryProvider()),
      ],
      child: const KawtharDirectoryApp(),
    ),
  );
}

class KawtharDirectoryApp extends StatelessWidget {
  const KawtharDirectoryApp({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();

    return MaterialApp(
      title: 'Kawthar Directory',
      debugShowCheckedModeBanner: false,
      themeMode: provider.themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: const Color(0xFF0F4C3A),
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F4C3A),
          brightness: Brightness.light,
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF0F4C3A),
        scaffoldBackgroundColor: const Color(0xFF111827),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F4C3A),
          brightness: Brightness.dark,
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  void _openAuth() {
    showAuthModal(context);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final user = provider.currentUser;
    final isAdmin = user?.role == UserRole.admin;
    final isBusiness = user?.role == UserRole.business;
    final hasBusinessListing = isBusiness &&
        user != null &&
        provider.businesses.any((b) => b.ownerId == user.id);

    final screens = hasBusinessListing
        ? <Widget>[
            BusinessPortalScreen(onOpenAuth: _openAuth),
            const AccountScreen(),
          ]
        : <Widget>[
            const HomeScreen(),
            const SearchScreen(),
            const SavedScreen(),
            BusinessPortalScreen(onOpenAuth: _openAuth),
            if (isAdmin) const AdminPanelScreen(),
          ];

    final safeIndex = _currentIndex.clamp(0, screens.length - 1);
    if (safeIndex != _currentIndex) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _currentIndex = safeIndex);
      });
    }

    final destinations = hasBusinessListing
        ? [
            NavigationDestination(
              icon: const Icon(Icons.home),
              label: t(lang, 'home'),
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.user),
              label: t(lang, 'account'),
            ),
          ]
        : [
            NavigationDestination(
              icon: const Icon(Icons.home),
              label: t(lang, 'home'),
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.search),
              label: t(lang, 'search'),
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.heart),
              label: t(lang, 'saved'),
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.briefcase),
              label: t(lang, 'portal'),
            ),
            if (isAdmin)
              const NavigationDestination(
                icon: Icon(Icons.tune),
                label: 'Admin',
              ),
          ];

    return Scaffold(
      body: IndexedStack(
        index: safeIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: safeIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: destinations,
      ),
    );
  }
}

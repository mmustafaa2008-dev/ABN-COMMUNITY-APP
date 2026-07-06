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
  late List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const HomeScreen(),
      const SearchScreen(),
      const SavedScreen(),
      BusinessPortalScreen(onOpenAuth: _openAuth),
    ];
  }

  void _openAuth() {
    showAuthModal(context);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final isAdmin = provider.currentUser?.role == UserRole.admin;

    final screens = List<Widget>.from(_screens);
    if (isAdmin) {
      screens.add(const AdminPanelScreen());
    }

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(LucideIcons.home),
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
              icon: Icon(LucideIcons.sliders),
              label: 'Admin',
            ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../models/models.dart';
import '../data/mock_data.dart';

class DirectoryProvider extends ChangeNotifier {
  // ── Auth ──────────────────────────────────────────────────────
  UserProfile? _currentUser;
  UserProfile? get currentUser => _currentUser;

  // ── Language / Theme ──────────────────────────────────────────
  String _language = 'en';
  String get language => _language;

  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;

  // ── Data ──────────────────────────────────────────────────────
  List<Category> _categories = List.from(initialCategories);
  List<Category> get categories => _categories;

  List<Business> _businesses = List.from(initialBusinesses);
  List<Business> get businesses => _businesses;

  List<Review> _reviews = List.from(initialReviews);
  List<Review> get reviews => _reviews;

  List<String> _favorites = [];
  List<String> get favorites => _favorites;

  List<PaymentRecord> _payments = List.from(initialPayments);
  List<PaymentRecord> get payments => _payments;

  List<Product> _products = List.from(initialProducts);
  List<Product> get products => _products;

  List<Order> _orders = List.from(initialOrders);
  List<Order> get orders => _orders;

  List<AppNotification> _notifications = [
    AppNotification(
      id: 'notif-1',
      title: 'App Launched!',
      message: 'Welcome to the Shia Community Business Directory application.',
      date: '2026-06-19',
      isRead: false,
      receiverRole: 'all',
    ),
  ];
  List<AppNotification> get notifications => _notifications;

  DirectoryProvider() {
    _checkSubscriptionExpiry();
  }

  // ── Subscription expiry auto-check ────────────────────────────
  void _checkSubscriptionExpiry() {
    final today = DateTime.now();
    final todayDate = DateTime(today.year, today.month, today.day);
    final sevenDaysLater = todayDate.add(const Duration(days: 7));

    _businesses = _businesses.map((biz) {
      final parts = biz.membershipExpiryDate.split('-');
      if (parts.length != 3) return biz;
      final expiry = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));

      if (expiry.isBefore(todayDate) && biz.status == BusinessStatus.active) {
        _notifications.insert(
          0,
          AppNotification(
            id: 'notif-exp-${biz.id}-${DateTime.now().millisecondsSinceEpoch}',
            title: 'Subscription Expired',
            message: '${biz.name} membership has expired. The listing has been suspended. Please renew to restore visibility.',
            date: todayDate.toIso8601String().split('T')[0],
            isRead: false,
            receiverRole: 'business',
          ),
        );
        return biz.copyWith(status: BusinessStatus.suspended);
      }

      if (!expiry.isBefore(todayDate) && !expiry.isAfter(sevenDaysLater) && biz.status == BusinessStatus.active) {
        final alreadyNotified = _notifications.any(
          (n) => n.title == 'Subscription Expiring Soon' && n.message.contains(biz.name),
        );
        if (!alreadyNotified) {
          _notifications.insert(
            0,
            AppNotification(
              id: 'notif-warn-${biz.id}-${DateTime.now().millisecondsSinceEpoch}',
              title: 'Subscription Expiring Soon',
              message: '${biz.name} membership expires on ${biz.membershipExpiryDate}. Please renew to avoid suspension.',
              date: todayDate.toIso8601String().split('T')[0],
              isRead: false,
              receiverRole: 'business',
            ),
          );
        }
      }

      return biz;
    }).toList();
  }

  // ── Language / Theme setters ──────────────────────────────────
  void setLanguage(String lang) {
    _language = lang;
    notifyListeners();
  }

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }

  // ── Categories ────────────────────────────────────────────────
  void addCategory(Category category) {
    _categories = [..._categories, category];
    notifyListeners();
  }

  void removeCategory(String id) {
    _categories = _categories.where((c) => c.id != id).toList();
    notifyListeners();
  }

  // ── Businesses ────────────────────────────────────────────────
  void addBusiness(Business business) {
    _businesses = [..._businesses, business];
    addNotification('New Business Listed', '${business.name} has registered under ${business.subcategory['en'] ?? ''}.', 'admin');
    notifyListeners();
  }

  void updateBusiness(Business updated) {
    _businesses = _businesses.map((b) => b.id == updated.id ? updated : b).toList();
    notifyListeners();
  }

  void removeBusiness(String id) {
    _businesses = _businesses.where((b) => b.id != id).toList();
    notifyListeners();
  }

  // ── Reviews ───────────────────────────────────────────────────
  void addReview(Review review) {
    _reviews = [review, ..._reviews];
    // Recalculate rating
    final bizReviews = _reviews.where((r) => r.businessId == review.businessId).toList();
    final total = bizReviews.fold(0.0, (sum, r) => sum + r.rating);
    final newAvg = double.parse((total / bizReviews.length).toStringAsFixed(1));
    _businesses = _businesses.map((b) {
      if (b.id == review.businessId) {
        return b.copyWith(rating: newAvg, reviewsCount: bizReviews.length);
      }
      return b;
    }).toList();
    notifyListeners();
  }

  // ── Favorites ─────────────────────────────────────────────────
  void toggleFavorite(String businessId) {
    if (_favorites.contains(businessId)) {
      _favorites = _favorites.where((id) => id != businessId).toList();
    } else {
      _favorites = [..._favorites, businessId];
    }
    notifyListeners();
  }

  // ── Payments ──────────────────────────────────────────────────
  void addPayment(PaymentRecord payment) {
    _payments = [payment, ..._payments];
    // Update business expiry (+30 days)
    final now = DateTime.now();
    final expiry = now.add(const Duration(days: 30));
    final expiryStr = '${expiry.year}-${expiry.month.toString().padLeft(2, '0')}-${expiry.day.toString().padLeft(2, '0')}';
    _businesses = _businesses.map((b) {
      if (b.id == payment.businessId) {
        return b.copyWith(status: BusinessStatus.active, membershipExpiryDate: expiryStr);
      }
      return b;
    }).toList();
    final biz = _businesses.firstWhere(
      (b) => b.id == payment.businessId,
      orElse: () => _businesses.first,
    );
    addNotification(
      'Subscription Renewed ✓',
      'Membership for ${biz.name} has been renewed successfully for \$50/month. Thank you.',
      'business',
    );
    notifyListeners();
  }

  // ── Products ──────────────────────────────────────────────────
  void addProduct(Product product) {
    _products = [product, ..._products];
    notifyListeners();
  }

  // ── Orders ────────────────────────────────────────────────────
  void updateOrderStatus(String id, OrderStatus status) {
    _orders = _orders.map((o) => o.id == id ? o.copyWith(status: status) : o).toList();
    notifyListeners();
  }

  // ── Notifications ─────────────────────────────────────────────
  void addNotification(String title, String message, String receiverRole) {
    final notif = AppNotification(
      id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      message: message,
      date: DateTime.now().toIso8601String().split('T')[0],
      isRead: false,
      receiverRole: receiverRole,
    );
    _notifications = [notif, ..._notifications];
    notifyListeners();
  }

  void markAllNotificationsAsRead() {
    _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
    notifyListeners();
  }

  void clearNotifications() {
    _notifications = [];
    notifyListeners();
  }

  // ── Auth ──────────────────────────────────────────────────────
  void signIn({required String email, required String phone, required UserRole role, String? name}) {
    final fallbackName = name?.isNotEmpty == true ? name! : (email.split('@').first.isNotEmpty ? email.split('@').first : 'User');
    final stableId = '${role.name}-${email.replaceAll(RegExp(r'[^a-z0-9]', caseSensitive: false), '').toLowerCase()}';
    _currentUser = UserProfile(
      id: stableId,
      email: email,
      phone: phone,
      name: fallbackName,
      role: role,
      preferredLanguage: _language,
    );
    addNotification('Login Successful', 'Assalamu Alaykum, $fallbackName. Welcome back!', role.name);
    notifyListeners();
  }

  void signOut() {
    _currentUser = null;
    notifyListeners();
  }
}

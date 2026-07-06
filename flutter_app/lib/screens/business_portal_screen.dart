import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';

class BusinessPortalScreen extends StatefulWidget {
  final VoidCallback onOpenAuth;
  const BusinessPortalScreen({super.key, required this.onOpenAuth});

  @override
  State<BusinessPortalScreen> createState() => _BusinessPortalScreenState();
}

class _BusinessPortalScreenState extends State<BusinessPortalScreen> with SingleTickerProviderStateMixin {
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
    final user = provider.currentUser;

    if (user == null || user.role == UserRole.customer) {
      return _GuestPortalView(onOpenAuth: widget.onOpenAuth, lang: lang);
    }

    final myBusiness = provider.businesses
        .where((b) => b.ownerId == user.id)
        .toList();

    if (myBusiness.isEmpty) {
      return _RegisterBusinessView(lang: lang, user: user, provider: provider);
    }

    final biz = myBusiness.first;
    return _BusinessDashboard(business: biz, provider: provider, lang: lang, tabController: _tabController);
  }
}

class _GuestPortalView extends StatelessWidget {
  final VoidCallback onOpenAuth;
  final String lang;
  const _GuestPortalView({required this.onOpenAuth, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.briefcase, size: 72, color: Color(0xFF0F4C3A)),
              const SizedBox(height: 24),
              Text(t(lang, 'businessPortal'),
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(t(lang, 'portalSub'),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600], fontSize: 14)),
              const SizedBox(height: 8),
              Text(t(lang, 'signInPrompt'),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[500], fontSize: 13)),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onOpenAuth,
                  icon: const Icon(LucideIcons.logIn),
                  label: Text(t(lang, 'signIn')),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F4C3A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RegisterBusinessView extends StatefulWidget {
  final String lang;
  final UserProfile user;
  final DirectoryProvider provider;
  const _RegisterBusinessView({required this.lang, required this.user, required this.provider});

  @override
  State<_RegisterBusinessView> createState() => _RegisterBusinessViewState();
}

class _RegisterBusinessViewState extends State<_RegisterBusinessView> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _whatsappCtrl = TextEditingController();
  final _logoCtrl = TextEditingController();
  final _coverCtrl = TextEditingController();
  final _hoursCtrl = TextEditingController();
  String? _selectedCategoryId;
  String _selectedCity = 'New York';

  static const List<String> _cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Dearborn', 'Dallas'
  ];

  @override
  void dispose() {
    for (final c in [_nameCtrl, _descCtrl, _addressCtrl, _phoneCtrl, _whatsappCtrl, _logoCtrl, _coverCtrl, _hoursCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate() || _selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t(widget.lang, 'allFieldsRequired'))));
      return;
    }
    final newBiz = Business(
      id: 'biz-${DateTime.now().millisecondsSinceEpoch}',
      ownerId: widget.user.id,
      name: _nameCtrl.text,
      logoUrl: _logoCtrl.text.isNotEmpty ? _logoCtrl.text : 'https://via.placeholder.com/200',
      coverUrl: _coverCtrl.text.isNotEmpty ? _coverCtrl.text : 'https://via.placeholder.com/1200x400',
      description: {'en': _descCtrl.text, 'ar': _descCtrl.text},
      categoryId: _selectedCategoryId!,
      subcategory: {'en': _descCtrl.text.length > 30 ? _descCtrl.text.substring(0, 30) : _descCtrl.text, 'ar': ''},
      address: _addressCtrl.text,
      city: _selectedCity,
      area: '',
      isVerified: false,
      status: BusinessStatus.pending,
      phone: _phoneCtrl.text,
      whatsapp: _whatsappCtrl.text,
      workingHours: {'en': _hoursCtrl.text, 'ar': _hoursCtrl.text},
      membershipExpiryDate: DateTime.now().toIso8601String().split('T')[0],
      gallery: [],
      rating: 0.0,
      reviewsCount: 0,
    );
    widget.provider.addBusiness(newBiz);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t(widget.lang, 'registeredSuccessfully'))));
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.lang;
    final categories = widget.provider.categories;

    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'registerBusiness')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _field(_nameCtrl, t(lang, 'businessName'), validator: (v) => (v == null || v.isEmpty) ? t(lang, 'allFieldsRequired') : null),
              _field(_descCtrl, t(lang, 'description'), maxLines: 3),
              _field(_addressCtrl, t(lang, 'address')),
              _field(_phoneCtrl, t(lang, 'phone'), keyboardType: TextInputType.phone),
              _field(_whatsappCtrl, t(lang, 'whatsapp'), keyboardType: TextInputType.phone),
              _field(_logoCtrl, t(lang, 'logoUrl')),
              _field(_coverCtrl, t(lang, 'coverUrl')),
              _field(_hoursCtrl, t(lang, 'workingHours')),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: t(lang, 'selectCategory'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                value: _selectedCategoryId,
                items: categories
                    .map((c) => DropdownMenuItem(value: c.id, child: Text(c.name[lang] ?? c.name['en'] ?? '')))
                    .toList(),
                onChanged: (v) => setState(() => _selectedCategoryId = v),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: t(lang, 'city'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                value: _selectedCity,
                items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setState(() => _selectedCity = v ?? _selectedCity),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _submit,
                  icon: const Icon(LucideIcons.send),
                  label: Text(t(lang, 'submitApplication')),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F4C3A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label,
      {TextInputType? keyboardType, int maxLines = 1, String? Function(String?)? validator}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}

class _BusinessDashboard extends StatelessWidget {
  final Business business;
  final DirectoryProvider provider;
  final String lang;
  final TabController tabController;

  const _BusinessDashboard({
    required this.business,
    required this.provider,
    required this.lang,
    required this.tabController,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final myPayments = provider.payments.where((p) => p.businessId == business.id).toList();

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 160,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF0F4C3A),
            foregroundColor: Colors.white,
            title: Text(t(lang, 'businessPortal')),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(business.coverUrl, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: const Color(0xFF0F4C3A))),
                  Container(color: Colors.black45),
                  Positioned(
                    bottom: 60,
                    left: 16,
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.network(business.logoUrl, width: 48, height: 48, fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(width: 48, height: 48, color: Colors.white24)),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(business.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(
                              business.status == BusinessStatus.active ? t(lang, 'active') : t(lang, 'suspended'),
                              style: TextStyle(color: business.status == BusinessStatus.active ? Colors.greenAccent : Colors.redAccent, fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            bottom: TabBar(
              controller: tabController,
              indicatorColor: Colors.white,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white60,
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Payments'),
                Tab(text: 'Orders'),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: tabController,
          children: [
            // Overview tab
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _InfoCard(title: t(lang, 'membershipStatus'), children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(t(lang, 'memberExpiry'), style: const TextStyle(fontSize: 13)),
                      Text(business.membershipExpiryDate,
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F4C3A))),
                    ],
                  ),
                ]),
                const SizedBox(height: 12),
                _InfoCard(title: t(lang, 'paymentGateway'), children: [
                  Text(t(lang, 'renewDescription'), style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _showPaymentDialog(context),
                      icon: const Icon(LucideIcons.creditCard, size: 16),
                      label: Text(t(lang, 'renewMembership')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F4C3A),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ]),
                const SizedBox(height: 12),
                _InfoCard(title: t(lang, 'reviews'), children: [
                  ...provider.reviews.where((r) => r.businessId == business.id).take(3).map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(r.userName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            const Spacer(),
                            const Icon(LucideIcons.star, size: 12, color: Colors.amber),
                            const SizedBox(width: 3),
                            Text(r.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                        Text(r.comment, style: const TextStyle(fontSize: 12)),
                        const Divider(height: 12),
                      ],
                    ),
                  )),
                ]),
              ],
            ),

            // Payments tab
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _InfoCard(title: t(lang, 'paymentHistory'), children: myPayments.isEmpty
                    ? [Text(t(lang, 'noNotifications'), style: TextStyle(color: Colors.grey[500]))]
                    : myPayments.map((p) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.receipt, size: 16, color: Color(0xFF0F4C3A)),
                              const SizedBox(width: 8),
                              Expanded(child: Text(p.refNo, style: const TextStyle(fontSize: 13))),
                              Text('\$${p.amount.toStringAsFixed(0)}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F4C3A))),
                              const SizedBox(width: 8),
                              Text(p.date, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                            ],
                          ),
                        )).toList()),
              ],
            ),

            // Orders tab
            ListView(
              padding: const EdgeInsets.all(16),
              children: provider.orders
                  .where((o) => o.businessId == business.id)
                  .map((o) => Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: colorScheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.withOpacity(0.2)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(o.customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                _OrderStatusBadge(status: o.status),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('\$${o.totalAmount.toStringAsFixed(2)}',
                                style: const TextStyle(color: Color(0xFF0F4C3A), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 8),
                            DropdownButton<OrderStatus>(
                              value: o.status,
                              isDense: true,
                              underline: const SizedBox(),
                              items: OrderStatus.values.map((s) => DropdownMenuItem(
                                    value: s,
                                    child: Text(s.name, style: const TextStyle(fontSize: 12)),
                                  )).toList(),
                              onChanged: (s) {
                                if (s != null) provider.updateOrderStatus(o.id, s);
                              },
                            ),
                          ],
                        ),
                      ))
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentDialog(BuildContext context) {
    final cardCtrl = TextEditingController();
    final expiryCtrl = TextEditingController();
    final cvcCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(t(lang, 'paymentGateway')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: cardCtrl, decoration: InputDecoration(labelText: t(lang, 'cardNumber')), keyboardType: TextInputType.number),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: TextField(controller: expiryCtrl, decoration: InputDecoration(labelText: t(lang, 'cardExpiry')))),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: cvcCtrl, decoration: InputDecoration(labelText: t(lang, 'cardCVC')))),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              provider.addPayment(PaymentRecord(
                id: 'pay-${DateTime.now().millisecondsSinceEpoch}',
                businessId: business.id,
                amount: 50.0,
                date: DateTime.now().toIso8601String().split('T')[0],
                status: PaymentStatus.success,
                refNo: 'TXN-${DateTime.now().millisecondsSinceEpoch}',
              ));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Payment successful! Membership renewed.')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F4C3A),
              foregroundColor: Colors.white,
            ),
            child: Text(t(lang, 'processPayment')),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _InfoCard({required this.title, required this.children});

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
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _OrderStatusBadge extends StatelessWidget {
  final OrderStatus status;
  const _OrderStatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case OrderStatus.pending:
        color = Colors.orange;
        break;
      case OrderStatus.processing:
        color = Colors.blue;
        break;
      case OrderStatus.shipped:
        color = Colors.purple;
        break;
      case OrderStatus.delivered:
        color = Colors.green;
        break;
      case OrderStatus.cancelled:
        color = Colors.red;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(status.name, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

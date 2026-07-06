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

class _BusinessPortalScreenState extends State<BusinessPortalScreen> {
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
    return _BusinessInventoryView(business: biz, provider: provider, lang: lang);
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
                  icon: const Icon(LucideIcons.log_in),
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

class _BusinessInventoryView extends StatelessWidget {
  final Business business;
  final DirectoryProvider provider;
  final String lang;

  const _BusinessInventoryView({
    required this.business,
    required this.provider,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final myProducts = provider.products.where((p) => p.businessId == business.id).toList();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          t(lang, 'inventory'),
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          t(lang, 'inventorySub'),
                          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                  FloatingActionButton.small(
                    onPressed: () {},
                    backgroundColor: const Color(0xFF0F4C3A),
                    child: const Icon(LucideIcons.plus, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
          if (myProducts.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F4C3A).withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.package, size: 32, color: Color(0xFF0F4C3A)),
                      ),
                      const SizedBox(height: 16),
                      Text(t(lang, 'noProductsYet'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 8),
                      Text(
                        t(lang, 'addFirstProduct'),
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.72,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final prod = myProducts[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.withOpacity(0.2)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.network(
                                  prod.imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) =>
                                      Container(color: const Color(0xFF0F4C3A).withOpacity(0.1)),
                                ),
                                if (!prod.inStock)
                                  Container(
                                    color: Colors.black54,
                                    alignment: Alignment.center,
                                    child: const Text(
                                      'OUT OF STOCK',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  prod.name[lang] ?? prod.name['en'] ?? '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '\$${prod.price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: Color(0xFF0F4C3A),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                  childCount: myProducts.length,
                ),
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

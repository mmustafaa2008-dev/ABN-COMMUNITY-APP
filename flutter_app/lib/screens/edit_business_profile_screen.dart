import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';

class EditBusinessProfileScreen extends StatefulWidget {
  final Business business;
  const EditBusinessProfileScreen({super.key, required this.business});

  @override
  State<EditBusinessProfileScreen> createState() => _EditBusinessProfileScreenState();
}

class _EditBusinessProfileScreenState extends State<EditBusinessProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _subcatEnCtrl;
  late final TextEditingController _subcatArCtrl;
  late final TextEditingController _descEnCtrl;
  late final TextEditingController _descArCtrl;
  late final TextEditingController _addressCtrl;
  late final TextEditingController _areaCtrl;
  late String _selectedCategoryId;
  late String _selectedCity;

  static const List<String> _cities = [
    'Baghdad', 'Najaf', 'Karbala', 'Basra', 'Erbil', 'Diwaniyah', 'Samarra',
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Dearborn', 'Dallas',
  ];

  @override
  void initState() {
    super.initState();
    final biz = widget.business;
    _nameCtrl = TextEditingController(text: biz.name);
    _subcatEnCtrl = TextEditingController(text: biz.subcategory['en'] ?? '');
    _subcatArCtrl = TextEditingController(text: biz.subcategory['ar'] ?? '');
    _descEnCtrl = TextEditingController(text: biz.description['en'] ?? '');
    _descArCtrl = TextEditingController(text: biz.description['ar'] ?? '');
    _addressCtrl = TextEditingController(text: biz.address);
    _areaCtrl = TextEditingController(text: biz.area);
    _selectedCategoryId = biz.categoryId;
    _selectedCity = biz.city;
  }

  @override
  void dispose() {
    for (final c in [_nameCtrl, _subcatEnCtrl, _subcatArCtrl, _descEnCtrl, _descArCtrl, _addressCtrl, _areaCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit(DirectoryProvider provider, String lang) {
    if (!_formKey.currentState!.validate()) return;

    provider.updateBusiness(widget.business.copyWith(
      name: _nameCtrl.text,
      categoryId: _selectedCategoryId,
      subcategory: {'en': _subcatEnCtrl.text, 'ar': _subcatArCtrl.text},
      description: {'en': _descEnCtrl.text, 'ar': _descArCtrl.text},
      address: _addressCtrl.text,
      area: _areaCtrl.text,
      city: _selectedCity,
    ));

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(t(lang, 'profileUpdated'))),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DirectoryProvider>();
    final lang = provider.language;
    final categories = provider.categories;

    return Scaffold(
      appBar: AppBar(
        title: Text(t(lang, 'editBusinessProfile')),
        backgroundColor: const Color(0xFF0F4C3A),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _field(_nameCtrl, t(lang, 'businessName'),
                  validator: (v) => (v == null || v.isEmpty) ? t(lang, 'allFieldsRequired') : null),
              _field(_subcatEnCtrl, '${t(lang, 'subcategories')} (English)',
                  validator: (v) => (v == null || v.isEmpty) ? t(lang, 'allFieldsRequired') : null),
              _field(_subcatArCtrl, '${t(lang, 'subcategories')} (العربية)'),
              _field(_descEnCtrl, '${t(lang, 'description')} (English)', maxLines: 3),
              _field(_descArCtrl, '${t(lang, 'description')} (العربية)', maxLines: 3),
              _field(_addressCtrl, t(lang, 'address')),
              _field(_areaCtrl, t(lang, 'area')),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: t(lang, 'selectCategory'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                value: _selectedCategoryId,
                items: categories
                    .map((c) => DropdownMenuItem(
                          value: c.id,
                          child: Text(c.name[lang] ?? c.name['en'] ?? ''),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _selectedCategoryId = v ?? _selectedCategoryId),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: t(lang, 'city'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                value: _cities.contains(_selectedCity) ? _selectedCity : _cities.first,
                items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setState(() => _selectedCity = v ?? _selectedCity),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _submit(provider, lang),
                  icon: const Icon(LucideIcons.save),
                  label: Text(t(lang, 'saveChanges')),
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

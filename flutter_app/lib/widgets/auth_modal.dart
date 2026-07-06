import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../providers/directory_provider.dart';
import '../models/models.dart';
import '../data/translations.dart';

/// Shows the auth (sign in / register) modal bottom sheet.
void showAuthModal(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (_) => const _AuthModal(),
  );
}

class _AuthModal extends StatefulWidget {
  const _AuthModal();

  @override
  State<_AuthModal> createState() => _AuthModalState();
}

class _AuthModalState extends State<_AuthModal> {
  bool _isSignIn = true;
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  UserRole _selectedRole = UserRole.customer;

  @override
  void dispose() {
    for (final c in [_emailCtrl, _phoneCtrl, _nameCtrl, _passCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit(DirectoryProvider provider, String lang) {
    if (_emailCtrl.text.isEmpty || _passCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(t(lang, 'allFieldsRequired'))),
      );
      return;
    }
    provider.signIn(
      email: _emailCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      role: _selectedRole,
      name: _isSignIn ? null : _nameCtrl.text.trim(),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.read<DirectoryProvider>();
    final lang = provider.language;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4)),
            ),
          ),
          const SizedBox(height: 20),

          // Title
          Text(
            _isSignIn ? t(lang, 'signIn') : t(lang, 'register'),
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),

          // Name field (register only)
          if (!_isSignIn) ...[
            _FormField(ctrl: _nameCtrl, label: t(lang, 'name'), icon: LucideIcons.user),
            const SizedBox(height: 12),
          ],

          // Email
          _FormField(ctrl: _emailCtrl, label: t(lang, 'email'), icon: LucideIcons.mail, keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 12),

          // Phone
          _FormField(ctrl: _phoneCtrl, label: t(lang, 'phone'), icon: LucideIcons.phone, keyboardType: TextInputType.phone),
          const SizedBox(height: 12),

          // Password
          _FormField(ctrl: _passCtrl, label: t(lang, 'password'), icon: LucideIcons.lock, obscure: true),
          const SizedBox(height: 12),

          // Role selector (register only)
          if (!_isSignIn) ...[
            Text(t(lang, 'role'), style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: [
                _RoleChip(
                  label: 'Customer',
                  selected: _selectedRole == UserRole.customer,
                  onTap: () => setState(() => _selectedRole = UserRole.customer),
                ),
                const SizedBox(width: 8),
                _RoleChip(
                  label: 'Business',
                  selected: _selectedRole == UserRole.business,
                  onTap: () => setState(() => _selectedRole = UserRole.business),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],

          // Submit button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _submit(provider, lang),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F4C3A),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(_isSignIn ? t(lang, 'signIn') : t(lang, 'createAccount')),
            ),
          ),
          const SizedBox(height: 10),

          // Toggle sign in / register
          Center(
            child: TextButton(
              onPressed: () => setState(() => _isSignIn = !_isSignIn),
              child: Text(
                _isSignIn ? t(lang, 'noAccountYet') : t(lang, 'alreadyHaveAccount'),
                style: const TextStyle(color: Color(0xFF0F4C3A)),
              ),
            ),
          ),

          // Continue as guest
          Center(
            child: TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(t(lang, 'continueAsGuest'), style: TextStyle(color: Colors.grey[600])),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool obscure;

  const _FormField({
    required this.ctrl,
    required this.label,
    required this.icon,
    this.keyboardType,
    this.obscure = false,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboardType,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 18),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RoleChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF0F4C3A) : Colors.grey.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? const Color(0xFF0F4C3A) : Colors.grey.withOpacity(0.3),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.grey[700],
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

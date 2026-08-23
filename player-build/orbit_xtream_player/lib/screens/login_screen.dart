import 'package:flutter/material.dart';

import '../models/orbit_credentials.dart';
import '../services/credential_store.dart';
import '../services/xtream_api.dart';
import 'shell_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _username = TextEditingController();
  final _password = TextEditingController();
  final _api = XtreamApi();
  final _store = CredentialStore();
  bool _remember = true;
  bool _busy = false;
  bool _hidePassword = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _restore();
  }

  Future<void> _restore() async {
    final saved = await _store.read();
    if (saved == null || !mounted) return;
    _username.text = saved.username;
    _password.text = saved.password;
  }

  Future<void> _login() async {
    final username = _username.text.trim();
    final password = _password.text;
    if (username.isEmpty || password.isEmpty) {
      setState(() => _error = 'Unesi username i password.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final credentials =
          OrbitCredentials(username: username, password: password);
      final session = await _api.login(credentials);
      if (_remember) await _store.save(credentials);
      if (!mounted) return;
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => ShellScreen(session: session)),
      );
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    _api.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: _OrbitBackground()),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 460),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(30),
                      child: AutofillGroup(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Image.asset('assets/orbit-logo.png', height: 118),
                            const SizedBox(height: 20),
                            Text(
                              'Dobrodošli',
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Prijavi se na ORBIT IPTV',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge
                                  ?.copyWith(
                                    color: Colors.white70,
                                  ),
                            ),
                            const SizedBox(height: 28),
                            TextField(
                              controller: _username,
                              enabled: !_busy,
                              autofillHints: const [AutofillHints.username],
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'Username',
                                prefixIcon: Icon(Icons.person_outline_rounded),
                              ),
                            ),
                            const SizedBox(height: 14),
                            TextField(
                              controller: _password,
                              enabled: !_busy,
                              obscureText: _hidePassword,
                              autofillHints: const [AutofillHints.password],
                              onSubmitted: (_) => _login(),
                              decoration: InputDecoration(
                                labelText: 'Password',
                                prefixIcon:
                                    const Icon(Icons.lock_outline_rounded),
                                suffixIcon: IconButton(
                                  onPressed: () => setState(
                                    () => _hidePassword = !_hidePassword,
                                  ),
                                  icon: Icon(
                                    _hidePassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            SwitchListTile.adaptive(
                              value: _remember,
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Zapamti prijavu'),
                              onChanged: _busy
                                  ? null
                                  : (value) =>
                                      setState(() => _remember = value),
                            ),
                            if (_error != null) ...[
                              const SizedBox(height: 8),
                              Text(
                                _error!,
                                textAlign: TextAlign.center,
                                style:
                                    const TextStyle(color: Color(0xFFFF7188)),
                              ),
                            ],
                            const SizedBox(height: 18),
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: FilledButton.icon(
                                onPressed: _busy ? null : _login,
                                icon: _busy
                                    ? const SizedBox.square(
                                        dimension: 20,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2),
                                      )
                                    : const Icon(Icons.login_rounded),
                                label: Text(_busy ? 'Prijava…' : 'PRIJAVI SE'),
                              ),
                            ),
                            const SizedBox(height: 18),
                            Text(
                              'Server: ORBIT IPTV',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: Colors.white38,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrbitBackground extends StatelessWidget {
  const _OrbitBackground();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(0.65, -0.55),
          radius: 1.15,
          colors: [Color(0xFF123B66), Color(0xFF061426), Color(0xFF020711)],
        ),
      ),
      child: CustomPaint(painter: _StarsPainter()),
    );
  }
}

class _StarsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.16);
    for (var index = 0; index < 52; index++) {
      final x = ((index * 97) % 997) / 997 * size.width;
      final y = ((index * 173) % 991) / 991 * size.height;
      canvas.drawCircle(Offset(x, y), index % 9 == 0 ? 1.8 : 0.8, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

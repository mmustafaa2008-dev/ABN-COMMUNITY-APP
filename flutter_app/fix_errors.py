import os
import re

for r, d, files in os.walk('lib'):
    for f in files:
        if f.endswith('.dart'):
            path = os.path.join(r, f)
            with open(path, 'r', encoding='utf8') as file:
                content = file.read()
            
            # Replace import
            content = content.replace("import 'package:lucide_icons/lucide_icons.dart';", "import 'package:flutter_lucide/flutter_lucide.dart';")
            
            # Replace Map access .en and .ar to ['en'] and ['ar'] for biz.subcategory and biz.workingHours and cat.name
            content = re.sub(r'biz\.subcategory\.en', r"biz.subcategory['en']!", content)
            content = re.sub(r'biz\.subcategory\.ar', r"biz.subcategory['ar']!", content)
            content = re.sub(r'biz\.workingHours\.en', r"biz.workingHours['en']!", content)
            content = re.sub(r'cat\.name\.en', r"cat.name['en']!", content)
            content = re.sub(r'cat\.name\.ar', r"cat.name['ar']!", content)
            
            # Fix string quoting in admin_panel_screen.dart
            if 'admin_panel_screen.dart' in path:
                content = content.replace("'\\${t(lang, 'adminPanel')} Restricted'", "'\\${t(lang, \"adminPanel\")} Restricted'")
                
            with open(path, 'w', encoding='utf8') as file:
                file.write(content)

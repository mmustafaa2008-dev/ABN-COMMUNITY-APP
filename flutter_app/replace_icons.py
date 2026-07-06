import os
import re

for r, d, files in os.walk('lib'):
    for f in files:
        if f.endswith('.dart'):
            path = os.path.join(r, f)
            with open(path, 'r', encoding='utf8') as file:
                content = file.read()
            
            def repl(m):
                icon_name = m.group(1)
                snake = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', icon_name).lower()
                return 'LucideIcons.' + snake
                
            new_content = re.sub(r'LucideIcons\.([a-zA-Z0-9]+)', repl, content)
            
            with open(path, 'w', encoding='utf8') as file:
                file.write(new_content)

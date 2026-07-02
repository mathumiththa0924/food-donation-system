import os
import re

src_dir = r"c:\Users\MOHAMED\Downloads\food-donation-system\frontend\src"

# This regex matches `fontFamily: "..."` or `fontFamily: '...'` with optional preceding/trailing commas
# It handles spaces well.
pattern1 = re.compile(r',\s*fontFamily:\s*["\'][^"\']+["\']')
pattern2 = re.compile(r'fontFamily:\s*["\'][^"\']+["\']\s*,?')

def fix_fonts(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = pattern1.sub('', content)
                new_content = pattern2.sub('', new_content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")
                    count += 1
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    fix_fonts(src_dir)

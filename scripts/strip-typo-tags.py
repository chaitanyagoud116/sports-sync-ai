import os
import re

ROOT = r"c:\Users\om\Desktop\sports-sync-ai"
SKIP = {"node_modules", ".next", ".git"}

pattern = re.compile(r"</?motionLayout>\s*", re.IGNORECASE)

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP]
    for name in filenames:
        if not name.endswith((".ts", ".tsx")):
            continue
        path = os.path.join(dirpath, name)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        cleaned = pattern.sub("", text)
        if cleaned != text:
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(cleaned)
            print("cleaned", path)

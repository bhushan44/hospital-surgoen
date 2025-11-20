from pathlib import Path
import re

ROOT = Path(r"C:\Users\LENOVO\OneDrive\Desktop\projects\hospital-surgoen\hospital-surgeons\app\admin\_components")
PATTERN = re.compile(r'"([^"]+?)@\d+\.\d+\.\d+"')


def normalize_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    new_text = PATTERN.sub(lambda m: f'"{m.group(1)}"', text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")


for file_path in ROOT.rglob("*.ts*"):
    normalize_file(file_path)


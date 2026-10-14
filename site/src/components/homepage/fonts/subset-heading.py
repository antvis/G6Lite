"""Offline font asset generation; not required by the website build."""

from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import sys

source, text_source, output = map(Path, sys.argv[1:])
font = TTFont(source)
options = subset.Options()
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
options.name_languages = [0x409]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text_source.read_text(encoding="utf-8"))
subsetter.subset(font)
names = {
    1: "G6Lite Preview Headings", 2: "Medium",
    3: "G6LitePreviewHeadings-Medium-Subset",
    4: "G6Lite Preview Headings Medium",
    6: "G6LitePreviewHeadings-Medium",
    16: "G6Lite Preview Headings", 17: "Medium",
}
for record in font["name"].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
font["name"].setName((output.parent / "LICENSE.txt").read_text(encoding="utf-8"), 13, 3, 1, 0x409)
font.flavor = "woff2"
font.save(output)
print(f"{output.name}: {output.stat().st_size} bytes; {len(font.getBestCmap())} characters")

# Homepage heading font

`heading-medium.woff2` is a renamed, subsetted derivative of Adobe Source Han Sans SC Medium, version 2.005, under the SIL Open Font License 1.1. Its family name is **G6Lite Preview Headings**, respecting the upstream reserved font name. It is retained as the offline source for the smaller runtime subsets, not imported by the website.

- Upstream: https://github.com/adobe-fonts/source-han-sans
- Input: `OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf` on the `release` branch.
- Input SHA-256: `1df61d31687d04fd2f928a3bb6ca6cd61f0e988cc267cf317f32406edbb49f70`.
- Weight: 500 (Medium).
- Scope: headings across the whole site, including the homepage, docs, examples, and AI pages. Body, navigation, and code keep the site text font (`--font-brand`: Inter, then PingFang SC / Microsoft YaHei). Headings use this Medium face at weight 500.
- Copyright and license: `LICENSE.txt`, also embedded in the font's name metadata.

## Runtime loading

The source font is split into three disjoint Unicode ranges, configured in `src/lib/site-font.ts`:

| Asset | Coverage | Size |
| --- | --- | ---: |
| `heading-latin.woff2` | Latin characters and symbols | 14,976 B |
| `heading-common.woff2` | Chinese homepage and AI page headings, including alternate example titles | 29,732 B |
| `heading-remaining.woff2` | All remaining characters from the original font | 266,120 B |

All three use `display: swap` and `preload: false`. CSS `unicode-range` lets the browser request only the subsets needed by rendered headings: English pages need the Latin file; the Chinese homepage needs Latin and common characters. The remaining subset preserves the original documentation coverage and loads only when its characters are used. The family, weight, and glyph outlines are unchanged.

## Updating headings

`characters.txt` lists the original font coverage. For new homepage headings, add their text to `common-headings.txt` and regenerate the split assets. A character already covered by the source font still works before regeneration, but may load the larger remaining subset. Characters outside the original coverage fall back to the site's text font.

To regenerate the runtime assets with `fonttools[woff]==4.61.1`:

```bash
python3 site/src/components/homepage/fonts/split-heading.py
```

The script writes the three WOFF2 files and prints the matching `site-font.ts` configuration. Apply that configuration to `site/src/lib/site-font.ts`; the literal Unicode ranges are required by `next/font/local`'s static configuration analysis. Verify both Chinese and English headings after regeneration.

To expand the original coverage, use `subset-heading.py` to subset the upstream Medium OTF to the characters in `characters.txt`, preserving its copyright and license metadata and the derivative family **G6Lite Preview Headings**, then rerun `split-heading.py`.

The offline generation tool is not part of the website build and adds no website or npm runtime dependency. Verify rendered headings, font coverage and the upstream license when regenerating.

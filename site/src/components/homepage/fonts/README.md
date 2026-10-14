# Homepage heading font

`heading-medium.woff2` is a renamed, subsetted derivative of Adobe Source Han Sans SC Medium, version 2.005, under the SIL Open Font License 1.1. Its family name is **G6Lite Preview Headings**, respecting the upstream reserved font name.

- Upstream: https://github.com/adobe-fonts/source-han-sans
- Input: `OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf` on the `release` branch.
- Input SHA-256: `1df61d31687d04fd2f928a3bb6ca6cd61f0e988cc267cf317f32406edbb49f70`.
- Weight: 500 (Medium).
- Scope: homepage Hero and all h2 / h3 headings; body, navigation and code retain their original fonts. Headings share the Hero's 500 weight and default title color while keeping their size hierarchy.
- Copyright and license: `LICENSE.txt`, also embedded in the font's name metadata.

## Updating headings

Update `characters.txt` when adding Chinese characters to h1 / h2 / h3 headings. Unknown characters otherwise fall back to the site's system font.

To regenerate this checked-in asset, use an isolated Python environment with `fonttools[woff]==4.61.1` and run from this directory:

```sh
python subset-heading.py <path-to-upstream-medium.otf> characters.txt heading-medium.woff2
```

The offline generation tool is not part of the website build and adds no website or npm runtime dependency. Verify rendered headings, font coverage and the upstream license when regenerating.

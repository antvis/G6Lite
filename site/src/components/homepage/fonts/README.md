# Homepage heading font

`heading-medium.woff2` is a renamed, subsetted derivative of Adobe Source Han Sans SC Medium, version 2.005, under the SIL Open Font License 1.1. Its family name is **G6Lite Preview Headings**, respecting the upstream reserved font name.

- Upstream: https://github.com/adobe-fonts/source-han-sans
- Input: `OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf` on the `release` branch.
- Input SHA-256: `1df61d31687d04fd2f928a3bb6ca6cd61f0e988cc267cf317f32406edbb49f70`.
- Weight: 500 (Medium).
- Scope: headings across the whole site, including the homepage, docs, examples, and AI pages. Body, navigation, and code keep the site text font (`--font-brand`: Inter, then PingFang SC / Microsoft YaHei). Headings use this Medium face at weight 500.
- Copyright and license: `LICENSE.txt`, also embedded in the font's name metadata.

## Updating headings

`characters.txt` lists the characters currently used in site copy. Add new characters there and regenerate the font when headings introduce text outside this set. Unknown characters otherwise fall back to the site's text font.

To regenerate this checked-in asset, subset the upstream Medium OTF to the characters in `characters.txt`, preserve its copyright and license metadata, rename the derivative family to **G6Lite Preview Headings**, and export WOFF2. The current asset was generated using `fonttools[woff]==4.61.1`; regeneration tools are maintained locally.

The offline generation tool is not part of the website build and adds no website or npm runtime dependency. Verify rendered headings, font coverage and the upstream license when regenerating.

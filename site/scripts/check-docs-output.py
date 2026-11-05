from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json,sys,os
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
out=root/'out'
base=os.environ.get('DOCS_CHECK_BASE_PATH',os.environ.get('NEXT_PUBLIC_BASE_PATH','')).rstrip('/')
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.assets=[];self.canonical=None;self.seo=[];self.article=False;self.article_ids=[];self.codes=[];self.code=False
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='article':self.article=True
  if 'id'in a:
   self.ids.append(a['id'])
   if self.article:self.article_ids.append(a['id'])
  if t=='a'and'href'in a:self.links.append(a['href'])
  if t in ['img','script']and'src'in a:self.assets.append(a['src'])
  if t=='link'and a.get('rel')=='stylesheet':self.assets.append(a['href'])
  if t=='link'and a.get('rel')=='canonical':self.canonical=a.get('href')
  if t=='link'and a.get('rel')=='alternate'and'hreflang'in a:self.seo.append(a['href'])
  if t=='meta'and a.get('property')=='og:image':self.seo.append(a['content'])
  if t=='code':self.code=True;self.codes.append('')
 def handle_endtag(self,t):
  if t=='article':self.article=False
  if t=='code':self.code=False
 def handle_data(self,s):
  if self.code:self.codes[-1]+=s
cache={}
def file_for(route):
 route=route.rstrip('/')
 for p in [out/(route.lstrip('/')+'.html'),out/route.lstrip('/')/'index.html',out/route.lstrip('/')]:
  if p.is_file():return p
 raise AssertionError('Missing output: '+route)
def page(route):
 if route not in cache:
  p=Page();p.feed(file_for(route).read_text());cache[route]=p
 return cache[route]
errors=[];routes=[];links=assets=0;duplicates={};legacy={}
for lang in ['zh','en']:
 sources=sorted((root/'content/docs'/lang).rglob('*.mdx'))
 for src in sources:
  rel=src.relative_to(root/'content/docs'/lang).with_suffix('').as_posix()
  slug='' if rel=='index' else rel[:-6]if rel.endswith('/index')else rel
  route=('/en'if lang=='en'else'')+'/docs'+('/'+slug if slug else'')
  p=page(route);routes.append(route)
  duplicate=[key for key,n in Counter(p.article_ids).items()if n>1]
  if duplicate:duplicates[route]=duplicate
  for href in p.links+p.assets:
   u=urlsplit(href)
   if u.scheme or u.netloc or not u.path.startswith('/'):continue
   if base and not u.path.startswith(base+'/')and u.path!=base:errors.append([route,'basePath',href]);continue
   target=u.path[len(base):]if base else u.path
   try:
    f=file_for(target)
    if u.fragment and f.suffix=='.html'and unquote(u.fragment)not in page(target).ids:errors.append([route,'anchor',href])
   except AssertionError:errors.append([route,'target',href])
   if href in p.assets:assets+=1
   else:links+=1
  if not p.canonical or urlsplit(p.canonical).path.rstrip('/') != base+route:errors.append([route,'canonical',p.canonical])
  for href in p.seo:
   target=urlsplit(href).path
   if base and not target.startswith(base+'/'):errors.append([route,'seoBasePath',href]);continue
   try:file_for(target[len(base):]if base else target)
   except AssertionError:errors.append([route,'seoTarget',href])
snapshot=json.loads((root/'maintenance/b00-baseline.json').read_text())
for entries in snapshot['routes'].values():
 for r in entries:
  # React useId values belong to mounted controls, not public article fragments.
  public_anchors={anchor for anchor in r['anchors'] if not anchor.startswith(('_R_', ':R'))}
  missing=sorted(public_anchors-set(page(r['route']).ids))
  if missing:legacy[r['route']]=missing
sitemap=ET.parse(out/'sitemap.xml')
sitemap_paths={urlsplit(node.text).path.rstrip('/')for node in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
for route in routes:
 if base+route not in sitemap_paths:errors.append([route,'sitemap'])
report={'basePath':base,'routes':len(routes),'links':links,'assets':assets,'sitemapEntries':len(sitemap_paths),'legacyRoutes':sum(len(items)for items in snapshot['routes'].values()),'legacyFragmentScope':'Public article fragments; excludes generated React useId control IDs','legacyMissing':legacy,'duplicateArticleIds':duplicates,'errors':errors}
print(json.dumps(report,ensure_ascii=False,indent=2))
if legacy or duplicates or errors:sys.exit(1)

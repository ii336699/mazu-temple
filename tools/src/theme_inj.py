# puts tools/src/theme1.css between the THEME markers at the end of the page's first <style>: python3 tools/src/theme_inj.py [index.html ...]
import sys,os
css=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'theme1.css')).read()
for p in sys.argv[1:] or ['public/index.html']:
    s=open(p).read()
    if '/*<<THEME*/' not in s:
        i=s.find('</style>'); s=s[:i]+'/*<<THEME*/\n/*THEME>>*/\n'+s[i:]
    a=s.index('/*<<THEME*/'); b=s.index('/*THEME>>*/'); s=s[:a]+'/*<<THEME*/\n'+css+s[b:]
    open(p,'w').write(s); print('ok',p)

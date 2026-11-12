S=/tmp/claude-0/-home-claude/5c03eb8e-8ea3-53ce-a8c9-61face88c9ce/scratchpad
cd /home/claude/mazu-temple
cat $S/shops1.js $S/shops2.js $S/shops3.js $S/shops4.js $S/shops5.js $S/shops6.js > $S/shops_all.js
node --check $S/shops_all.js || exit 1
python3 - <<'PY'
S='/tmp/claude-0/-home-claude/5c03eb8e-8ea3-53ce-a8c9-61face88c9ce/scratchpad'
p='public/index.html'; s=open(p,encoding='utf-8').read()
a=s.index('/*<<SHOPS*/'); b=s.index('/*SHOPS>>*/')
s=s[:a]+'/*<<SHOPS*/\n'+open(S+'/shops_all.js',encoding='utf-8').read()+'\n/*SHOPS>>*/'+s[b+len('/*SHOPS>>*/'):]
open(p,'w',encoding='utf-8').write(s)
PY
python3 - <<'PY'
import re
s=open('/home/claude/mazu-temple/public/index.html',encoding='utf-8').read()
big=max(re.findall(r'<script>(.*?)</script>',s,re.S),key=len); open('/tmp/claude-0/-home-claude/5c03eb8e-8ea3-53ce-a8c9-61face88c9ce/scratchpad/main.js','w').write(big)
PY
node --check $S/main.js && echo INJECTED

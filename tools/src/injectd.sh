S=/tmp/claude-0/-home-claude/5c03eb8e-8ea3-53ce-a8c9-61face88c9ce/scratchpad
cd /home/claude/mazu-temple
node --check $S/daily1.js || exit 1
node --check $S/room1.js || exit 1
node --check $S/town1.js || exit 1
python3 - <<'PY'
S='/tmp/claude-0/-home-claude/5c03eb8e-8ea3-53ce-a8c9-61face88c9ce/scratchpad'
import re
p='public/index.html'; s=open(p,encoding='utf-8').read()
a=s.index('/*<<DAILY*/'); b=s.index('/*DAILY>>*/')
s=s[:a]+'/*<<DAILY*/\n'+open(S+'/daily1.js',encoding='utf-8').read()+'\n/*DAILY>>*/'+s[b+len('/*DAILY>>*/'):]
a=s.index('/*<<TOWN*/'); b=s.index('/*TOWN>>*/')
s=s[:a]+'/*<<TOWN*/\n'+open(S+'/town1.js',encoding='utf-8').read()+'\n/*TOWN>>*/'+s[b+len('/*TOWN>>*/'):]
a=s.index('/*<<ROOM*/'); b=s.index('/*ROOM>>*/')
s=s[:a]+'/*<<ROOM*/\n'+open(S+'/room1.js',encoding='utf-8').read()+'\n/*ROOM>>*/'+s[b+len('/*ROOM>>*/'):]
open(p,'w',encoding='utf-8').write(s)
big=max(re.findall(r'<script>(.*?)</script>',s,re.S),key=len); open(S+'/main.js','w').write(big)
PY
node --check $S/main.js && echo INJECTED

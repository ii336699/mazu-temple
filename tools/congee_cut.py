# The chair's 44 dish PNGs (一粥七天 料理 zip, 512×512, cut from sheets — some carry slivers of the neighbouring dishes at the edges)
# → public/congee/dNN.webp: keep the main dish only (largest piece, plus pieces lying inside it), clean the fringe, crop, 180 px.
# usage: python3 congee_cut.py DISH_DIR OUT_DIR
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage as nd
src,out=sys.argv[1:3]
NAMES=["鹹粥","米粉湯","宜蘭膽肝","宜蘭粉腸","宜蘭肉捲","宜蘭鴨賞","豆皮香菜捲","辣炒菜脯","黃金泡菜","涼拌小黃瓜","黃金蛋","鹹蜆仔","素雞","三色蛋","鯊魚煙","蔥油雞","紹興醉蝦","鮮燙小卷","蒜泥鮮蚵","竹筍沙拉","魚蛋沙拉","魚丸湯","鮮蚵湯","虱目魚肚湯","鱸魚湯","燙青菜","皮蛋豆腐","肝連","粉腸（豬）","炸豆腐","炸花枝丸","炸薯條","炸雞塊","炸黑輪","炸銀絲卷","府城蝦卷","炸紅燒肉（肥）","炸紅燒肉（瘦）","蚵仔酥","酥炸土魠魚","炸柳葉魚","炸小卷","阿嬤酸梅湯","阿嬤紅茶"]
for i,n in enumerate(NAMES):
    A=np.asarray(Image.open(os.path.join(src,n+'.png')).convert('RGBA')).copy(); a=A[:,:,3]
    m=nd.distance_transform_edt(a>60)>12          # a neighbour's sliver (narrow) vanishes; the dish survives
    lab,k=nd.label(m); 
    if k==0: continue
    sz=nd.sum(m,lab,range(1,k+1)); main=int(np.argmax(sz))+1; sl=nd.find_objects(lab); y0,y1,x0,x1=sl[main-1][0].start,sl[main-1][0].stop,sl[main-1][1].start,sl[main-1][1].stop
    keep=lab==main
    for j in range(1,k+1):
        if j==main: continue
        s=sl[j-1]; cy=(s[0].start+s[0].stop)/2; cx=(s[1].start+s[1].stop)/2
        if y0+8<cy<y1-8 and x0+8<cx<x1-8 and sz[j-1]>30: keep|=lab==j   # garnish inside the dish stays
    keep=(nd.distance_transform_edt(~keep)<=12.5)&(a>0)
    A[~keep,3]=0; A[:,:,3]=np.where(A[:,:,3]<40,0,A[:,:,3])
    for ax in (0,1):   # a sliver standing apart (an empty or nearly empty line between) goes too
        prof=(A[:,:,3]>40).sum(axis=ax); on=prof>2; lab1,k1=nd.label(on)
        if k1>1:
            big=np.argmax(nd.sum(prof,lab1,range(1,k1+1)))+1
            for j in range(1,k1+1):
                if j!=big:
                    idx=np.where(lab1==j)[0]
                    if ax==0: A[:,idx,3]=0
                    else: A[idx,:,3]=0
    m2=A[:,:,3]>40; l2,k2=nd.label(m2)
    if k2>1:   # last pass: loose bits outside the dish (a neighbour's rim) go; garnish well inside it stays
        z=nd.sum(m2,l2,range(1,k2+1)); mn=int(np.argmax(z))+1; s2=nd.find_objects(l2)[mn-1]; Y0,Y1,X0,X1=s2[0].start,s2[0].stop,s2[1].start,s2[1].stop; dy,dx=(Y1-Y0)*.12,(X1-X0)*.12
        for j in range(1,k2+1):
            if j==mn: continue
            c=nd.center_of_mass(m2,l2,j)
            if not (Y0+dy<c[0]<Y1-dy and X0+dx<c[1]<X1-dx): A[l2==j,3]=0
        A[(A[:,:,3]<=40),3]=0
    m3=nd.binary_opening(A[:,:,3]>40,iterations=5); l3,k3=nd.label(m3)
    if k3: z3=nd.sum(m3,l3,range(1,k3+1)); A[~(nd.binary_dilation(l3==int(np.argmax(z3))+1,iterations=1)),3]=0   # stubs left at the rim go
    p=Image.fromarray(A); p=p.crop(p.getbbox()); p.thumbnail((180,180),Image.LANCZOS); p.save(os.path.join(out,f'd{i:02d}.webp'),quality=84)
print('ok')

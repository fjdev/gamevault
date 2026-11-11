from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np,cv2,math
ROOT=Path(__file__).resolve().parent.parent/'assets/art'
P=ROOT/'v15';S=4

def material_canvas(kind):
    if kind=='mastermind':
        im=Image.open(P/'mastermind-4-10.webp').convert('RGBA')
        for row,colors in enumerate([['red','yellow','blue','green'],['green','red','orange','blue'],['blue','green','orange','yellow'],['red','green',None,None]]):
            for j,c in enumerate(colors):
                if c:
                    peg=Image.open(P/f'peg-{c}.png').convert('RGBA')
                    im.alpha_composite(peg,((([68,106,144,182][j])-15)*S,(58+28*row-15)*S))
    elif kind=='othello':
        im=Image.open(P/'othello-base.webp').convert('RGBA')
        for r,c,v in [[3,3,1],[3,4,-1],[4,3,-1],[4,4,1],[3,5,1],[4,5,-1],[5,3,1],[2,4,-1],[2,5,1],[5,4,-1],[5,5,1],[2,3,1]]:
            part=Image.open(P/('disc-white.png' if v==-1 else 'disc-black.png')).convert('RGBA')
            x=24+c*34+17;y=30+r*34+17
            im.alpha_composite(part,((x-20)*S,(y-20)*S))
    else:
        im=Image.open(P/'battleship-place.webp').convert('RGBA')
        for row,col,size,vert in [(1,1,5,False),(3,7,4,True),(5,2,3,False),(6,5,3,True),(8,2,2,False)]:
            part=Image.open(P/f'ship-{size}.png').convert('RGBA')
            x=35+col*25;y=63+row*25
            if vert:
                part=part.rotate(-90,expand=True)
                px=int((x+12.5)*S-part.width/2);py=int((y+size*25/2)*S-part.height/2)
            else:
                px=int((x-4)*S);py=int((y+12.5)*S-part.height/2)
            im.alpha_composite(part,(px,py))
    return im

def make_photo(kind):
    W,H=960,648
    tile=Image.open(ROOT/'floor-flagstone.png').convert('RGB').resize((400,400),Image.Resampling.BICUBIC)
    bg=Image.new('RGB',(W,H));
    for y in range(0,H,400):
        for x in range(0,W,400):bg.paste(tile,(x,y))
    arr=np.asarray(bg,dtype=np.float32);y,x=np.mgrid[:H,:W].astype(np.float32)
    N=np.random.default_rng(1002+len(kind)).normal(0,4,(H,W,1))
    warm=np.exp(-(((x-W*.44)/(W*.49))**2+((y-H*.30)/(H*.52))**2)*1.2)
    rim=np.clip(1-((x-W*.5)/(W*.72))**2-((y-H*.45)/(H*.76))**2,0,1)
    arr=np.clip(arr*(.29+.72*warm[:,:,None]+.25*rim[:,:,None])+N,0,255)
    arr[:,:,0]+=warm*16;arr[:,:,2]-=warm*11
    bg=Image.fromarray(np.uint8(np.clip(arr,0,255)),'RGB')
    panel=material_canvas(kind)
    pw,ph=panel.size
    dst=np.float32([[262,31],[697,48],[724,607],[231,598]])
    if kind=='othello':dst=np.float32([[248,52],[700,43],[710,602],[242,600]])
    if kind=='battleship':dst=np.float32([[256,38],[710,54],[714,603],[245,598]])
    src=np.float32([[0,0],[pw,0],[pw,ph],[0,ph]])
    M=cv2.getPerspectiveTransform(src,dst)
    a=np.asarray(panel,dtype=np.uint8)
    warp=cv2.warpPerspective(a,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_CONSTANT,borderValue=(0,0,0,0))
    # Real contact shadow under photographed case, displaced down and right.
    mask=cv2.warpPerspective(np.full((ph,pw),255,np.uint8),M,(W,H))
    blur=cv2.GaussianBlur(mask,(0,0),16).astype('float32')/255.
    shadow=np.zeros((H,W,4),dtype=np.uint8);shadow[:,:,:3]=0;shadow[:,:,3]=np.uint8(np.clip(blur*208,0,255))
    layer=Image.fromarray(shadow,'RGBA');bg=bg.convert('RGBA');bg.alpha_composite(layer)
    bg.alpha_composite(Image.fromarray(warp,'RGBA'))
    a=np.asarray(bg.convert('RGB'),dtype=np.float32)
    # Low-resolution photochemical sensor, uneven tungsten/blue shadows.
    x=np.linspace(0,1,W)[None,:];y=np.linspace(0,1,H)[:,None]
    vig=np.clip(1-.35*((x-.44)**2*2.1+(y-.45)**2*1.8),.5,1)
    a*=vig[:,:,None];a[:,:,0]*=1.045;a[:,:,1]*=.955;a[:,:,2]*=.91
    a+=np.random.default_rng(41).normal(0,4,(H,W,1))
    a=np.clip(a,0,255).astype(np.uint8)
    im=Image.fromarray(a).resize((480,324),Image.Resampling.LANCZOS)
    im=im.resize((320,216),Image.Resampling.BILINEAR)
    data=np.asarray(im).copy().astype('float32')
    data=(np.floor(data/8)*8)+np.random.default_rng(511).normal(0,2,data.shape[:2]+(1,))
    im=Image.fromarray(np.uint8(np.clip(data,0,255))).resize((480,324),Image.Resampling.NEAREST)
    im.save(ROOT/f'{kind}-tabletop-v15.webp',quality=94,method=5)
    print(kind, im.size)

if __name__=='__main__':
    for k in ('mastermind','othello','battleship'):make_photo(k)

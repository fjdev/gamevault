#!/usr/bin/env python3
"""Original 3D-rendered material & sprite plates for Game Vault v15.
    Exact gameplay projection is orthographic, locked to canvas hit-test coordinates.
    All textures and geometry are locally generated and contain no external photos.
"""
from __future__ import annotations
import os, math, random
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
from scipy.ndimage import gaussian_filter
import vtk
from vtk.util.numpy_support import vtk_to_numpy
import cv2

OUT=Path(__file__).resolve().parent.parent/'assets/art/v15';OUT.mkdir(parents=True,exist_ok=True)
SCALE=4
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SERIF='/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
RNG=np.random.default_rng(42061)

def font(n,serif=False): return ImageFont.truetype(SERIF if serif else FONT,max(5,int(n)))

def material_img(w,h,base,seed=1,kind='plastic'):
    """Microsurface albedo: multi-octave stain, dust, tool scratches, plastic flow/wood grain."""
    rng=np.random.default_rng(seed)
    W=int(w*SCALE);H=int(h*SCALE)
    n0=rng.normal(0,1,(H,W)).astype('float32')
    n1=gaussian_filter(rng.normal(0,1,(max(2,H//15),max(2,W//15))).astype('float32'),.65)
    n1=cv2.resize(n1,(W,H),interpolation=cv2.INTER_CUBIC);n1/=max(1e-6,n1.std())
    n2=gaussian_filter(rng.normal(0,1,(max(2,H//50),max(2,W//50))).astype('float32'),.85)
    n2=cv2.resize(n2,(W,H),interpolation=cv2.INTER_CUBIC);n2/=max(1e-6,n2.std())
    y,x=np.mgrid[:H,:W].astype('float32');u=x/max(1,W-1);v=y/max(1,H-1)
    light=(0.64-u)*10+(0.38-v)*7
    a=np.zeros((H,W,3),dtype=np.float32);a[:]=base
    a+=n0[:,:,None]*2.6+n1[:,:,None]*3.8+n2[:,:,None]*5.5+light[:,:,None]
    if kind=='sea':
        bands=np.sin(v*180+np.sin(u*29)*1.8)*1.2+np.sin(u*17+v*6)*2.6
        a[:,:,1]+=bands*1.7;a[:,:,2]+=bands*2.5
        a[:,:,0]-=n1*1.5
    if kind=='wood':
        # Real injection-moulded woodgrain streaks, not flat hand-drawn curves.
        grain=np.sin(v*160+10*np.sin(u*7+v*13)+n2*4)*2.2+np.sin(v*490+n1*4)*1.1
        a[:,:,0]+=grain*1.7;a[:,:,1]+=grain*.8;a[:,:,2]+=grain*.4
    if kind=='felt':
        fiber=(np.sin(u*W*.71+v*H*.19)+np.sin(v*H*.47-u*W*.31))*1.1
        a+=fiber[:,:,None];a[:,:,1]+=n0*.8
    im=Image.fromarray(np.uint8(np.clip(a,0,255)),'RGB')
    d=ImageDraw.Draw(im,'RGBA')
    # abrasion: largely transparent, extremely short, preferentially along one material axis
    num=int(w*h*(.028 if kind=='felt' else .053))
    for i in range(num):
        x=int(rng.uniform(0,W));y=int(rng.uniform(0,H))
        ln=rng.uniform(.7,12)*SCALE
        if kind=='wood':ex=x+int(ln*.20);ey=y+int(ln)
        else:ex=x+int(ln);ey=y+int(rng.normal(0,.5)*SCALE)
        col=(242,233,206,int(rng.uniform(5,30))) if rng.random()>.48 else (5,9,9,int(rng.uniform(7,23)))
        d.line([(x,y),(ex,ey)],fill=col,width=1 if rng.random()>.05 else 2)
    for i in range(int(w*h*.028)):
        x=int(rng.uniform(0,W));y=int(rng.uniform(0,H));r=1 if rng.random()>.10 else 2
        d.ellipse((x-r,y-r,x+r,y+r), fill=(220,195,159,int(rng.uniform(10,42))))
    return im

def bevel_cavity(im,x,y,r,metal='brown',seed=0):
    """Locally shaded, textured blind hole with raised mould lip, not a flat black dot."""
    d=ImageDraw.Draw(im,'RGBA');x=int(x*SCALE);y=int(y*SCALE);r=r*SCALE
    if metal=='brown':
        colors=((13,7,6,230),(78,46,32,255),(181,129,95,195),(242,182,129,75))
    elif metal=='sea':
        colors=((2,13,25,250),(18,62,73,255),(69,157,156,210),(174,229,207,85))
    else:
        colors=((1,5,7,250),(18,32,33,255),(85,118,112,130),(220,231,213,50))
    def ellipse(R,c,dx=0,dy=0):
        d.ellipse((int(x-R+dx),int(y-R+dy),int(x+R+dx),int(y+R+dy)),fill=c)
    ellipse(r+1.9*SCALE, colors[0],1.1*SCALE,1.5*SCALE)
    ellipse(r+1.7*SCALE,colors[2],-.5*SCALE,-.6*SCALE)
    ellipse(r+1.0*SCALE,colors[1],.7*SCALE,1.1*SCALE)
    ellipse(r*.72,colors[0],.5*SCALE,1.0*SCALE)
    ellipse(r*.46,(4,8,12,240),.7*SCALE,1.5*SCALE)
    d.arc((x-r*1.25,y-r*1.25,x+r*1.25,y+r*1.25),189,282,fill=colors[3],width=max(1,int(.55*SCALE)))
    d.arc((x-r*.9,y-r*.9,x+r*.9,y+r*.9),14,115,fill=(3,8,12,125),width=max(1,int(.65*SCALE)))

def create_othello_texture():
    im=material_img(272,272,(27,111,79),seed=65,kind='felt')
    d=ImageDraw.Draw(im,'RGBA')
    # Real molded grid printing: inner dark tracks, side highlight from relief
    for i in range(9):
        u=i*34*SCALE
        d.line([(u,0),(u,272*SCALE)],fill=(0,24,25,225),width=6)
        d.line([(u+4,0),(u+4,272*SCALE)],fill=(203,234,190,26),width=2)
        d.line([(0,u),(272*SCALE,u)],fill=(0,29,22,225),width=6)
        d.line([(0,u+4),(272*SCALE,u+4)],fill=(211,244,210,22),width=2)
    # A few subtle pin-prick mold variations.
    for xy in ((51,51),(221,51),(51,221),(221,221)):
        x,y=[p*SCALE for p in xy];d.ellipse((x-4,y-4,x+4,y+4),fill=(0,40,25,110))
    return im

def create_master_texture(slots):
    # texture spans 320x432 full frontal interior. The actual frame remains independent 3D geometry.
    im=material_img(280,367,(143,92,61),seed=99+slots,kind='wood')
    d=ImageDraw.Draw(im,'RGBA'); s=SCALE
    # background starts x20,y36; current texture local y0=>world y36
    for row in range(12):
        y=58+row*28-36
        d.rounded_rectangle((7*s,(y-12)*s,272*s,(y+12)*s),radius=3*s,fill=(241,198,139,13))
        d.line(((11*s,(y+12)*s),(271*s,(y+12)*s)),fill=(48,25,17,140),width=3)
        d.line(((11*s,(y+13)*s),(271*s,(y+13)*s)),fill=(239,190,133,65),width=1)
        for j,x in enumerate([68,106,144,182] if slots==4 else [49,84,119,154,189]):
            bevel_cavity(im,x-20,y,11.0,'brown',j+row)
        for j in range(slots):
            x=240+(j%3)*16-20;y2=y-5+(j//3)*10
            bevel_cavity(im,x,y2,3.8,'brown',j+row)
        d.text((16*s,(y-4)*s),str(row+1),font=font(7*s),fill=(66,40,26,190))
    # lettering and injection seams near lip
    d.text((107*s,3*s),'CODE',font=font(7*s),fill=(53,31,25,170),anchor='mt')
    d.text((244*s,3*s),'KEY',font=font(7*s),fill=(53,31,25,160),anchor='mt')
    d.line((203*s,5*s,203*s,360*s),fill=(57,33,25,165),width=3)
    d.line((205*s,5*s,205*s,360*s),fill=(250,201,150,57),width=2)
    return im

def create_sea_texture(cell):
    W=cell*10
    im=material_img(W,W,(33,111,126),seed=77+cell,kind='sea')
    d=ImageDraw.Draw(im,'RGBA');s=SCALE
    for row in range(10):
        for col in range(10):
            x=col*cell;y=row*cell
            d.rectangle((x*s,y*s,(x+cell)*s,(y+cell)*s),outline=(151,211,197,46),width=2)
            d.line(((x+1)*s,(y+1)*s,(x+cell-1)*s,(y+1)*s), fill=(202,244,226,39),width=1)
            bevel_cavity(im,x+cell/2,y+cell/2,cell*.175,'sea',row*10+col)
    # molded dividing lines over surface
    for k in range(11):
        t=k*cell*s
        d.line((t,0,t,W*s),fill=(9,52,64,124),width=3)
        d.line((0,t,W*s,t),fill=(12,58,63,130),width=3)
    return im

# ---- actual 3D studio geometry and material shading ----
class Studio:
    def __init__(self,w,h,scale=SCALE,transparent=False):
        self.w=w;self.h=h;self.scale=scale
        self.ren=vtk.vtkRenderer();self.ren.SetBackground(.015,.019,.021)
        if transparent:self.ren.SetBackgroundAlpha(0.)
        self.ren.AutomaticLightCreationOff()
        self.win=vtk.vtkRenderWindow();self.win.SetOffScreenRendering(True);self.win.SetMultiSamples(8)
        self.win.SetAlphaBitPlanes(1)
        self.win.SetSize(int(w*scale),int(h*scale));self.win.AddRenderer(self.ren)
        cam=self.ren.GetActiveCamera();cam.ParallelProjectionOn();cam.SetPosition(w/2,h/2,480);cam.SetFocalPoint(w/2,h/2,0)
        cam.SetViewUp(0,1,0);cam.SetParallelScale(h/2)
        for x,y,z,pow,col in [(-130,h+210,290,1.3,(1,.71,.48)),(w+230,-120,250,.62,(.62,.77,1)),(w*.38,h*.51,510,.20,(1.,.95,.81))]:
            lt=vtk.vtkLight();lt.SetLightTypeToSceneLight();lt.SetPosition(x,y,z);lt.SetFocalPoint(w/2,h/2,0);lt.SetIntensity(pow);lt.SetColor(*col);self.ren.AddLight(lt)
    def actor(self,src,color=(.7,.7,.7),metal=.03,rough=.43):
        m=vtk.vtkPolyDataMapper()
        if isinstance(src,vtk.vtkAlgorithm):m.SetInputConnection(src.GetOutputPort())
        else:m.SetInputData(src)
        a=vtk.vtkActor();a.SetMapper(m)
        p=a.GetProperty();p.SetInterpolationToPBR();p.SetColor(*color);p.SetMetallic(metal);p.SetRoughness(rough)
        self.ren.AddActor(a);return a
    def block(self,x,y,w,h,z,depth,color,metal=.03,rough=.42):
        c=vtk.vtkCubeSource();c.SetXLength(w);c.SetYLength(h);c.SetZLength(depth)
        a=self.actor(c,color,metal,rough);a.SetPosition(x+w/2,self.h-y-h/2,z);return a
    def rounded(self,x,y,w,h,z,depth,r,color,metal=.03,rough=.4):
        # VTK mesh of an injection-molded rounded block with chamfered raised bevel.
        ncorner=14;contour=[]
        for cx,cy,start in [(w-r,r,-90),(w-r,h-r,0),(r,h-r,90),(r,r,180)]:
            for t in np.linspace(math.radians(start),math.radians(start+90),ncorner,endpoint=False):
                px=cx+r*math.cos(t);py=cy+r*math.sin(t);contour.append((px,py))
        # contour coordinates in y-down; convert to VTK y-up
        center=np.array([w/2,h/2]);count=len(contour)
        rings=[(0,0),(.11,depth*.12),(.20,depth*.38),(.30,depth*.70),(.47,depth)]
        points=vtk.vtkPoints();polys=vtk.vtkCellArray()
        for inset,zz in rings:
            for px,py in contour:
                nx=px+inset*(1 if px<w/2 else -1);ny=py+inset*(1 if py<h/2 else -1)
                points.InsertNextPoint(x+nx,self.h-(y+ny),z+zz)
        for q in range(len(rings)-1):
            for j in range(count):
                k=(j+1)%count
                pts=vtk.vtkQuad();pts.GetPointIds().SetId(0,q*count+j);pts.GetPointIds().SetId(1,q*count+k)
                pts.GetPointIds().SetId(2,(q+1)*count+k);pts.GetPointIds().SetId(3,(q+1)*count+j);polys.InsertNextCell(pts)
        pid=points.InsertNextPoint(x+w/2,self.h-(y+h/2),z+depth)
        for j in range(count):
            tri=vtk.vtkTriangle();tri.GetPointIds().SetId(0,pid);tri.GetPointIds().SetId(1,(len(rings)-1)*count+j)
            tri.GetPointIds().SetId(2,(len(rings)-1)*count+((j+1)%count));polys.InsertNextCell(tri)
        poly=vtk.vtkPolyData();poly.SetPoints(points);poly.SetPolys(polys)
        norms=vtk.vtkPolyDataNormals();norms.SetInputData(poly);norms.ConsistencyOn();norms.AutoOrientNormalsOn();norms.SplittingOff();norms.Update()
        return self.actor(norms.GetOutput(),color,metal,rough)
    def texture(self,x,y,w,h,z,img,rough=.45,metal=.01):
        srcfile=OUT/(f'_tmp_{os.getpid()}_{len(list(OUT.glob("_tmp_*")))}.png');img.save(srcfile)
        plane=vtk.vtkPlaneSource();plane.SetOrigin(x,self.h-(y+h),z);plane.SetPoint1(x+w,self.h-(y+h),z);plane.SetPoint2(x,self.h-y,z)
        read=vtk.vtkPNGReader();read.SetFileName(str(srcfile));tex=vtk.vtkTexture();tex.SetInputConnection(read.GetOutputPort());tex.InterpolateOn();tex.EdgeClampOn();tex.UseSRGBColorSpaceOn()
        a=self.actor(plane,(1,1,1),metal,rough);a.GetProperty().SetBaseColorTexture(tex);a._reader=read;a._texture=tex
        return a
    def cylinder(self,x,y,r,depth,z,color,rough=.35,metal=.06):
        src=vtk.vtkCylinderSource();src.SetRadius(r);src.SetHeight(depth);src.SetResolution(42);src.CappingOn()
        a=self.actor(src,color,metal,rough);a.RotateX(90);a.SetPosition(x,self.h-y,z);return a
    def sphere(self,x,y,r,z,color,flatten=1.0,rough=.32):
        src=vtk.vtkSphereSource();src.SetRadius(1);src.SetThetaResolution(52);src.SetPhiResolution(26)
        a=self.actor(src,color,.03,rough);a.SetScale(r,r,r*flatten);a.SetPosition(x,self.h-y,z);return a
    def capture(self):
        self.win.Render();f=vtk.vtkWindowToImageFilter();f.SetInput(self.win);f.SetInputBufferTypeToRGBA();f.ReadFrontBufferOff();f.Update()
        output=f.GetOutput();ext=output.GetDimensions();a=vtk_to_numpy(output.GetPointData().GetScalars()).reshape(ext[1],ext[0],4)
        return Image.fromarray(np.flipud(a.copy()),'RGBA')

def screw(studio,x,y,kind):
    col={'wood':(.34,.25,.18),'black':(.31,.35,.31),'navy':(.34,.45,.47)}[kind]
    studio.cylinder(x,y,2.5,0.6,10,col,rough=.16,metal=.8)

def case(studio,kind):
    w,h=studio.w,studio.h
    if kind=='wood': colors=[(.27,.13,.073),(.36,.20,.12),(.43,.26,.15)]
    elif kind=='black':colors=[(.016,.025,.028),(.025,.042,.041),(.064,.084,.08)]
    else:colors=[(.015,.042,.066),(.025,.075,.104),(.048,.11,.14)]
    studio.rounded(1.4,1.4,w-2.8,h-2.8,0,5.8,8,colors[0],rough=.28)
    studio.rounded(4.5,4.5,w-9,h-9,5.8,2.0,7,colors[1],rough=.32)
    studio.rounded(9,10,w-18,h-20,7.8,1.9,4,colors[2],rough=.45)
    for x,y in ((13,13),(w-13,13),(13,h-13),(w-13,h-13)):screw(studio,x,y,kind)

def annotate(im,label,kind,top=True):
    d=ImageDraw.Draw(im,'RGBA');s=SCALE
    if kind=='mastermind':
        d.text((160*s,20*s),label,font=font(11*s),fill=(225,166,120,225),anchor='mm',stroke_width=1)
        d.text((160*s,(im.height/s-19)*s),'1972  ·  CODE BREAKER',font=font(7*s),fill=(172,123,91,190),anchor='mm')
    elif kind=='othello':
        d.text((160*s,321*s),label,font=font(16*s,serif=True),fill=(195,165,109,215),anchor='mm',stroke_width=1)
    elif kind=='battleship':
        d.text((160*s,22*s),label,font=font(10*s),fill=(189,213,210,225),anchor='mm')
        d.text((160*s,(im.height/s-19)*s),'NAVAL COMBAT   ·   1990',font=font(7*s),fill=(144,167,167,170),anchor='mm')

def photo_grade(im,kind):
    """Gentle analog optical imperfections applied to hi-res source, NEVER baked gameplay pixels."""
    a=np.array(im.convert('RGB'),dtype=np.float32);h,w=a.shape[:2]
    yy,xx=np.mgrid[:h,:w].astype(np.float32);nx=xx/w;ny=yy/h
    shade=1.10-.17*nx-.10*ny-.22*np.clip(((nx-.50)**2+(ny-.42)**2)*1.55,0,1)
    a*=shade[:,:,None]
    np.random.seed(222)
    a+=np.random.default_rng(422).normal(0,1.8,(h,w,1))
    # very slight teal shadows/warm overhead specular
    a[:,:,0]*=1.016;a[:,:,2]*=.971
    return Image.fromarray(np.uint8(np.clip(a,0,255)),'RGB')

def save_bg(image,name,kind):
    image=photo_grade(image,kind); image.save(OUT/name,quality=94,method=5);print('BG',name,image.size,flush=True)

def gen_master(slots):
    h=432;scene=Studio(320,h)
    case(scene,'wood')
    scene.rounded(15,32,290,h-70,8.8,1.8,4,(.51,.32,.21),rough=.56)
    tex=create_master_texture(slots)
    scene.texture(20,36,280,h-65,10.9,tex,rough=.61)
    out=scene.capture().convert('RGB')
    annotate(out,'SUPER MASTER MIND','mastermind')
    # floorplate is one real 3D capture; shorter boards remove contiguous middle strips
    for n in range(8,13):
        rem=(12-n)*28*SCALE
        if rem:
            cut=(58+n*28-13)*SCALE
            tmp=Image.new('RGB',(320*SCALE,(96+n*28)*SCALE))
            tmp.paste(out.crop((0,0,320*SCALE,cut)),(0,0))
            tmp.paste(out.crop((0,cut+rem,320*SCALE,h*SCALE)),(0,cut))
        else:tmp=out
        save_bg(tmp,f'mastermind-{slots}-{n}.webp','mastermind')

def gen_othello():
    scene=Studio(320,334);case(scene,'black')
    scene.rounded(16,19,288,288,8,1.5,2,(.005,.017,.016),rough=.24)
    scene.rounded(20,25,280,280,9.7,1.3,1,(.05,.17,.12),rough=.55)
    scene.texture(24,30,272,272,11.2,create_othello_texture(),rough=.84)
    out=scene.capture().convert('RGB');annotate(out,'Othello','othello')
    save_bg(out,'othello-base.webp','othello')

def gen_battle_grid(scene,g):
    x,y,cell=g;w=cell*10
    scene.rounded(x-7,y-7,w+14,w+14,8.8,1.6,2,(.01,.035,.055),rough=.35)
    scene.rounded(x-3,y-3,w+6,w+6,10.4,1.2,2,(.038,.22,.24),rough=.36)
    scene.texture(x,y,w,w,12.1,create_sea_texture(cell),rough=.38,metal=.04)

def gen_battle(placing):
    h=368 if placing else 652; scene=Studio(320,h);case(scene,'navy')
    if placing:
        gen_battle_grid(scene,(35,63,25))
        a=scene.capture().convert('RGB');annotate(a,'BATTLESHIP  ·  DEPLOY FLEET','battleship')
        save_bg(a,'battleship-place.webp','battleship')
    else:
        gen_battle_grid(scene,(35,59,25));gen_battle_grid(scene,(60,412,20))
        scene.rounded(14,345,292,23,11,2,3,(.015,.029,.034),rough=.25,metal=.1)
        for x in (50,160,270):scene.cylinder(x,355,7,1.6,14,(.18,.26,.29),rough=.30,metal=.5)
        a=scene.capture().convert('RGB')
        d=ImageDraw.Draw(a);d.text((160*SCALE,26*SCALE),'TARGET WATERS',font=font(10*SCALE),fill=(175,210,204),anchor='mm')
        d.text((160*SCALE,387*SCALE),'YOUR FLEET',font=font(10*SCALE),fill=(175,210,204),anchor='mm')
        d.text((160*SCALE,634*SCALE),'HIT  ·  MISS  ·  SINK THE FLEET',font=font(7*SCALE),fill=(144,176,177),anchor='mm')
        save_bg(a,'battleship-play.webp','battleship')

# Isolated physically modeled parts using same light, with true alpha
# Sprites have contact shadow and metallic highlights, no digitally drawn flat circles.

def sprite_scene(w,h):
    return Studio(w,h,scale=SCALE,transparent=True)

def crop_alpha(im):
    # VTK's EGL transparent background may preserve RGB of unpremultiplied pixels.
    a=np.array(im)
    # Force fully transparent pixels to zero for clean Canvas interpolation.
    a[a[:,:,3]<3,:]=0
    return Image.fromarray(a,'RGBA')

def generate_disc(ivory):
    # 40px sprite, actual physical disc ~27.4px.
    s=sprite_scene(40,40)
    color=(.76,.74,.65) if ivory else (.025,.028,.033)
    s.cylinder(20,20,13.7,3.7,4,color,rough=.22 if ivory else .21,metal=.035)
    s.cylinder(20,20,11.9,.8,6.2,tuple(min(.98,c*1.13) for c in color),rough=.24,metal=.02)
    a=crop_alpha(s.capture())
    if not ivory:
        # Tungsten specularity must not wash carbon-black resin into grey.
        px=np.asarray(a).copy();px[:,:,:3]=np.clip(px[:,:,:3].astype(np.float32)*.39-7,0,255).astype(np.uint8);a=Image.fromarray(px,'RGBA')
    # contact shadow modeled as soft optical composite, 2d plane behind volume
    shadow=Image.new('RGBA',a.size,(0,0,0,0));sd=ImageDraw.Draw(shadow)
    sd.ellipse((int(7*SCALE),int(8*SCALE),int(36*SCALE),int(37*SCALE)),fill=(0,0,0,125))
    shadow=shadow.filter(ImageFilter.GaussianBlur(2*SCALE));shadow.alpha_composite(a)
    shadow.save(OUT/('disc-white.png' if ivory else 'disc-black.png'));print('SPRITE disc',ivory,flush=True)

def generate_peg(color,name,clue=False):
    w=30 if not clue else 18;s=sprite_scene(w,w);r=9.7 if not clue else 4.2
    s.cylinder(w/2,w/2,r*.90,2.1,3.2,color,rough=.22)
    s.sphere(w/2,w/2,r*.91,5.3,color,flatten=.38,rough=.14)
    a=crop_alpha(s.capture());bg=Image.new('RGBA',a.size,(0,0,0,0));d=ImageDraw.Draw(bg)
    R=r*SCALE;cx=w*SCALE/2;cy=w*SCALE/2
    d.ellipse((cx-R+2*SCALE,cy-R+4*SCALE,cx+R+2*SCALE,cy+R+4*SCALE),fill=(0,0,0,145))
    bg=bg.filter(ImageFilter.GaussianBlur(1.3*SCALE));bg.alpha_composite(a)
    bg.save(OUT/f'peg-{name}.png');print('SPRITE peg',name,flush=True)

def hull_sprite(length):
    # Navy/grey miniature with bow, raised superstructure, rivets and deck grooves.
    cell=25;w=length*cell+8;h=34;cx=cell*length/2+4
    s=sprite_scene(w,h)
    # build pointed hull as irregular 3D body with layered deck using polydata
    L=length*cell
    xy=[(3,17),(9,9),(18,5),(L-15,5),(L-4,12),(L+3,17),(L-4,23),(L-15,29),(18,29),(9,25)]
    P=vtk.vtkPoints();POL=vtk.vtkCellArray()
    for z in [3,6.5]:
        for px,py in xy:P.InsertNextPoint(px+3,h-py,z)
    n=len(xy)
    for j in range(n):
        quad=vtk.vtkQuad()
        for ix,pt in enumerate((j,(j+1)%n,(j+1)%n+n,j+n)):quad.GetPointIds().SetId(ix,pt)
        POL.InsertNextCell(quad)
    center=P.InsertNextPoint(L/2+3,h-17,6.5)
    for j in range(n):
        tri=vtk.vtkTriangle()
        for i,pt in enumerate((center,j+n,(j+1)%n+n)):tri.GetPointIds().SetId(i,pt)
        POL.InsertNextCell(tri)
    poly=vtk.vtkPolyData();poly.SetPoints(P);poly.SetPolys(POL)
    norms=vtk.vtkPolyDataNormals();norms.SetInputData(poly);norms.AutoOrientNormalsOn();norms.Update()
    s.actor(norms.GetOutput(),(.36,.43,.45),metal=.35,rough=.37)
    s.rounded(17,12,L-30,10,6.5,2,2,(.25,.32,.34),metal=.2,rough=.40)
    for i in range(1,length):
        x=i*cell+3
        s.rounded(x-2.6,13.5,5.2,7.1,9,2,1,(.45,.48,.46),metal=.25,rough=.42)
    if length>=3:
        s.rounded(L*.42,9,17,16,9,4,2,(.29,.38,.40),metal=.4,rough=.30)
        s.rounded(L*.42+4,11,5,7,13,1,1,(.62,.61,.54),metal=.2,rough=.28)
    if length>=5:
        s.rounded(28,11,L-46,12,11,1.4,2,(.47,.51,.50),metal=.17,rough=.49)
        for k in range(3):s.rounded(39+k*21,15,10,3,13,1,1,(.23,.28,.30),metal=.2)
    a=crop_alpha(s.capture());sh=Image.new('RGBA',a.size);d=ImageDraw.Draw(sh)
    d.rounded_rectangle((4*SCALE,9*SCALE,(L+6)*SCALE,28*SCALE),radius=5*SCALE,fill=(0,0,0,150))
    sh=sh.filter(ImageFilter.GaussianBlur(2.3*SCALE));sh.alpha_composite(a)
    sh.save(OUT/f'ship-{length}.png');print('SHIP',length,flush=True)

def shots(name,color):
    generate_peg(color,name,clue=True)

if __name__=='__main__':
    for n in (4,5):gen_master(n)
    gen_othello();gen_battle(True);gen_battle(False)
    generate_disc(True);generate_disc(False)
    colors={'red':(.62,.06,.045),'blue':(.09,.26,.57),'green':(.14,.43,.21),'yellow':(.85,.58,.09),'orange':(.84,.31,.07),'white':(.86,.81,.69),'black':(.03,.037,.044),'brown':(.39,.21,.12),'purple':(.42,.16,.75),'pink':(.95,.30,.55),'cyan':(.035,.68,.78),'lime':(.49,.77,.06)}
    for name,c in colors.items():generate_peg(c,name)
    for n in (2,3,4,5):hull_sprite(n)
    print('finished',len(list(OUT.glob('*'))),'assets',flush=True)

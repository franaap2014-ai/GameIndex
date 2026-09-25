(function(root){
  'use strict';

  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
  const coverBaseSize=(iw,ih,fw,fh,mode='fill')=>{
    iw=Math.max(1,Number(iw)||1);ih=Math.max(1,Number(ih)||1);fw=Math.max(1,Number(fw)||1);fh=Math.max(1,Number(fh)||1);
    const fit=String(mode||'fill').toLowerCase()==='fit';
    const ratio=fit?Math.min(fw/iw,fh/ih):Math.max(fw/iw,fh/ih);
    return{width:iw*ratio,height:ih*ratio,ratio};
  };
  const scaleFromDistance=(initialScale,initialDistance,currentDistance,minScale=.15,maxScale=10)=>{
    const base=Math.max(.0001,Number(initialDistance)||1),next=(Number(initialScale)||1)*(Math.max(.0001,Number(currentDistance)||.0001)/base);
    return clamp(next,minScale,maxScale);
  };
  const normalizedTranslation=(tx,ty,w,h)=>({x:(Number(tx)||0)/Math.max(1,Number(w)||1),y:(Number(ty)||0)/Math.max(1,Number(h)||1)});
  const denormalizedTranslation=(x,y,w,h)=>({x:(Number(x)||0)*Math.max(1,Number(w)||1),y:(Number(y)||0)*Math.max(1,Number(h)||1)});
  const cornerSigns=corner=>({nw:{x:-1,y:-1},ne:{x:1,y:-1},sw:{x:-1,y:1},se:{x:1,y:1}}[corner]||{x:1,y:1});
  const scaleFromCorner=({startScale=1,baseWidth=1,baseHeight=1,anchorX=0,anchorY=0,pointerX=0,pointerY=0,corner='se',minScale=.15,maxScale=10}={})=>{
    const sign=cornerSigns(corner),startW=Math.max(1,Number(baseWidth)||1)*(Number(startScale)||1),startH=Math.max(1,Number(baseHeight)||1)*(Number(startScale)||1);
    const vx=sign.x*startW,vy=sign.y*startH,den=Math.max(.0001,vx*vx+vy*vy);
    const dx=(Number(pointerX)||0)-(Number(anchorX)||0),dy=(Number(pointerY)||0)-(Number(anchorY)||0);
    const ratio=(dx*vx+dy*vy)/den;
    return clamp((Number(startScale)||1)*Math.max(.01,ratio),minScale,maxScale);
  };

  class GameIndexCropEditor{
    constructor(mount,{slot='BANNER',onChange=null}={}){
      if(!mount)throw new Error('CROP_EDITOR_MOUNT_REQUIRED');
      this.mount=mount;this.slot=slot==='LOGO'?'LOGO':'BANNER';this.onChange=typeof onChange==='function'?onChange:null;
      this.image=null;this.src='';this.fitMode='fill';this.scale=1;this.txNorm=0;this.tyNorm=0;this.dirty=false;
      this.interaction=null;this.resizeObserver=null;this.raf=0;
      this.renderShell();this.bind();
    }
    frameRatio(){return this.slot==='LOGO'?3:16/6;}
    outputSize(){return this.slot==='LOGO'?{width:1200,height:400}:{width:1600,height:600};}
    renderShell(){
      this.mount.innerHTML=`<div class="gi-crop-stage" tabindex="0" aria-label="Editor visual de enquadramento"><img class="gi-i1-crop-backdrop" alt="" hidden><div class="gi-crop-grid"></div><div class="gi-crop-image-box" hidden><img class="gi-crop-image" alt=""></div><button type="button" class="gi-crop-handle gi-crop-handle-nw" data-corner="nw" aria-label="Redimensionar pelo canto superior esquerdo"></button><button type="button" class="gi-crop-handle gi-crop-handle-ne" data-corner="ne" aria-label="Redimensionar pelo canto superior direito"></button><button type="button" class="gi-crop-handle gi-crop-handle-sw" data-corner="sw" aria-label="Redimensionar pelo canto inferior esquerdo"></button><button type="button" class="gi-crop-handle gi-crop-handle-se" data-corner="se" aria-label="Redimensionar pelo canto inferior direito"></button><div class="gi-crop-empty">Escolha uma imagem para começar.</div></div>`;
      this.stage=this.mount.querySelector('.gi-crop-stage');this.backdrop=this.mount.querySelector('.gi-i1-crop-backdrop');this.box=this.mount.querySelector('.gi-crop-image-box');this.imgEl=this.mount.querySelector('.gi-crop-image');this.empty=this.mount.querySelector('.gi-crop-empty');this.handles=[...this.mount.querySelectorAll('.gi-crop-handle')];
      this.setSlot(this.slot);
      if('ResizeObserver' in root){this.resizeObserver=new ResizeObserver(()=>this.scheduleLayout());this.resizeObserver.observe(this.stage);}
    }
    setSlot(slot){this.slot=slot==='LOGO'?'LOGO':'BANNER';if(this.stage)this.stage.style.setProperty('--gi-crop-ratio',String(this.frameRatio()));this.scheduleLayout();}
    bind(){
      this.stage.addEventListener('pointerdown',e=>this.startMove(e));
      this.stage.addEventListener('pointermove',e=>this.pointerMove(e));
      this.stage.addEventListener('pointerup',e=>this.pointerUp(e));
      this.stage.addEventListener('pointercancel',e=>this.pointerUp(e,true));
      for(const handle of this.handles){
        handle.addEventListener('pointerdown',e=>this.startResize(e,handle));
      }
      this.stage.addEventListener('wheel',e=>{
        if(!this.image)return;e.preventDefault();
        const step=e.deltaY>0?.92:1.08;this.scale=clamp(this.scale*step,.15,10);this.clampTranslation();this.dirty=true;this.scheduleLayout();this.changed();
      },{passive:false});
      this.stage.addEventListener('keydown',e=>{
        if(!this.image)return;const step=e.shiftKey?0.05:0.015;
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
          e.preventDefault();if(e.key==='ArrowLeft')this.txNorm-=step;if(e.key==='ArrowRight')this.txNorm+=step;if(e.key==='ArrowUp')this.tyNorm-=step;if(e.key==='ArrowDown')this.tyNorm+=step;
          this.clampTranslation();this.dirty=true;this.scheduleLayout();this.changed();
        }
      });
    }
    minScale(){return .15;}
    currentBase(rect=this.stage.getBoundingClientRect()){
      if(!this.image)return{width:1,height:1,ratio:1};
      const mode=this.fitMode==='fit'||this.fitMode==='center'?'fit':'fill';
      return coverBaseSize(this.image.naturalWidth,this.image.naturalHeight,rect.width,rect.height,mode);
    }
    startMove(e){
      if(!this.image||e.button>0||e.target.closest?.('.gi-crop-handle'))return;
      const rect=this.stage.getBoundingClientRect();
      this.interaction={kind:'move',id:e.pointerId,startX:e.clientX,startY:e.clientY,startTx:this.txNorm,startTy:this.tyNorm,frameW:rect.width,frameH:rect.height};
      try{this.stage.setPointerCapture(e.pointerId);}catch{}
      this.box.classList.add('is-dragging');this.stage.classList.add('is-interacting');e.preventDefault();
    }
    startResize(e,handle){
      if(!this.image||e.button>0)return;
      e.stopPropagation();e.preventDefault();
      const rect=this.stage.getBoundingClientRect(),base=this.currentBase(rect),sign=cornerSigns(handle.dataset.corner);
      const t=denormalizedTranslation(this.txNorm,this.tyNorm,rect.width,rect.height),centerX=rect.width/2+t.x,centerY=rect.height/2+t.y;
      const drawW=base.width*this.scale,drawH=base.height*this.scale;
      const anchorX=centerX-sign.x*drawW/2,anchorY=centerY-sign.y*drawH/2;
      this.interaction={kind:'resize',id:e.pointerId,corner:handle.dataset.corner,startScale:this.scale,baseWidth:base.width,baseHeight:base.height,anchorX,anchorY,frameW:rect.width,frameH:rect.height};
      try{this.stage.setPointerCapture(e.pointerId);}catch{}
      handle.classList.add('is-active');this.stage.classList.add('is-interacting','is-resizing');
    }
    pointerMove(e){
      const drag=this.interaction;if(!drag||drag.id!==e.pointerId)return;
      if(drag.kind==='move'){
        this.txNorm=drag.startTx+(e.clientX-drag.startX)/Math.max(1,drag.frameW);
        this.tyNorm=drag.startTy+(e.clientY-drag.startY)/Math.max(1,drag.frameH);
      }else{
        const rect=this.stage.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top,sign=cornerSigns(drag.corner);
        const next=scaleFromCorner({startScale:drag.startScale,baseWidth:drag.baseWidth,baseHeight:drag.baseHeight,anchorX:drag.anchorX,anchorY:drag.anchorY,pointerX:px,pointerY:py,corner:drag.corner,minScale:this.minScale(),maxScale:10});
        this.scale=next;
        const newW=drag.baseWidth*next,newH=drag.baseHeight*next,centerX=drag.anchorX+sign.x*newW/2,centerY=drag.anchorY+sign.y*newH/2;
        this.txNorm=(centerX-drag.frameW/2)/Math.max(1,drag.frameW);this.tyNorm=(centerY-drag.frameH/2)/Math.max(1,drag.frameH);
      }
      this.clampTranslation();this.dirty=true;this.scheduleLayout();this.changed();e.preventDefault();
    }
    pointerUp(e,cancelled=false){
      if(!this.interaction||this.interaction.id!==e.pointerId)return;
      this.box.classList.remove('is-dragging');for(const handle of this.handles)handle.classList.remove('is-active');this.stage.classList.remove('is-interacting','is-resizing');
      this.interaction=null;try{if(this.stage.hasPointerCapture?.(e.pointerId))this.stage.releasePointerCapture(e.pointerId);}catch{}
      if(!cancelled)this.changed();
    }
    changed(){this.onChange?.(this.getState());}
    setFit(mode){const next=String(mode||'fill').toLowerCase();this.fitMode=['fill','fit','center'].includes(next)?next:'fill';this.reset({keepSource:true});}
    reset({keepSource=true}={}){this.scale=1;this.txNorm=0;this.tyNorm=0;this.dirty=false;if(!keepSource){this.image=null;this.src='';this.imgEl.removeAttribute('src');}this.scheduleLayout();this.changed();}
    center(){this.txNorm=0;this.tyNorm=0;this.dirty=true;this.scheduleLayout();this.changed();}
    async setImage(src,{crossOrigin=false,fitMode='fill'}={}){
      const image=new Image();if(crossOrigin)image.crossOrigin='anonymous';
      await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('A imagem não pôde ser aberta no editor.'));image.src=src;});
      this.image=image;this.backdrop.src=src;this.src=src;this.imgEl.src=src;this.fitMode=['fill','fit','center'].includes(String(fitMode).toLowerCase())?String(fitMode).toLowerCase():'fill';this.scale=1;this.txNorm=0;this.tyNorm=0;this.dirty=false;this.empty.hidden=true;this.box.hidden=false;this.scheduleLayout();this.changed();return image;
    }
    clampTranslation(){
      if(!this.image||this.fitMode!=='fill'||this.scale<1)return;
      const rect=this.stage.getBoundingClientRect(),base=coverBaseSize(this.image.naturalWidth,this.image.naturalHeight,rect.width,rect.height,'fill');
      const drawW=base.width*this.scale,drawH=base.height*this.scale;
      const maxX=Math.max(0,(drawW-rect.width)/2)/Math.max(1,rect.width),maxY=Math.max(0,(drawH-rect.height)/2)/Math.max(1,rect.height);
      this.txNorm=clamp(this.txNorm,-maxX,maxX);this.tyNorm=clamp(this.tyNorm,-maxY,maxY);
    }
    scheduleLayout(){if(this.raf)return;this.raf=(root.requestAnimationFrame||((fn)=>setTimeout(fn,0)))(()=>{this.raf=0;this.layout();});}
    layout(){
      if(!this.stage)return;this.backdrop.hidden=!this.image||this.slot==='LOGO'||!['fit','center'].includes(this.fitMode);this.stage.style.aspectRatio=String(this.frameRatio());
      if(!this.image){this.box.hidden=true;this.empty.hidden=false;this.stage.classList.remove('has-image');for(const h of this.handles)h.hidden=true;return;}
      const rect=this.stage.getBoundingClientRect();if(!rect.width||!rect.height)return;
      const base=this.currentBase(rect);this.clampTranslation();const t=denormalizedTranslation(this.txNorm,this.tyNorm,rect.width,rect.height),centerX=rect.width/2+t.x,centerY=rect.height/2+t.y,drawW=base.width*this.scale,drawH=base.height*this.scale;
      this.box.hidden=false;this.empty.hidden=true;this.box.style.width=`${base.width}px`;this.box.style.height=`${base.height}px`;this.stage.classList.add('has-image');this.box.style.transform=`translate3d(calc(-50% + ${t.x}px),calc(-50% + ${t.y}px),0) scale(${this.scale})`;
      const pad=14;
      for(const handle of this.handles){const sign=cornerSigns(handle.dataset.corner),rawX=centerX+sign.x*drawW/2,rawY=centerY+sign.y*drawH/2;handle.hidden=false;handle.style.left=`${clamp(rawX,pad,rect.width-pad)}px`;handle.style.top=`${clamp(rawY,pad,rect.height-pad)}px`;}
    }
    getState(){return{slot:this.slot,fitMode:this.fitMode,scale:Number(this.scale.toFixed(5)),positionX:Number((.5+this.txNorm).toFixed(5)),positionY:Number((.5+this.tyNorm).toFixed(5)),dirty:this.dirty,hasImage:Boolean(this.image)};}
    toCanvas({width,height}={}){
      if(!this.image)throw new Error('Escolha uma imagem antes de aplicar.');
      const out=this.outputSize(),w=Math.max(64,Math.min(4096,Number(width)||out.width)),h=Math.max(64,Math.min(4096,Number(height)||out.height));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');
      const stage=this.stage.getBoundingClientRect(),mode=this.fitMode==='fit'||this.fitMode==='center'?'fit':'fill',base=coverBaseSize(this.image.naturalWidth,this.image.naturalHeight,stage.width,stage.height,mode),t=denormalizedTranslation(this.txNorm,this.tyNorm,stage.width,stage.height),dw=base.width*this.scale,dh=base.height*this.scale,dx=(stage.width-dw)/2+t.x,dy=(stage.height-dh)/2+t.y,sx=w/Math.max(1,stage.width),sy=h/Math.max(1,stage.height);
      ctx.clearRect(0,0,w,h);if(mode==='fit'&&this.slot!=='LOGO'){const bg=coverBaseSize(this.image.naturalWidth,this.image.naturalHeight,w,h,'fill');ctx.save();ctx.filter='blur(24px) brightness(0.45)';ctx.drawImage(this.image,(w-bg.width)/2-30,(h-bg.height)/2-30,bg.width+60,bg.height+60);ctx.restore();}ctx.drawImage(this.image,dx*sx,dy*sy,dw*sx,dh*sy);return canvas;
    }
    toDataURL(type='image/webp',quality=.86){return this.toCanvas().toDataURL(type,clamp(quality,.2,1));}
    destroy(){try{this.resizeObserver?.disconnect();}catch{}if(this.raf){try{(root.cancelAnimationFrame||clearTimeout)(this.raf);}catch{}}this.mount.replaceChildren();}
  }

  root.GICropMath={clamp,coverBaseSize,scaleFromDistance,scaleFromCorner,normalizedTranslation,denormalizedTranslation,cornerSigns};
  root.GameIndexCropEditor=GameIndexCropEditor;
})(globalThis);

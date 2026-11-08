(function(){
  // flashlight
  var h=document.getElementById('hero');
  h.addEventListener('pointermove',function(e){
    var r=h.getBoundingClientRect();
    h.style.setProperty('--x',(e.clientX-r.left)+'px');
    h.style.setProperty('--y',(e.clientY-r.top)+'px');
  });

  // wireframe reveal
  var rev=document.getElementById('rev');
  document.getElementById('wg').innerHTML=document.getElementById('rg').innerHTML;
  function setW(p){
    p=Math.max(0,Math.min(100,p));
    rev.style.setProperty('--w',p+'%');
    rev.setAttribute('aria-valuenow',Math.round(p));
  }
  rev.addEventListener('pointermove',function(e){
    var r=rev.getBoundingClientRect();
    setW((e.clientX-r.left)/r.width*100);
  });
  rev.addEventListener('keydown',function(e){
    var v=+rev.getAttribute('aria-valuenow');
    if(e.key==='ArrowLeft'){setW(v-5);e.preventDefault();}
    if(e.key==='ArrowRight'){setW(v+5);e.preventDefault();}
  });

  // sketch viewer
  var desk=document.getElementById('desk'),z=1;
  var cards=Array.prototype.slice.call(desk.querySelectorAll('.card')),cur=0;
  var lb=document.getElementById('lightbox'),stage=document.getElementById('lbStage');
  var cap=document.getElementById('lbCap'),count=document.getElementById('lbCount'),opener=null;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  function fill(c){
    stage.innerHTML='';stage.className='stage';
    var full=c.getAttribute('data-full'),label=c.textContent.trim();
    if(full){
      var im=new Image();im.src=full;im.alt=label;stage.appendChild(im);
    }else{
      var k=(c.className.match(/d\d/)||[''])[0];
      if(k)stage.classList.add(k);
      stage.appendChild(c.querySelector('i').cloneNode(true));
    }
    cap.textContent=label;
    count.textContent=(cards.indexOf(c)+1)+' of '+cards.length;
  }
  function openCard(c){
    opener=c;cur=cards.indexOf(c);
    fill(c);
    var from=c.getBoundingClientRect();
    lb.showModal();
    if(!reduce.matches){
      var to=stage.getBoundingClientRect();
      var s=from.width/to.width;
      var dx=(from.left+from.width/2)-(to.left+to.width/2);
      var dy=(from.top+from.height/2)-(to.top+to.height/2);
      stage.animate(
        [{transform:'translate('+dx+'px,'+dy+'px) scale('+s+') rotate(4deg)'},{transform:'rotate(-1deg)'}],
        {duration:340,easing:'cubic-bezier(.2,.8,.2,1)'}
      );
    }
  }
  function step(dir){
    cur=(cur+dir+cards.length)%cards.length;
    opener=cards[cur];
    fill(opener);
    if(!reduce.matches){
      stage.animate(
        [{opacity:0,transform:'translateX('+(dir*40)+'px) rotate(-1deg)'},{opacity:1,transform:'rotate(-1deg)'}],
        {duration:220,easing:'ease-out'}
      );
    }
  }
  lb.addEventListener('click',function(e){
    var t=e.target;
    if(t===lb||t.classList.contains('close'))lb.close();
    else if(t.classList.contains('prev'))step(-1);
    else if(t.classList.contains('next'))step(1);
  });
  lb.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
    if(e.key==='ArrowRight'){e.preventDefault();step(1);}
  });
  lb.addEventListener('close',function(){if(opener)opener.focus();});
  var tx=null;
  lb.addEventListener('pointerdown',function(e){tx=e.clientX;});
  lb.addEventListener('pointerup',function(e){
    if(tx===null)return;
    var d=e.clientX-tx;tx=null;
    if(Math.abs(d)>60)step(d<0?1:-1);
  });

  // draggable sketches (a click without dragging opens the viewer)
  cards.forEach(function(c){
    var ox=0,oy=0,sx=0,sy=0,moved=false;
    function clamp(v,max){return Math.max(0,Math.min(max,v));}
    function put(x,y){
      c.style.left=clamp(x,desk.clientWidth-c.offsetWidth)+'px';
      c.style.top=clamp(y,desk.clientHeight-c.offsetHeight)+'px';
    }
    c.addEventListener('pointerdown',function(e){
      c.setPointerCapture(e.pointerId);
      c.classList.add('drag');c.style.zIndex=++z;
      sx=e.clientX;sy=e.clientY;moved=false;
      ox=e.clientX-c.offsetLeft-desk.getBoundingClientRect().left;
      oy=e.clientY-c.offsetTop-desk.getBoundingClientRect().top;
    });
    c.addEventListener('pointermove',function(e){
      if(!c.classList.contains('drag'))return;
      if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>6)moved=true;
      if(!moved)return;
      var r=desk.getBoundingClientRect();
      put(e.clientX-r.left-ox,e.clientY-r.top-oy);
    });
    c.addEventListener('pointerup',function(){
      var was=c.classList.contains('drag');
      c.classList.remove('drag');
      if(was&&!moved)openCard(c);
    });
    c.addEventListener('pointercancel',function(){c.classList.remove('drag');});
    c.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(c);return;}
      var d={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];
      if(!d)return;
      e.preventDefault();c.style.zIndex=++z;
      put(c.offsetLeft+d[0],c.offsetTop+d[1]);
    });
  });
})();

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

  // draggable sketches
  var desk=document.getElementById('desk'),z=1;
  desk.querySelectorAll('.card').forEach(function(c){
    var ox=0,oy=0;
    function clamp(v,max){return Math.max(0,Math.min(max,v));}
    function put(x,y){
      c.style.left=clamp(x,desk.clientWidth-c.offsetWidth)+'px';
      c.style.top=clamp(y,desk.clientHeight-c.offsetHeight)+'px';
    }
    c.addEventListener('pointerdown',function(e){
      c.setPointerCapture(e.pointerId);
      c.classList.add('drag');c.style.zIndex=++z;
      ox=e.clientX-c.offsetLeft-desk.getBoundingClientRect().left;
      oy=e.clientY-c.offsetTop-desk.getBoundingClientRect().top;
    });
    c.addEventListener('pointermove',function(e){
      if(!c.classList.contains('drag'))return;
      var r=desk.getBoundingClientRect();
      put(e.clientX-r.left-ox,e.clientY-r.top-oy);
    });
    function up(){c.classList.remove('drag');}
    c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
    c.addEventListener('keydown',function(e){
      var d={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];
      if(!d)return;
      e.preventDefault();c.style.zIndex=++z;
      put(c.offsetLeft+d[0],c.offsetTop+d[1]);
    });
  });
})();

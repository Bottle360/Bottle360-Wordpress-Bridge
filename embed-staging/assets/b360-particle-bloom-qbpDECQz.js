var e=[`u_time`,`u_trigger`,`u_resolution`,`u_origin`,`u_spiral`,`u_turbulence`,`u_gravity`,`u_shimmer`,`u_sharpness`],t=class t{static{this.DEFAULTS={origin:null,color:`#3a4f3b`,count:2500,spread:350,spiral:3,turbulence:30,gravity:15,sizeMin:1,sizeMax:7,shimmer:8,lifespan:2,sharpness:1,blend:`normal`,zIndex:1e4,paletteStops:6}}static{this._FLOATS_PER=10}static{this._STRIDE=t._FLOATS_PER*4}constructor(e={}){this._canvas=null,this._gl=null,this._prog=null,this._gpuBuf=null,this._palette=[],this._attrs=[],this._attrLocs={},this._u={},this._raf=null,this._animating=!1,this._triggerTime=0,this._disposed=!1,this._cfg={...t.DEFAULTS,...e},this._onResize=this._resize.bind(this),this._initCanvas(),this._initGL(),this._palette=t._generatePalette(this._cfg.color,this._cfg.paletteStops),this._buildBuffers()}fire(){this._disposed||t._prefersReducedMotion()||(this._triggerTime=performance.now()/1e3,this._animating=!0,this._rebuildParticles(),this._raf||this._loop())}static _prefersReducedMotion(){if(typeof window>`u`||typeof window.matchMedia!=`function`)return!1;try{return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}catch{return!1}}dispose(){this._disposed=!0,this._animating=!1,this._raf!==null&&(cancelAnimationFrame(this._raf),this._raf=null),window.removeEventListener(`resize`,this._onResize);let e=this._gl;if(e){this._gpuBuf&&e.deleteBuffer(this._gpuBuf),this._prog&&e.deleteProgram(this._prog);let t=e.getExtension(`WEBGL_lose_context`);t&&t.loseContext()}this._canvas&&this._canvas.parentNode&&this._canvas.parentNode.removeChild(this._canvas),this._canvas=null,this._gl=null,this._prog=null,this._gpuBuf=null}_initCanvas(){let e=document.createElement(`canvas`);e.style.cssText=`
      position:fixed; top:0; left:0; width:100vw; height:100vh;
      pointer-events:none; z-index:${this._cfg.zIndex};
    `,document.body.appendChild(e),this._canvas=e,window.addEventListener(`resize`,this._onResize),this._resize()}_resize(){let e=this._canvas;if(!e)return;let t=window.devicePixelRatio||1;e.width=window.innerWidth*t,e.height=window.innerHeight*t,this._gl&&this._gl.viewport(0,0,e.width,e.height)}_initGL(){if(!this._canvas)throw Error(`ParticleBloom: canvas missing`);let n=this._canvas.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!1,antialias:!0});if(!n)throw Error(`ParticleBloom: WebGL not supported`);this._gl=n;let r=this._compileShader(n.VERTEX_SHADER,t._VERT),i=this._compileShader(n.FRAGMENT_SHADER,t._FRAG),a=n.createProgram();if(!a)throw Error(`ParticleBloom: failed to create program`);if(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),!n.getProgramParameter(a,n.LINK_STATUS))throw Error(`ParticleBloom: shader link failed: `+n.getProgramInfoLog(a));n.deleteShader(r),n.deleteShader(i),this._prog=a,this._u={};for(let t of e)this._u[t]=n.getUniformLocation(a,t);this._attrs=[{name:`a_velocity`,size:3,offset:0},{name:`a_color`,size:4,offset:12},{name:`a_size`,size:1,offset:28},{name:`a_life`,size:1,offset:32},{name:`a_seed`,size:1,offset:36}],this._attrLocs={};for(let e of this._attrs)this._attrLocs[e.name]=n.getAttribLocation(a,e.name);n.enable(n.BLEND),this._applyBlend()}_compileShader(e,t){let n=this._gl;if(!n)throw Error(`ParticleBloom: GL not ready`);let r=n.createShader(e);if(!r)throw Error(`ParticleBloom: failed to create shader`);if(n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS)){let e=n.getShaderInfoLog(r);throw n.deleteShader(r),Error(`ParticleBloom: shader compile failed: `+e)}return r}_applyBlend(){let e=this._gl;if(!e)return;let t={normal:[e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA],additive:[e.SRC_ALPHA,e.ONE],soft:[e.ONE,e.ONE_MINUS_SRC_ALPHA]},n=t[this._cfg.blend]??t.normal;e.blendFunc(n[0],n[1])}static _generatePalette(e,n){let{h:r,s:i}=t._hexToHSL(e),a=[],o=.12;for(let e=0;e<n;e++){let s=n===1?.5:e/(n-1),c=o+s*(.92-o),l=i*(1-s*.35),u=s<.7?1:1-(s-.7)/.3*.35,d=t._hslToRGB(r,l,c);a.push([d.r,d.g,d.b,u])}return a}_buildBuffers(){let e=this._gl;e&&(this._gpuBuf=e.createBuffer(),this._rebuildParticles())}_rebuildParticles(){let e=this._gl;if(!e||!this._gpuBuf)return;let n=this._cfg,r=this._palette,i=n.count,a=t._FLOATS_PER,o=new Float32Array(i*a);for(let e=0;e<i;e++){let t=e*a,i=Math.random(),s=Math.random()*Math.PI*2,c=Math.random(),l=60+c*n.spread+Math.random()*80;o[t+0]=Math.cos(s)*l,o[t+1]=Math.sin(s)*l,o[t+2]=0;let u=r[Math.floor(Math.random()*r.length)],d=.02;o[t+3]=Math.min(1,Math.max(0,u[0]+(Math.random()-.5)*d)),o[t+4]=Math.min(1,Math.max(0,u[1]+(Math.random()-.5)*d)),o[t+5]=Math.min(1,Math.max(0,u[2]+(Math.random()-.5)*d)),o[t+6]=u[3];let f=Math.random()<.45;o[t+7]=f?n.sizeMin+Math.random()*(n.sizeMin*1.5):n.sizeMin+Math.random()*n.sizeMax,o[t+8]=n.lifespan*.6+Math.random()*n.lifespan+c*n.lifespan*.5,o[t+9]=i}e.bindBuffer(e.ARRAY_BUFFER,this._gpuBuf),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW);let s=t._STRIDE;for(let t of this._attrs){let n=this._attrLocs[t.name];n<0||(e.enableVertexAttribArray(n),e.vertexAttribPointer(n,t.size,e.FLOAT,!1,s,t.offset))}}_resolveOrigin(){let e=this._cfg.origin,t={x:window.innerWidth/2,y:window.innerHeight/2};if(!e)return t;if(typeof e==`string`){let n=document.querySelector(e);if(n){let e=n.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}return t}if(e instanceof Element){let t=e.getBoundingClientRect();return{x:t.left+t.width/2,y:t.top+t.height/2}}return typeof e.x==`number`&&typeof e.y==`number`?{x:e.x,y:e.y}:t}_loop(){if(this._disposed)return;let e=this._gl,n=this._cfg,r=this._canvas,i=this._prog;if(!e||!r||!i||!this._gpuBuf)return;let a=performance.now()/1e3;if(e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),this._animating){let o=window.devicePixelRatio||1;e.useProgram(i),e.uniform1f(this._u.u_time??null,a),e.uniform1f(this._u.u_trigger??null,this._triggerTime),e.uniform2f(this._u.u_resolution??null,r.width/o,r.height/o),e.uniform1f(this._u.u_spiral??null,n.spiral),e.uniform1f(this._u.u_turbulence??null,n.turbulence),e.uniform1f(this._u.u_gravity??null,n.gravity),e.uniform1f(this._u.u_shimmer??null,n.shimmer),e.uniform1f(this._u.u_sharpness??null,n.sharpness);let s=this._resolveOrigin();e.uniform2f(this._u.u_origin??null,s.x,s.y),e.bindBuffer(e.ARRAY_BUFFER,this._gpuBuf);let c=t._STRIDE;for(let t of this._attrs){let n=this._attrLocs[t.name];n<0||e.vertexAttribPointer(n,t.size,e.FLOAT,!1,c,t.offset)}e.drawArrays(e.POINTS,0,n.count);let l=n.lifespan*2.1+n.lifespan*.5;if(a-this._triggerTime>l+.5){this._animating=!1,e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),this._raf=null;return}}this._raf=requestAnimationFrame(()=>this._loop())}static _hexToHSL(e){let t=e.replace(`#`,``);t.length===3&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]);let n=parseInt(t.substr(0,2),16)/255,r=parseInt(t.substr(2,2),16)/255,i=parseInt(t.substr(4,2),16)/255,a=Math.max(n,r,i),o=Math.min(n,r,i),s=(a+o)/2,c=0,l=0;if(a!==o){let e=a-o;l=s>.5?e/(2-a-o):e/(a+o),c=a===n?((r-i)/e+(r<i?6:0))/6:a===r?((i-n)/e+2)/6:((n-r)/e+4)/6}return{h:c,s:l,l:s}}static _hslToRGB(e,t,n){let r,i,a;if(t===0)r=i=a=n;else{let o=(e,t,n)=>(n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*(2/3-n)*6:e),s=n<.5?n*(1+t):n+t-n*t,c=2*n-s;r=o(c,s,e+1/3),i=o(c,s,e),a=o(c,s,e-1/3)}return{r,g:i,b:a}}static{this._VERT=`
    attribute vec3 a_velocity;
    attribute vec4 a_color;
    attribute float a_size;
    attribute float a_life;
    attribute float a_seed;

    uniform float u_time;
    uniform float u_trigger;
    uniform vec2 u_resolution;
    uniform vec2 u_origin;
    uniform float u_spiral;
    uniform float u_turbulence;
    uniform float u_gravity;
    uniform float u_shimmer;

    varying vec4 v_color;

    void main() {
      float age = u_time - u_trigger;
      float t = clamp(age / a_life, 0.0, 1.0);
      float ease = 1.0 - pow(1.0 - t, 3.0);

      float spiral = a_seed * 6.2831;
      float radius = ease * length(a_velocity.xy) * 1.2;
      float angle = spiral + ease * (2.0 + a_seed * u_spiral);

      float turbX = sin(age * 1.5 + a_seed * 20.0) * u_turbulence * ease;
      float turbY = cos(age * 1.8 + a_seed * 15.0) * u_turbulence * 0.66 * ease;

      vec2 pos = u_origin + vec2(
        cos(angle) * radius + a_velocity.x * ease * 0.6 + turbX,
        sin(angle) * radius + a_velocity.y * ease * 0.6 + turbY - age * u_gravity * a_seed
      );

      float alpha = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.45, 1.0, t));
      alpha *= a_color.a;

      float shimmerVal = 0.7 + 0.3 * sin(age * u_shimmer + a_seed * 40.0);
      alpha *= shimmerVal;

      v_color = vec4(a_color.rgb, alpha);

      float sizeMult = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.6, 1.0, t));
      float finalSize = a_size * sizeMult * (0.8 + 0.4 * shimmerVal);

      vec2 ndc = (pos / u_resolution) * 2.0 - 1.0;
      ndc.y *= -1.0;
      gl_Position = vec4(ndc, 0.0, 1.0);
      gl_PointSize = finalSize;
    }
  `}static{this._FRAG=`
    precision mediump float;
    varying vec4 v_color;

    uniform float u_sharpness;

    float hash(vec2 p) {
      float h = dot(p, vec2(127.1, 311.7));
      return fract(sin(h) * 43758.5453123);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec2 pc = gl_PointCoord - 0.5;
      float dist = length(pc);

      float innerEdge = mix(0.0, 0.46, u_sharpness);
      float outerEdge = 0.5;

      float core = smoothstep(outerEdge, innerEdge, dist);

      float noiseAmt = mix(0.0, 0.15, u_sharpness);
      float n = vnoise(gl_PointCoord * 6.0 + vec2(hash(pc * 100.0)));
      float edgeZone = smoothstep(innerEdge * 0.7, outerEdge, dist);
      core -= edgeZone * n * noiseAmt;
      core = clamp(core, 0.0, 1.0);

      float glow = smoothstep(0.5, 0.0, dist) * mix(0.25, 0.08, u_sharpness);

      float alpha = (core + glow) * v_color.a;

      vec3 col = v_color.rgb + v_color.rgb * 0.15 * smoothstep(0.3, 0.0, dist);

      if (alpha < 0.005) discard;
      gl_FragColor = vec4(col, alpha);
    }
  `}};export{t};
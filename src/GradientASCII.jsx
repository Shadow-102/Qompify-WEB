import { useEffect, useRef } from 'react';
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uR,uM;uniform float uT,uN,uCell,uL;uniform vec3 uC[4];uniform sampler2D uA;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 px=gl_FragCoord.xy;vec2 cell=floor(px/uCell);vec2 f=fract(px/uCell);
  vec2 uv=(cell+.5)*uCell/uR;float asp=uR.x/uR.y;
  float w=.05*sin(uv.x*5.+uT*.4)+.03*sin(uv.x*11.-uT*.7);
  float d=uv.y-(.30+w);
  float v=d>0.?.9*exp(-d*3.6):.28*exp(d*2.5)*(.6+.4*sin(uv.x*90.+d*60.));
  vec2 sp=(uv-vec2(.5+.18*sin(uT*.15),.30))*vec2(asp,1.);
  v+=.55*exp(-dot(sp,sp)*14.);
  float near=1.-smoothstep(0.,10.,length((px-uM)/uCell));
  v=clamp(v+near*.35,0.,1.);
  float t=clamp(uv.x*.75+uv.y*.5+.15*sin(uT*.2),0.,1.)*3.;
  vec3 c=mix(mix(mix(uC[0],uC[1],smoothstep(0.,1.,t)),uC[2],smoothstep(1.,2.,t)),uC[3],smoothstep(2.,3.,t));
  float idx=floor(v*(uN-.01));
  if(h(cell+7.)<near)idx=floor(h(cell+floor(uT*10.))*uN);
  float a=texture2D(uA,vec2((idx+f.x)/uN,f.y)).a;
  float y=uv.y;
  vec3 dk=mix(vec3(.059,.071,.110),vec3(.086,.086,.118),smoothstep(1.,.5,y));
  dk=mix(dk,vec3(.067,.157,.235),smoothstep(.5,.14,y));
  dk=mix(dk,vec3(.165,.373,.502),smoothstep(.14,0.,y));
  vec3 bg=uL>.5?vec3(.95,.92,.87):dk;
  vec3 ink=uL>.5?c*.75:c;
  vec3 col=bg+c*v*.07*(uL>.5?-1.:1.);
  col=mix(col,ink*(.55+v*.6),a*clamp(.2+v*1.3,0.,1.));
  gl_FragColor=vec4(col,1.);
}`;
const rgb = h => { const n = parseInt(h.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

export default function GradientASCII({ colors = ['#3B66F5', '#F3EBDD', '#4A75FF', '#1E3FD8'], shape = 'horizon', characters = ' =+xX0S8#@', lightMode = false, cellSize = 14, speed = 1, className = '', style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, gl = cv.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const chars = [...characters], at = document.createElement('canvas');
    at.width = chars.length * 32; at.height = 32;
    const cx = at.getContext('2d');
    cx.fillStyle = '#fff'; cx.font = 'bold 26px monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    chars.forEach((c, i) => cx.fillText(c, i * 32 + 16, 17));
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, at);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    const U = n => gl.getUniformLocation(pr, n);
    const cs = [...colors]; while (cs.length < 4) cs.push(cs[cs.length - 1]);
    gl.uniform3fv(U('uC[0]'), new Float32Array(cs.slice(0, 4).flatMap(rgb)));
    gl.uniform1f(U('uN'), chars.length); gl.uniform1f(U('uL'), lightMode ? 1 : 0); gl.uniform1i(U('uA'), 0);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let m = [-1e4, -1e4], raf;
    const draw = t => {
      gl.uniform1f(U('uT'), (t / 1000) * speed); gl.uniform2f(U('uM'), m[0], m[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) raf = requestAnimationFrame(draw);
    };
    const size = () => {
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('uR'), cv.width, cv.height); gl.uniform1f(U('uCell'), cellSize * dpr);
      if (still) draw(4000);
    };
    const mv = e => { m = [e.clientX * dpr, (innerHeight - e.clientY) * dpr]; };
    size(); addEventListener('resize', size); addEventListener('pointermove', mv);
    if (!still) raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', mv); };
  }, [colors.join(), characters, lightMode, shape, cellSize, speed]);
  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}

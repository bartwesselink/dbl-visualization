/** @author Roan Hofland */
export const fillcircleFragmentSource = `
    uniform lowp float radius;

    varying lowp vec2 vpos;
    varying lowp float rad;
    varying lowp vec2 center;
    
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
      if(vpos.x * vpos.x * 3.1604938271604938271604938271605 + vpos.y * vpos.y <= radius * radius){
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    }
    `;
/** @end-author Roan Hofland */     

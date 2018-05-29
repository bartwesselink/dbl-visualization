/** @author Roan Hofland */
export const fillcircleFragmentSource = `
    varying lowp vec2 vpos;
    varying lowp float rad;
    varying lowp vec2 center;
    
    void main() {
      if(vpos.x * vpos.x * 3.1604938271604938271604938271605 + vpos.y * vpos.y > 0.25){
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    }
    `;
/** @end-author Roan Hofland */     

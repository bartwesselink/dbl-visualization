/** @author Roan Hofland */
export const vertexSource = `
    attribute vec4 pos;
    
    uniform mat4 modelviewMatrix;
  
    varying lowp vec2 vpos;
    
    void main() {
        vec4 p = modelviewMatrix * pos;
        gl_Position = p;
        vpos = p.xy;
    }
  `;
/** @end-author Roan Hofland */  
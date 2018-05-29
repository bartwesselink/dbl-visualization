/** @author Roan Hofland */
export const circleVertexSource = `
    attribute vec4 pos;
    
    uniform mat4 modelviewMatrix;
    uniform vec3 color;
  
    varying lowp vec2 vpos;
    
    void main() {
        vec4 p = modelviewMatrix * pos;
        gl_Position = p;
        vpos = p.xy;
    }
  `;
/** @end-author Roan Hofland */  
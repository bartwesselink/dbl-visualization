/** @author Roan Hofland */
export const vertexSource = `
    attribute vec4 pos;
    
    uniform mat4 modelviewMatrix;
      
    void main() {
        gl_Position = modelviewMatrix * pos;
    }
`;
/** @end-author Roan Hofland */  
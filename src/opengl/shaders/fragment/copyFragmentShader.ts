/** @author Roan Hofland */
export const fragmentSource = `
    uniform lowp vec3 color;
    
    void main() {
        gl_FragColor = vec4(color, 1.0);
    }
`;
/** @end-author Roan Hofland */     

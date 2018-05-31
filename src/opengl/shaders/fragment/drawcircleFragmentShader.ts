/** @author Roan Hofland */
export const fragmentSource = `
    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;
    uniform lowp float width;

    varying lowp vec2 vpos;
    
    void main() {
        lowp float val = radius * radius - pow(vpos.x - cx, 2.0) * 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272 - pow(vpos.y - cy, 2.0);
        if(val >= 0.0 && val <= width){
            gl_FragColor = vec4(color, 1.0);
        }else{
            discard;
        }
    }
`;
/** @end-author Roan Hofland */     

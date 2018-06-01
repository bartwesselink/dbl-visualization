/** @author Roan Hofland */
export const fragmentSource = `
    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;
    uniform lowp float start;
    uniform lowp float end;

    varying lowp vec2 vpos;
    
    void main() {
        lowp float dx = (vpos.x - cx) * 1.7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777778;
        lowp float dy = vpos.y - cy;
        lowp float val = sqrt(pow(dx, 2.0) + pow(dy, 2.0));
        lowp float angle = atan(dy, dx);
        if(val <= radius && angle >= start && angle <= end){
            gl_FragColor = vec4(color, 1.0);
        }
    }
`;
/** @end-author Roan Hofland */     

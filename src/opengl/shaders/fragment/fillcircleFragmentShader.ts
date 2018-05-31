/** @author Roan Hofland */
export const fragmentSource = `
    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;

    varying lowp vec2 vpos;
    
    void main() {
        lowp float val = sqrt(pow(vpos.x - cx, 2.0) * 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272 + pow(vpos.y - cy, 2.0)) + 0.005;
        if(val <= radius + 0.005){
            gl_FragColor = vec4(color, 1.0 - pow(200.0 * abs(radius - val), 1.5));
        }else{
            discard;
        }
    }
`;
/** @end-author Roan Hofland */     

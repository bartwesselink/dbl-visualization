/** @author Roan Hofland */
export const fragmentSource = `
    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;

    varying lowp vec2 vpos;
    
    void main() {
        lowp float val = sqrt(pow(vpos.x - cx, 2.0) * 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272 + pow(vpos.y - cy, 2.0));
        if(val <= radius + 0.0025 && val >= radius - 0.0025){
            gl_FragColor = vec4(color, 1.0 - 400.0 * abs(radius - val));
        }
    }
`;
/** @end-author Roan Hofland */     

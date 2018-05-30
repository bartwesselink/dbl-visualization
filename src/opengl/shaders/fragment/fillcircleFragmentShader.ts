/** @author Roan Hofland */
export const fillcircleFragmentSource = `
    uniform lowp float radius;
    uniform lowp float cx;
    uniform lowp float cy;
    uniform lowp vec3 color;

    varying lowp vec2 vpos;
    
    void main() {
        if(pow(vpos.x - cx, 2.0) * 3.1604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938271604938272 + pow(vpos.y - cy, 2.0) <= radius * radius){
            gl_FragColor = vec4(color, 1.0);
        }else{
            discard;
        }
    }
    `;
/** @end-author Roan Hofland */     

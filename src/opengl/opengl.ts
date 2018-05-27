/** @author Roan Hofland */
import {Element} from "./element";
import {Matrix} from "./matrix";
import {Mode} from "./mode";

export class OpenGL{
    private gl: WebGLRenderingContext;
    private modelviewMatrix;
    private arrays: Element[] = [];
    private readonly WIDTH = 1600;
    private readonly HEIGHT = 900;
    private readonly HALFWIDTH = this.WIDTH / 2;
    private readonly HALFHEIGHT = this.HEIGHT / 2;
    private readonly PRECISION = 10;
    private readonly SIZETHRESHOLD = 0.5;
    private mode: Mode;
    private factor: number = 1;
    private dx: number = 0;
    private dy: number = 0;
    private rotation: number = 0;
    private width: number;
    private height: number;
    private colorUniform: WebGLUniformLocation;
    private shader: WebGLProgram;
    private shaderAttribPosition: number;

    constructor(gl: WebGLRenderingContext){
        this.gl = gl;
        
        //set the canvas background color to white
        this.setBackgroundColor(1.0, 1.0, 1.0);
        
        this.modelviewMatrix = Matrix.createMatrix();
        
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);

        this.initShaders();

        this.gl.useProgram(this.shader);
        this.colorUniform = this.gl.getUniformLocation(this.shader, "color")

        console.log("[OpenGL] OpenGL version: " + this.gl.getParameter(gl.VERSION));
        console.log("[OpenGL] GLSL version: " + this.gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    }
    
    //gets the visible canvas width in imaginary OpenGL space
    public getWidth(canvasheight: number, canvaswidth: number): number{
        if(this.mode == Mode.WIDTH_FIRST){
            return this.WIDTH / this.factor;
        }else{
            return (this.WIDTH * (canvasheight / canvaswidth)) / this.factor;
        }
    }
    
    //gets the visible canvas height in imaginary OpenGL space
    public getHeight(canvasheight: number, canvaswidth: number): number{
        if(this.mode == Mode.HEIGHT_FIRST){
            return this.HEIGHT / this.factor;
        }else{
            return (this.HEIGHT * (canvaswidth / canvasheight)) / this.factor;
        }
    }
    
    //test for a dedicated GPU
    public isDedicatedGPU(): boolean {
        var info = this.gl.getExtension("WEBGL_debug_renderer_info");
        var name = this.gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
        console.log("[OpenGL] Detected renderer: " + name);
        if(name.indexOf("NVIDIA") != -1){
            return true;   
        }else if(name.indexOf("Radeon") != -1){
            if(name.match(".*Radeon (HD ....M|R(5|7|9) M...|Pro).*")){//Radeon HD Mobile, R5/R7/R9 Mobile and RX and Pro
                return false;
            }else if(name.indexOf("Mobility") != -1){
                return false;
            }else{
                return true;
            }
        }else if(name.indexOf("FirePro") != -1){
            if(name.indexOf("FirePro M") != -1){
                return false;
            }else{
                return true;
            }
        }else if(name.indexOf("FireGL") != -1){
            if(name.indexOf("Mobility") != -1){
                return false;
            }else{
                return true;
            }
        }else if(name.indexOf("FireMV") != -1){
            return true;
        }else{//note: no support for the AMD Wonder, Rage and Mach series since they are simply too old (<2000)
            return false;   
        }
    }
    
    //sets the background clear color
    public setBackgroundColor(r: number, g: number, b: number): void {
        this.gl.clearColor(r, g, b, 1.0);
    }
    
    //return the rotation
    public getRotation(): number {
        return this.rotation;
    }
    
    //return the zoom level
    public getZoom(): number {
        return this.factor;    
    }
    
    //reset scale, rotation and translations
    public resetTransformations(): void {
        this.resetTranslation();
        this.resetZoom();
        this.resetRotation();
    }
    
    //reset all scalings
    public resetZoom(): void {
        this.scale(1 / this.factor);
    }
    
    //reset all rotations
    public resetRotation(): void {
        this.rotate(-this.rotation);
    }
    
    //reset all translations
    public resetTranslation(): void {
        Matrix.translateSelf(this.modelviewMatrix, [-this.dx, -this.dy, 0]);
        this.dx = 0;
        this.dy = 0;
    }

    //rotate the model view by the given number of degrees
    public rotate(rotation: number): void {
        Matrix.translateSelf(this.modelviewMatrix, [-this.dx, -this.dy, 0]);
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DInconsistentScalingMatrix(this.HALFHEIGHT, this.HALFWIDTH));
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DRotationMatrix4(rotation));
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DInconsistentScalingMatrix(1 / this.HALFHEIGHT, 1 / this.HALFWIDTH));
        Matrix.translateSelf(this.modelviewMatrix, [this.dx, this.dy, 0]); 
        this.rotation += rotation;
    }
    
    //translates the model view by the given distance
    public translate(dx: number, dy: number): void {
        var vec = Matrix.rotateVector2D([0, 0], [dx, dy], -this.rotation);
        dx = vec[0];
        dy = vec[1];
        var w;
        var h;
        if(this.mode == Mode.WIDTH_FIRST){
            h = (this.width / this.WIDTH) * this.HEIGHT;
            w = this.width;
        }else{
            w = (this.height / this.HEIGHT) * this.WIDTH;
            h = this.height;
        }
        dx = ((dx / w) * 2) / this.factor;
        dy = ((-dy / h) * 2) / this.factor;
        Matrix.translateSelf(this.modelviewMatrix, [dx, dy, 0]);
        this.dx += dx;
        this.dy += dy;
    }
    
    //scales the model view by the given factor
    public scale(factor: number): void {
        Matrix.translateSelf(this.modelviewMatrix, [-this.dx, -this.dy, 0]);
        Matrix.multiply4(this.modelviewMatrix, this.modelviewMatrix, Matrix.create2DScalingMatrix(factor));
        Matrix.translateSelf(this.modelviewMatrix, [this.dx, this.dy, 0]);
        this.factor *= factor;
    }
    
    //maps a true canvas coordinate to the imaginary OpenGL coordinate system
    public transformPoint(x: number, y: number): number[] {
        var loc = this.transform(x, y);
        loc[0] *= this.HALFWIDTH;
        loc[1] *= this.HALFHEIGHT;
        return loc;
    }
    
    //maps a true canvas coordinate to the true OpenGL coordinate system
    private transform(x: number, y: number): number[] {
        var dx = x - (this.width / 2);
        var dy = y - (this.height / 2);
        var loc = null;
        if(this.mode == Mode.WIDTH_FIRST){
            loc = [((dx / this.width) / this.factor) * this.WIDTH, -(((dy / this.height) * (this.height / (this.width / this.WIDTH))) / this.factor)];
        }else{
            loc = [(((dx / this.width) * (this.width / (this.height / this.HEIGHT))) / this.factor), -((dy / this.height) / this.factor) * this.HEIGHT];
        }
        Matrix.rotateVector2D([0, 0], loc, this.rotation);
        loc[0] = (loc[0] / this.HALFWIDTH) - this.dx;
        loc[1] = (loc[1] / this.HALFHEIGHT) - this.dy;
        return loc;
    }
    
    //resizes the viewport to the optimal size for the new canvas size
    public resize(width: number, height: number): void {
        //maintain the viewport aspect ratio at 16:9 and center the viewport as a 16:9 rectangle in the center of the actual canvas making sure to
        //position the viewport in such a way that it covers the entire canvas
        //by forcing a 16:9 viewport we can make sure that even when the canvas is resized our buffers remain correct so that 
        //the visualisation does not distort. Theoretically we could also recompute all the buffers and map to a new coordinate space.
        this.width = width;
        this.height = height;
        console.log("[OpenGL] Viewport resolution: " + width + "x" + height);
        if((width / this.WIDTH) * this.HEIGHT > height){
            this.mode = Mode.WIDTH_FIRST;
            this.gl.viewport(0, (height - ((width / this.WIDTH) * this.HEIGHT)) / 2, width, (width / this.WIDTH) * this.HEIGHT);
        }else{
            this.mode = Mode.HEIGHT_FIRST;
            this.gl.viewport((width - ((height / this.HEIGHT) * this.WIDTH)) / 2, 0, (height / this.HEIGHT) * this.WIDTH, height);
        }
    }
    
    //render the OpenGL scene
    public render(): void {
        this.clear();
        
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "modelviewMatrix"), false, this.modelviewMatrix);
        
        this.drawBuffers();
    }

    //releases all the OpenGL buffers
    public releaseBuffers(): void {
        while(this.arrays.length > 0){
            var elem = this.arrays.pop();
            this.gl.deleteBuffer(elem.pos);
            this.gl.deleteBuffer(elem.indices);
        }
    }
    
    //draws a partial ellipsoid
    public drawEllipsoidalArc(x: number, y: number, radx: number, rady: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        const pos = [];
        for(var i = start; i <= end; i += precision){
            pos.push((x + radx * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + rady * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
        }
        
        if(end - start > 90){
            this.drawArcImpl(pos, color, x, y, Math.max(radx, rady), 2 * Math.max(radx, rady));
        }else{
            var dcx = ((pos[0] + pos[pos.length - 2]) * this.HALFWIDTH) / 2;
            var dcy = ((pos[1] + pos[pos.length - 1]) * this.HALFHEIGHT) / 2;
            var dist = Math.hypot(pos[0] - dcx, pos[1] - dcy);
            this.drawArcImpl(pos, color, dcx, dcy, dist, 2 * dist);
        }
    }
    
    //draws a partial circle
    public drawCircularArc(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        const pos = [];
        var loc = [x + radius, y];
        var rotation = [9];
        Matrix.multiply(rotation, Matrix.create2DTranslationMatrix([-x, -y]), Matrix.create2DRotationMatrix(precision));
        Matrix.multiply(rotation, rotation, Matrix.create2DTranslationMatrix([x, y]));
        Matrix.rotateVector2D([x, y], loc, start);
        for(var i = start; i < end; i += precision){
            pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
            Matrix.multiplyVector2D(loc, rotation);
        }
        pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
        
        if(end - start > 90){
            this.drawArcImpl(pos, color, x, y, radius, 2 * radius);
        }else{
            var dcx = radius * 0.71 * Math.cos(start + ((end - start) / 2));
            var dcy = radius * 0.71 * Math.sin(start + ((end - start) / 2));
            this.drawArcImpl(pos, color, x + dcx, y + dcy, radius * 0.71, radius * 1.42);
        }
    }
    
    //draws an arc
    private drawArcImpl(pos: number[], color: number[], x: number, y: number, rad: number, span: number): void {
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);

        this.arrays.push({
            pos: positionBuffer,
            color: this.toColor(color),
            mode: this.gl.LINE_STRIP,
            rad: rad,
            x: x,
            y: y,
            span: span,
            length: pos.length / 2
        });
    }
    
    //draws a straight line
    public drawLine(x1: number, y1: number, x2: number, y2: number, color: number[]): void {
        this.drawPolyLine([x1, x2], [y1, y2], color);    
    }
    
    //draws multiple continues lines
    public drawPolyLine(x: number[], y: number[], color: number[]): void {   
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = [x.length + y.length];
        var minx = Number.MAX_SAFE_INTEGER;
        var maxx = -Number.MAX_SAFE_INTEGER;
        var miny = Number.MAX_SAFE_INTEGER;
        var maxy = -Number.MAX_SAFE_INTEGER;
        for(var i = 0; i < x.length; i++){
            pos[i * 2] = x[i] / this.HALFWIDTH;
            pos[i * 2 + 1] = y[i] / this.HALFHEIGHT;
            if(x[i] >= minx){
                if(x[i] > maxx){
                   maxx = x[i];
                }
            }else{
                minx = x[i];
            }
            if(y[i] >= miny){
                if(y[i] > maxy){
                   maxy = y[i];
                }
            }else{
                miny = y[i];
            }
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);

        this.arrays.push({
            pos: positionBuffer,
            color: this.toColor(color),
            mode: this.gl.LINE_STRIP,
            x: (maxx + minx) / 2,
            y: (maxy + miny) / 2,
            rad: Math.hypot(maxx - minx, maxy - miny) / 2,
            span: Math.hypot(maxx - minx, maxy - miny),
            length: x.length
        });
    }
    
    //fill a rotated quad
    public fillRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x - width / 2, y - height / 2,
                               x + width / 2, y - height / 2,
                               Math.hypot(width, height) / 2, Math.min(width, height), rotation, true, false, color, null);
    }
    
     //draw a rotated quad
    public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x + width / 2, y - height / 2,
                               x - width / 2, y - height / 2,
                               Math.hypot(width, height) / 2, Math.min(width, height), rotation, false, true, null, color);
    }
    
     //render a rotated quad
    public fillLinedRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, fillColor: number[], lineColor: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x - width / 2, y - height / 2,
                               x + width / 2, y - height / 2,
                               Math.hypot(width, height) / 2, Math.min(width, height), rotation, true, true, fillColor, lineColor);
    }
    
    //renders a rotated quad
    private renderRotatedQuad(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, size: number, span: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void {
        //a---------b
        //|   x,y   |
        //c---------d
        var center = [x, y];
        var a = Matrix.rotateVector2D(center, [x1, y1], rotation);
        var b = Matrix.rotateVector2D(center, [x2, y2], rotation);
        var c = Matrix.rotateVector2D(center, [x3, y3], rotation);
        var d = Matrix.rotateVector2D(center, [x4, y4], rotation);
        
        this.drawQuadImpl(b[0], b[1],
                          a[0], a[1],
                          d[0], d[1],
                          c[0], c[1],
                          x, y, size, span, fill, line, fillColor, lineColor);
    }
    
    //fill an axis aligned quad
    public fillAAQuad(x: number, y: number, width: number, height: number, color: number[]): void {
        this.drawQuadImpl(x + width, y + height,
                          x,         y + height,
                          x + width, y,
                          x,         y,
                          x + width / 2, y + height / 2, Math.hypot(width, height) / 2, Math.min(width, height), true, false, color, null);
    }
    
    //draw an axis aligned quad
    public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): void {
       this.drawQuadImpl(x + width, y + height,
                         x,         y + height,
                         x,         y,
                         x + width, y,
                         x + width / 2, y + height / 2, Math.hypot(width, height) / 2, Math.min(width, height), false, true, null, color);
    }
    
    //render an axis aligned quad
    public fillLinedAAQuad(x: number, y: number, width: number, height: number, fillColor: number[], lineColor: number[]): void {
        this.drawQuadImpl(x + width, y + height,
                          x,         y + height,
                          x + width, y,
                          x,         y,
                          x + width / 2, y + height / 2, Math.hypot(width, height) / 2, Math.min(width, height), true, true, fillColor, lineColor);
    }
        
    //draw quad implementation
    private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, x: number, y: number, rad: number, span: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void {
        //position
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = [x1 / this.HALFWIDTH,  y1 / this.HALFHEIGHT, 
                     x2 / this.HALFWIDTH,  y2 / this.HALFHEIGHT, 
                     x3 / this.HALFWIDTH,  y3 / this.HALFHEIGHT, 
                     x4 / this.HALFWIDTH,  y4 / this.HALFHEIGHT];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        if(!line){
            this.arrays.push({
                pos: positionBuffer,
                color: this.toColor(fillColor),
                mode: this.gl.TRIANGLE_STRIP,
                rad: rad,
                span: span,
                x: x,
                y: y,
                length: 4
            });
        }else{
            if(lineColor == null){
                lineColor = fillColor;
            }
            
            if(line && fill){
                //indices
                var indicesBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0, 2, 3, 1]), this.gl.STATIC_DRAW);
                
                this.arrays.push({
                    pos: positionBuffer,
                    color: this.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    rad: rad,
                    span: span,
                    x: x,
                    y: y,
                    length: 4,
                    overlay: {
                        pos: positionBuffer,
                        indices: indicesBuffer,
                        color: this.toColor(lineColor),
                        mode: this.gl.LINE_LOOP,
                        length: 4
                    }
                });
            }else{
                this.arrays.push({
                    pos: positionBuffer,
                    color: this.toColor(lineColor),
                    mode: this.gl.LINE_LOOP,
                    rad: rad,
                    span: span,
                    x: x,
                    y: y,
                    length: 4
                });
            }
        }
    }
    
    //draw an ellipsoid         
    public fillEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], precision: number = this.PRECISION): void {
        this.drawEllipsoidImpl(x, y, radx, rady, rotation, true, false, fillColor, null, precision);
    }
    
    //draw an ellipsoid         
    public drawEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, lineColor: number[], precision: number = this.PRECISION): void {
        this.drawEllipsoidImpl(x, y, radx, rady, rotation, false, true, null, lineColor, precision);
    }
          
    //draw an ellipsoid         
    public fillLinedEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.drawEllipsoidImpl(x, y, radx, rady, rotation, true, true, fillColor, lineColor, precision);
    }
    
    //renders an ellipsoid
    private drawEllipsoidImpl(x: number, y: number, radx: number, rady: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        if(fill){
            pos.push(x / this.HALFWIDTH, y / this.HALFHEIGHT);
        }
        var loc = [2];
        for(var i = 0; i <= 360; i += precision){
            loc[0] = x + radx * Math.cos(i * Matrix.oneDeg);
            loc[1] = y + rady * Math.sin(i * Matrix.oneDeg);
            Matrix.rotateVector2D([x, y], loc, rotation);
            pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
        }
            
        this.renderEllipsoidImpl(pos, x, y, Math.max(radx, rady), 2 * Math.max(radx, rady), fill, line, lineColor, fillColor, 2);
    }
    
    //draws a circle
    public fillCircle(x: number, y: number, radius: number, fillColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleImpl(x, y, radius, true, false, fillColor, null, precision);
    }
            
    //draws a circle
    public drawCircle(x: number, y: number, radius: number, lineColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleImpl(x, y, radius, false, true, null, lineColor, precision);
    }
                    
    //draws a circle
    public fillLinedCircle(x: number, y: number, radius: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleImpl(x, y, radius, true, true, fillColor, lineColor, precision);
    }
    
    //renders a circle
    private drawCircleImpl(x: number, y: number, radius: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        if(fill){
            pos.push(x / this.HALFWIDTH, y / this.HALFHEIGHT);
        }
        var loc = [x + radius, y];
        var rotation = [9];
        Matrix.multiply(rotation, Matrix.create2DTranslationMatrix([-x, -y]), Matrix.create2DRotationMatrix(precision));
        Matrix.multiply(rotation, rotation, Matrix.create2DTranslationMatrix([x, y]));
        for(var i = 0; i <= 360; i += precision){
            Matrix.multiplyVector2D(loc, rotation);
            pos.push(loc[0] / this.HALFWIDTH, loc[1] / this.HALFHEIGHT);
        }
            
        this.renderEllipsoidImpl(pos, x, y, radius, 2 * radius, fill, line, lineColor, fillColor, 2);
    }
    
    //draws a ring slice
    public drawRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        const pos = [];
        for(var i = start; i < end; i += precision){
            pos.push((x + far * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
        }
        pos.push((x + far * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
        for(var i = end; i > start; i -= precision){
            pos.push((x + near * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
        }
        pos.push((x + near * Math.cos(start * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(start * Matrix.oneDeg)) / this.HALFHEIGHT);
            
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        if(end - start > 90){
            this.arrays.push({
                pos: posBuffer,
                color: this.toColor(color),
                mode: this.gl.LINE_LOOP,
                x: x,
                y: y,
                rad: far,
                span: far * 2,
                length: pos.length / 2
            });
        }else{
            var dcx = far * 0.71 * Math.cos(start + ((end - start) / 2));
            var dcy = far * 0.71 * Math.sin(start + ((end - start) / 2));
            this.arrays.push({
                pos: posBuffer,
                color: this.toColor(color),
                mode: this.gl.LINE_LOOP,
                x: x + dcx,
                y: y + dcy,
                rad: far * 0.71,
                span: far * 1.42,
                length: pos.length / 2
            });
        }
    }
    
    //draws a ring slice
    public fillRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        this.fillRingSliceImpl(x, y, near, far, start, end, false, color, null, precision);
    }
    
    //draws a ring slice
    public fillLinedRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.fillRingSliceImpl(x, y, near, far, start, end, true, fillColor, lineColor, precision);
    }
    
    //draws a ring slice
    private fillRingSliceImpl(x: number, y: number, near: number, far: number, start: number, end: number, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        for(var i = start; i < end; i += precision){
            pos.push((x + far * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
            pos.push((x + near * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
        }
        pos.push((x + far * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + far * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
        pos.push((x + near * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + near * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
            
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        if(line){
            if(lineColor == null){
                lineColor = fillColor;
            }
            
            const indices = [pos.length / 2];
            for(var i = 0; i < pos.length / 4; i++){
                indices[i] = i * 2;
                indices[pos.length / 2 - 1 - i] = i * 2 + 1;
            }
        
            var indicesBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), this.gl.STATIC_DRAW);
        
            if(end - start > 90){
                this.arrays.push({
                    pos: posBuffer,
                    color: this.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: pos.length / 2,
                    overlay: {
                        pos: posBuffer,
                        indices: indicesBuffer,
                        color: this.toColor(lineColor),
                        mode: this.gl.LINE_LOOP,
                        length: pos.length / 2
                    }
                });
            }else{
                var dcx = far * 0.71 * Math.cos(start + ((end - start) / 2));
                var dcy = far * 0.71 * Math.sin(start + ((end - start) / 2));
                this.arrays.push({
                    pos: posBuffer,
                    color: this.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x + dcx,
                    y: y + dcy,
                    rad: far * 0.71,
                    span: far * 1.42,
                    length: pos.length / 2,
                    overlay: {
                        pos: posBuffer,
                        indices: indicesBuffer,
                        color: this.toColor(lineColor),
                        mode: this.gl.LINE_LOOP,
                        length: pos.length / 2
                    }
                });
            }
        }else{
            if(end - start > 90){
                this.arrays.push({
                    pos: posBuffer,
                    color: this.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: pos.length / 2
                });
            }else{
                var dcx = far * 0.71 * Math.cos(start + ((end - start) / 2));
                var dcy = far * 0.71 * Math.sin(start + ((end - start) / 2));
                this.arrays.push({
                    pos: posBuffer,
                    color: this.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x + dcx,
                    y: y + dcy,
                    rad: far * 0.71,
                    span: far * 1.42,
                    length: pos.length / 2
                });
            }
        }
    }
    
    //draws a circular slice  
    public drawCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        this.drawCircleSliceImpl(x, y, radius, start, end, false, true, null, color, precision);
    }
    
    //draws a circular slice
    public fillCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): void {
        this.drawCircleSliceImpl(x, y, radius, start, end, true, false, color, null, precision);
    }
    
    //draws a circular slice
    public fillLinedCircleSlice(x: number, y: number, radius: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void {
        this.drawCircleSliceImpl(x, y, radius, start, end, true, true, fillColor, lineColor, precision);
    }
    
    //draws a circular slice
    private drawCircleSliceImpl(x: number, y: number, radius: number, start: number, end: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void {
        const pos = [];
        pos.push(x / this.HALFWIDTH, y / this.HALFHEIGHT);
        for(var i = start; i < end; i += precision){
            pos.push((x + radius * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH, (y + radius * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT);
        }
        pos.push((x + radius * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH, (y + radius * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT);
                
        if(end - start > 90){
            this.renderEllipsoidImpl(pos, x, y, radius, radius * 2, fill, line, lineColor, fillColor, 0);
        }else{
            var dcx = radius * 0.71 * Math.cos(start + ((end - start) / 2));
            var dcy = radius * 0.71 * Math.sin(start + ((end - start) / 2));
            this.renderEllipsoidImpl(pos, x + dcx, y + dcy, radius * 0.71, radius * 1.42, fill, line, lineColor, fillColor, 0);
        }
    }
    
    //draws an ellipsoid
    private renderEllipsoidImpl(pos: number[], x: number, y: number, rad: number, span: number, fill: boolean, line: boolean, lineColor: number[], fillColor: number[], offset: number): void {     
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        if(!(fill && line)){
            this.arrays.push({
                pos: posBuffer,
                color: this.toColor(line ? lineColor : fillColor),
                mode: fill ? this.gl.TRIANGLE_FAN : this.gl.LINE_LOOP,
                x: x,
                y: y,
                rad: rad,
                span: span,
                length: pos.length / 2
            });
        }else{
            if(lineColor == null){
                lineColor = fillColor;
            }

            this.arrays.push({
                pos: posBuffer,
                color: this.toColor(fillColor),
                mode: this.gl.TRIANGLE_FAN,
                x: x,
                y: y,
                rad: rad,
                span: span,
                length: pos.length / 2,
                overlay: {
                    pos: posBuffer,
                    color: this.toColor(lineColor),
                    mode: this.gl.LINE_LOOP,
                    length: pos.length / 2 - offset,
                    offset: offset * 4
                }
            });
        }
    }
    
    //clear the screen
    private clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    
    //draw all the OpenGL buffers
    private drawBuffers(): void {
        var vertices = 0;
        var total = 0;
        for(var i = 0; i < this.arrays.length; i++){
            vertices += this.drawElement(this.arrays[i])
            total += this.arrays[i].overlay == null ? this.arrays[i].length : (this.arrays[i].length + this.arrays[i].overlay.length);
        }
        console.log("[OpenGL] Rendered " + vertices + " out of " + total + " vertices")
    }
    
    private isVisible(elem: Element): boolean {
        if((this.mode == Mode.WIDTH_FIRST && elem.span < ((this.WIDTH / this.factor) / this.width) * this.SIZETHRESHOLD) || (this.mode == Mode.HEIGHT_FIRST && elem.span < ((this.HEIGHT / this.factor) / this.height) * this.SIZETHRESHOLD)){
            return false;
        }else{
            if(this.mode == Mode.WIDTH_FIRST){
                var hh = ((this.WIDTH / this.width) * this.height) / 2;
                if(Math.hypot(elem.x + (this.dx * this.HALFWIDTH), elem.y + (this.dy * this.HALFHEIGHT)) - elem.rad <= Math.hypot(this.HALFWIDTH, hh) / this.factor){
                    return true;
                }else{
                    return false;
                }
            }else{
                var hw = ((this.HEIGHT / this.height) * this.width) / 2;
                if(Math.hypot(elem.x + (this.dx * this.HALFWIDTH), elem.y + (this.dy * this.HALFHEIGHT)) - elem.rad <= Math.hypot(hw, this.HALFHEIGHT) / this.factor){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }

    //renders the given element
    private drawElement(elem: Element): number {
        if(this.isVisible(elem)){
            return this.drawElementImpl(elem);
        }else{
            return 0;
        }
    }
        
    //renders the given element
    private drawElementImpl(elem: Element): number {
        if(elem.pos != null){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.pos);
            this.gl.vertexAttribPointer(this.shaderAttribPosition,              //attribute
                                        2,                                      //2D so two values per iteration: x, y
                                        this.gl.FLOAT,                          //data type is float32
                                        false,                                  //no normalisation
                                        0,                                      //stride = automatic
                                        elem.offset == null ? 0 : elem.offset); //skip
            this.gl.enableVertexAttribArray(this.shaderAttribPosition);
        }
            
        if(elem.color != null){
            this.gl.uniform1f(this.colorUniform, elem.color);
        }
            
        if(elem.indices == null){
            this.gl.drawArrays(elem.mode, 0, elem.length);
        }else{
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, elem.indices);
            this.gl.drawElements(elem.mode, elem.length, this.gl.UNSIGNED_BYTE, 0);
        }
            
        if(elem.overlay != null){
            return this.drawElementImpl(elem.overlay) + elem.length;
        }else{
            return elem.length;
        }
    }

    //creates a color from the given array
    private toColor(array: number[]): number{
        return array[0] * 0x00FF0000 + array[1] * 0x0000FF00 + array[2] * 0x000000FF;
    }

    //initialises the shaders
    private initShaders(): void {
        //ridiculously complicated vertex shader
        //because bit wise operators were on a vacation in GLSL -_-
        const vertexShaderSource = `
          attribute vec4 pos;
        
          uniform mat4 modelviewMatrix;
          uniform float color;
        
          varying lowp vec4 vcolor;
          
          void main() {
              gl_Position = modelviewMatrix * pos;
              float b = mod(color, 256.0) * 0.00390625;
              float g = ((mod(color, 65536.0) * 0.00390625) - b) * 0.00390625;
              vcolor = vec4(((mod(color, 16777216.0) * 0.0000152587890625) - g - (b * 0.00390625)) * 0.00390625, g, b, 1.0);
          }
        `;
      
        //really simple fragment shader that just assigns the color it gets from the vertex shader
        //without transforming it in any way.
        const fragmentShaderSource = `
          varying lowp vec4 vcolor;
        
          void main() {
            gl_FragColor = vcolor;
          }
        `;
        
        //just some generic shader loading
        var fragmentShader;
        var vertexShader;
        {
            const shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(shader, vertexShaderSource);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                var log = this.gl.getShaderInfoLog(shader);
                console.log(log);
                this.gl.deleteShader(shader);
                throw new Error("Vertex shader compilation failed");
            }else{
                vertexShader = shader;
            }
        }
        {
            const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(shader, fragmentShaderSource);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                this.gl.deleteShader(shader);
                throw new Error("Fragment shader compilation failed");
            }else{
                fragmentShader = shader;
            }
        }
        
        //create a program using our vertex and fragment shader and link it
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
            throw new Error("Shader link status wrong");
        }
        
        //Initialise the shader object for use
        this.shader = program,
        this.shaderAttribPosition = this.gl.getAttribLocation(program, "pos")
    }
}
/** @end-author Roan Hofland */     

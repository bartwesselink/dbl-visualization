/** @author Roan Hofland */
import {Element} from "./element";
import {Matrix} from "./matrix";
import {Mode} from "./mode";
import {ShaderMode} from "./shaders/shaderMode";
import {Shader} from "./shaders/shader";
import {CircleElement} from "./shaders/elem/circleElement";
import {CircleSliceElement} from "./shaders/elem/circleSliceElement";
import {RingSliceElement} from "./shaders/elem/ringSliceElement";
import {CircularArcElement} from "./shaders/elem/circularArcElement";
import {environment} from "../environments/environment";

export class OpenGL{
    private gl: WebGLRenderingContext;
    private modelviewMatrix: Float32Array;
    private arrays: Element[] = [];
    public readonly WIDTH = 1600;
    public readonly HEIGHT = 900;
    public readonly HALFWIDTH = this.WIDTH / 2;
    public readonly HALFHEIGHT = this.HEIGHT / 2;
    private readonly PRECISION = 10;
    private sizethreshold = 0.5;
    private static verbose = environment.openglVerbose;
    private mode: Mode;
    private factor: number = 1;
    private dx: number = 0;
    private dy: number = 0;
    private rotation: number = 0;
    private rx: number = 1;
    private ry: number = 0;
    private width: number;
    private height: number;
    private shader: Shader;
    private index: number = 0;
    private indices: number[] = null;
    private id: number = 0;

    constructor(gl: WebGLRenderingContext){
        this.gl = gl;
        this.shader = new Shader(gl, this);

        //set the canvas background color to white
        this.setBackgroundColor(1.0, 1.0, 1.0);

        this.modelviewMatrix = Matrix.createMatrix();

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);

        if(OpenGL.verbose){
            console.log("[OpenGL] OpenGL version: " + this.gl.getParameter(gl.VERSION));
            console.log("[OpenGL] GLSL version: " + this.gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
        }
    }
    
    //toggles verbose mode
    public static setVerbose(verbose: boolean): void {
        OpenGL.verbose = verbose;
    }
    
    //set the size thres hold
    public setSizeThresHold(pixels: number): void{
        this.sizethreshold = pixels;
    }

    //optimises the given shader mode
    public optimizeFor(mode: ShaderMode): void {
        if(this.indices == null){
            this.indices = new Array(this.arrays.length);
            for(let i = 0; i < this.indices.length; i++){
                this.arrays[i].id = i;
            }
        }
        while(this.index < this.arrays.length && this.arrays[this.index].shader == mode){
            this.index++;
        }
        outer: for(var i = this.index + 1; this.index < this.arrays.length; this.index++){
            if(this.arrays[this.index].shader != mode){
                for(i; i < this.arrays.length; i++){
                    if(this.arrays[i].shader == mode){
                        let tmp = this.arrays[this.index];
                        this.arrays[this.index] = this.arrays[i];
                        this.arrays[i] = tmp;
                        continue outer;
                    }
                }
                break;
            }
        }
        for(var i = 0; i < this.arrays.length; i++){
            this.indices[this.arrays[i].id] = i;
        }
    }
    
    //hides the element
    public setHidden(id: number, hide: boolean): void{
        this.getElem(id).hidden = hide;
    }
    
    //set element color
    public setLineColor(id: number, color: number[]): void{
        this.getElem(id).overlay.color = OpenGL.toColor(color);
    }
    
    //set element color
    public setColor(id: number, color: number[]): void{
        this.getElem(id).color = OpenGL.toColor(color);
    }
    
    //copy element color
    public copyColor(original: number, target: number): void{
        this.getElem(target).color = this.getElem(original).color;
    }
    
    //copy element color
    public copyLineColor(original: number, target: number): void{
        this.getElem(target).color = this.getElem(original).color;
    }
    
    //get the referenced element
    private getElem(id: number): Element{
        return this.indices == null ? this.arrays[id - 1] : this.arrays[this.indices[id - 1]];
    }

    //optimize default draw calls
    public optimizeDefault(): void{
        this.optimizeFor(null);
    }

    //gets the modelview matrix
    public getModelviewMatrix(): Float32Array{
        return this.modelviewMatrix;
    }

    //gets the y translation in OpenGL space
    public getDY(): number{
        return this.dy;
    }

    //gets the x translation in OpenGL space
    public getDX(): number{
        return this.dx;
    }

    //gets the y rotation
    public getRY(): number{
        return this.ry;
    }

    //gets the x rotation
    public getRX(): number{
        return this.rx;
    }

    //gets the visible canvas width in imaginary OpenGL space
    public getWidth(): number{
        if(this.mode == Mode.WIDTH_FIRST){
            return this.WIDTH / this.factor;
        }else{
            return (this.WIDTH * (this.height / this.width)) / this.factor;
        }
    }

    //gets the visible canvas height in imaginary OpenGL space
    public getHeight(): number{
        if(this.mode == Mode.HEIGHT_FIRST){
            return this.HEIGHT / this.factor;
        }else{
            return (this.HEIGHT * (this.width / this.height)) / this.factor;
        }
    }

    //test for a dedicated GPU
    public isDedicatedGPU(): boolean {
        var info = this.gl.getExtension("WEBGL_debug_renderer_info");
        var name = this.gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
        if(OpenGL.verbose){
            console.log("[OpenGL] Detected renderer: " + name);
        }
        if(name.indexOf("NVIDIA") != -1){
            return true;
        }else if(name.indexOf("GeForce") != -1){
            return true;
        }else if(name.indexOf("Quadro") != -1){
            return true;
        }else if(name.indexOf("TITAN V") != -1){
            return true;
        }else if(name.indexOf("GPU Accelerator") != -1){
            return true;
        }else if(name.indexOf("NVS") != -1){
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

    //return the translation over the x axis
    public getXTranslation(): number {
        return this.dx * this.HALFWIDTH;
    }

    //return the translation over the y axis
    public getYTranslation(): number {
        return this.dy * this.HALFHEIGHT;
    }

    //reset scale, rotation and translations
    public resetTransformations(): void {
        this.rx = 1;
        this.ry = 0;
        this.dx = 0;
        this.dy = 0;
        this.rotation = 0;
        this.factor = 1;
        this.modelviewMatrix = Matrix.createMatrix();
    }

    //reset all scalings
    public resetZoom(): void {
        this.scale(1 / this.factor);
    }

    //reset all rotations
    public resetRotation(): void {
        this.rotate(-this.rotation);
        this.rx = 1;
        this.ry = 0;
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
        this.rx = Math.cos(-this.rotation * Matrix.oneDeg);
        this.ry = Math.sin(-this.rotation * Matrix.oneDeg);
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

    //translates the model view by the given distance
    public glTranslate(dx: number, dy: number): void {
        dx /= this.HALFWIDTH;
        dy /= this.HALFHEIGHT;
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

    //enables the given shader
    public enableShaders(shader: ShaderMode): void {
        this.shader.enableShader(shader);
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
        if(OpenGL.verbose){
            console.log("[OpenGL] Viewport resolution: " + width + "x" + height);
        }
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
        var start = performance.now();
        this.clear();

        this.shader.prepareRenderPass();

        this.drawBuffers(start);
    }

    //releases all the OpenGL buffers
    public releaseBuffers(): void {
        while(this.arrays.length > 0){
            var elem = this.arrays.pop();
            this.gl.deleteBuffer(elem.pos);
            this.gl.deleteBuffer(elem.indices);
        }
        this.index = 0;
        this.indices = null;
    }

    //draws a partial ellipsoid
    public drawEllipsoidalArc(x: number, y: number, radx: number, rady: number, start: number, end: number, color: number[], precision: number = this.PRECISION): number {
        const pos = new Float32Array(Math.floor((end - start) / precision) * 2 + 2);
        for(var i = 0; end > start + precision * i; i++){
            pos[i * 2] = (x + radx * Math.cos((start + precision * i) * Matrix.oneDeg)) / this.HALFWIDTH
            pos[i * 2 + 1] = (y + rady * Math.sin((start + precision * i) * Matrix.oneDeg)) / this.HALFHEIGHT
        }
        pos[i * 2] = (x + radx * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH
        pos[i * 2 + 1] = (y + rady * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT

        if(end - start > 90){
            return this.drawArcImpl(pos, color, x, y, Math.max(radx, rady), 2 * Math.max(radx, rady));
        }else{
            var dcx = ((pos[0] + pos[pos.length - 2]) * this.HALFWIDTH) / 2;
            var dcy = ((pos[1] + pos[pos.length - 1]) * this.HALFHEIGHT) / 2;
            var dist = Math.hypot(pos[0] - dcx, pos[1] - dcy);
            return this.drawArcImpl(pos, color, dcx, dcy, dist, 2 * dist);
        }
    }

    //draws a partial circle
    public drawCircularArc(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.CIRCULAR_ARC)){
            var positionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
            const pos = new Float32Array(8);

            if(end - start > 90){
                pos[0] = (x + radius * 1.001) / this.HALFWIDTH;
                pos[1] = (y + radius * 1.001) / this.HALFHEIGHT;
                pos[2] = (x - radius * 1.001) / this.HALFWIDTH;
                pos[3] = (y + radius * 1.001) / this.HALFHEIGHT;
                pos[4] = (x + radius * 1.001) / this.HALFWIDTH;
                pos[5] = (y - radius * 1.001) / this.HALFHEIGHT;
                pos[6] = (x - radius * 1.001) / this.HALFWIDTH;
                pos[7] = (y - radius * 1.001) / this.HALFHEIGHT;
                                
                this.arrays.push(<CircularArcElement>{
                    pos: positionBuffer,
                    color: OpenGL.toColor(color),
                    x: x,
                    y: y,
                    rad: radius,
                    span: radius * 2,
                    length: 4,
                    radius: radius / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: ShaderMode.CIRCULAR_ARC
                });
            }else{
                var dcx = radius * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
                var dcy = radius * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);

                pos[0] = (x + dcx + radius * 0.71 * 1.001) / this.HALFWIDTH;
                pos[1] = (y + dcy + radius * 0.71 * 1.001) / this.HALFHEIGHT;
                pos[2] = (x + dcx - radius * 0.71 * 1.001) / this.HALFWIDTH;
                pos[3] = (y + dcy + radius * 0.71 * 1.001) / this.HALFHEIGHT;
                pos[4] = (x + dcx + radius * 0.71 * 1.001) / this.HALFWIDTH;
                pos[5] = (y + dcy - radius * 0.71 * 1.001) / this.HALFHEIGHT;
                pos[6] = (x + dcx - radius * 0.71 * 1.001) / this.HALFWIDTH;
                pos[7] = (y + dcy - radius * 0.71 * 1.001) / this.HALFHEIGHT;
                                
                this.arrays.push(<CircularArcElement>{
                    pos: positionBuffer,
                    color: OpenGL.toColor(color),
                    x: x + dcx,
                    y: y + dcy,
                    cx: x,
                    cy: y,
                    rad: radius * 0.71,
                    span: radius * 1.42,
                    length: 4,
                    radius: radius / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: ShaderMode.CIRCULAR_ARC
                });
            }
            
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);
            
            return this.id++;
        }else{
            const pos = new Float32Array(Math.floor((end - start) / precision) * 2 + 2);
            var loc = [x + radius, y];
            var rotation = new Array(9);
            Matrix.multiply(rotation, Matrix.create2DTranslationMatrix([-x, -y]), Matrix.create2DRotationMatrix(precision));
            Matrix.multiply(rotation, rotation, Matrix.create2DTranslationMatrix([x, y]));
            Matrix.rotateVector2D([x, y], loc, start);
            for(var i = 0; end > start + precision * i; i++){
                pos[i * 2] = loc[0] / this.HALFWIDTH;
                pos[i * 2 + 1] = loc[1] / this.HALFHEIGHT;
                Matrix.multiplyVector2D(loc, rotation);
            }
            pos[i * 2] = loc[0] / this.HALFWIDTH;
            pos[i * 2 + 1] = loc[1] / this.HALFHEIGHT;

            if(end - start > 90){
                return this.drawArcImpl(pos, color, x, y, radius, 2 * radius);
            }else{
                var dcx = radius * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
                var dcy = radius * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);
                return this.drawArcImpl(pos, color, x + dcx, y + dcy, radius * 0.71, radius * 1.42);
            }
        }
    }

    //draws an arc
    private drawArcImpl(pos: Float32Array, color: number[], x: number, y: number, rad: number, span: number): number {
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

        this.arrays.push({
            pos: positionBuffer,
            color: OpenGL.toColor(color),
            mode: this.gl.LINE_STRIP,
            rad: rad,
            x: x,
            y: y,
            span: span,
            length: pos.length / 2
        });
        return this.id++;
    }

    //draws a straight line
    public drawLine(x1: number, y1: number, x2: number, y2: number, color: number[]): number {
        return this.drawPolyLine([x1, x2], [y1, y2], color);    
    }

    //draws multiple continues lines
    public drawPolyLine(x: number[], y: number[], color: number[]): number { 
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = new Float32Array(x.length + y.length);
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
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

        this.arrays.push({
            pos: positionBuffer,
            color: OpenGL.toColor(color),
            mode: this.gl.LINE_STRIP,
            x: (maxx + minx) / 2,
            y: (maxy + miny) / 2,
            rad: Math.hypot(maxx - minx, maxy - miny) / 2,
            span: Math.hypot(maxx - minx, maxy - miny),
            length: x.length
        });
        return this.id++;
    }

    //fill a rotated quad
    public fillRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): number {
        return this.renderRotatedQuad(x,             y,
                                      x - width / 2, y + height / 2,
                                      x + width / 2, y + height / 2,
                                      x - width / 2, y - height / 2,
                                      x + width / 2, y - height / 2,
                                      Math.hypot(width, height) / 2, Math.min(width, height), rotation, true, false, color, null);
    }
    
    //draw a rotated quad
    public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): number {
        return this.renderRotatedQuad(x,             y,
                                      x - width / 2, y + height / 2,
                                      x + width / 2, y + height / 2,
                                      x + width / 2, y - height / 2,
                                      x - width / 2, y - height / 2,
                                      Math.hypot(width, height) / 2, Math.min(width, height), rotation, false, true, null, color);
    }
    
    //render a rotated quad
    public fillLinedRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, fillColor: number[], lineColor: number[]): number {
        return this.renderRotatedQuad(x,             y,
                                      x - width / 2, y + height / 2,
                                      x + width / 2, y + height / 2,
                                      x - width / 2, y - height / 2,
                                      x + width / 2, y - height / 2,
                                      Math.hypot(width, height) / 2, Math.min(width, height), rotation, true, true, fillColor, lineColor);
    }

    //renders a rotated quad
    private renderRotatedQuad(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, size: number, span: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): number {
        //a---------b
        //|   x,y   |
        //c---------d
        var center = [x, y];
        var a = Matrix.rotateVector2D(center, [x1, y1], rotation);
        var b = Matrix.rotateVector2D(center, [x2, y2], rotation);
        var c = Matrix.rotateVector2D(center, [x3, y3], rotation);
        var d = Matrix.rotateVector2D(center, [x4, y4], rotation);
        
        return this.drawQuadImpl(b[0], b[1],
                                 a[0], a[1],
                                 d[0], d[1],
                                 c[0], c[1],
                                 x, y, size, span, fill, line, fillColor, lineColor);
    }

    //fill an axis aligned quad
    public fillAAQuad(x: number, y: number, width: number, height: number, color: number[]): number {
        return this.drawQuadImpl(x + width, y + height,
                                 x,         y + height,
                                 x + width, y,
                                 x,         y,
                                 x + width / 2, y + height / 2, Math.hypot(width, height) / 2, Math.min(width, height), true, false, color, null);
    }

    //draw an axis aligned quad
    public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): number {
       return this.drawQuadImpl(x + width, y + height,
                                x,         y + height,
                                x,         y,
                                x + width, y,
                                x + width / 2, y + height / 2, Math.hypot(width, height) / 2, Math.min(width, height), false, true, null, color);
    }

    //render an axis aligned quad
    public fillLinedAAQuad(x: number, y: number, width: number, height: number, fillColor: number[], lineColor: number[]): number {
        return this.drawQuadImpl(x + width, y + height,
                                 x,         y + height,
                                 x + width, y,
                                 x,         y,
                                 x + width / 2, y + height / 2, Math.hypot(width, height) / 2, Math.min(width, height), true, true, fillColor, lineColor);
    }
        
    //render a custom quad
    public fillCustomQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: number[]): number {
        var cx = (x1 + x2 + x3 + x4) / 4;
        var cy = (y1 + y2 + y3 + y4) / 4;
        var maxy = Math.max(y1, y2, y3, y4);
        var miny = Math.min(y1, y2, y3, y4);
        var maxx = Math.max(x1, x2, x3, x4);
        var minx = Math.min(x1, x2, x3, x4);
        return this.drawQuadImpl(x2, y2,
                                 x1, y1,
                                 x3, y3,
                                 x4, y4,
                                 cx, cy, Math.max(maxx - cx, cx - minx, maxy - cy, cy - miny), Math.max(maxx - minx, maxy - miny), true, false, color, null);
    }
    
    //render a custom quad
    public drawCustomQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: number[]): number {
        var cx = (x1 + x2 + x3 + x4) / 4;
        var cy = (y1 + y2 + y3 + y4) / 4;
        var maxy = Math.max(y1, y2, y3, y4);
        var miny = Math.min(y1, y2, y3, y4);
        var maxx = Math.max(x1, x2, x3, x4);
        var minx = Math.min(x1, x2, x3, x4);
        return this.drawQuadImpl(x2, y2,
                                 x1, y1,
                                 x4, y4,
                                 x3, y3,
                                 cx, cy, Math.max(maxx - cx, cx - minx, maxy - cy, cy - miny), Math.max(maxx - minx, maxy - miny), false, true, null, color);
    }
    
    //render a custom quad
    public fillLinedCustomQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, fillColor: number[], lineColor: number[]): number {
        var cx = (x1 + x2 + x3 + x4) / 4;
        var cy = (y1 + y2 + y3 + y4) / 4;
        var maxy = Math.max(y1, y2, y3, y4);
        var miny = Math.min(y1, y2, y3, y4);
        var maxx = Math.max(x1, x2, x3, x4);
        var minx = Math.min(x1, x2, x3, x4);
        return this.drawQuadImpl(x2, y2,
                                 x1, y1,
                                 x3, y3,
                                 x4, y4,
                                 cx, cy, Math.max(maxx - cx, cx - minx, maxy - cy, cy - miny), Math.max(maxx - minx, maxy - miny), true, true, fillColor, lineColor);
    }
    
    //draw quad implementation
    private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, x: number, y: number, rad: number, span: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): number {
        //position
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = new Float32Array(8);
        pos[0] = x1 / this.HALFWIDTH;
        pos[1] = y1 / this.HALFHEIGHT;
        pos[2] = x2 / this.HALFWIDTH;
        pos[3] = y2 / this.HALFHEIGHT;
        pos[4] = x3 / this.HALFWIDTH;
        pos[5] = y3 / this.HALFHEIGHT;
        pos[6] = x4 / this.HALFWIDTH;
        pos[7] = y4 / this.HALFHEIGHT;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

        if(!line){
            this.arrays.push({
                pos: positionBuffer,
                color: OpenGL.toColor(fillColor),
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
                    color: OpenGL.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    rad: rad,
                    span: span,
                    x: x,
                    y: y,
                    length: 4,
                    overlay: {
                        pos: positionBuffer,
                        indices: indicesBuffer,
                        color: OpenGL.toColor(lineColor),
                        mode: this.gl.LINE_LOOP,
                        length: 4
                    }
                });
            }else{
                this.arrays.push({
                    pos: positionBuffer,
                    color: OpenGL.toColor(lineColor),
                    mode: this.gl.LINE_LOOP,
                    rad: rad,
                    span: span,
                    x: x,
                    y: y,
                    length: 4
                });
            }
        }
        
        return this.id++;
    }
    
    //draw an ellipsoid         
    public fillEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], precision: number = this.PRECISION): number {
        return this.drawEllipsoidImpl(x, y, radx, rady, rotation, true, false, fillColor, null, precision);
    }
    
    //draw an ellipsoid         
    public drawEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, lineColor: number[], precision: number = this.PRECISION): number {
        return this.drawEllipsoidImpl(x, y, radx, rady, rotation, false, true, null, lineColor, precision);
    }
          
    //draw an ellipsoid         
    public fillLinedEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): number {
        return this.drawEllipsoidImpl(x, y, radx, rady, rotation, true, true, fillColor, lineColor, precision);
    }

    //renders an ellipsoid
    private drawEllipsoidImpl(x: number, y: number, radx: number, rady: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): number {
        var pos;
        var i = 0;
        if(fill){
            pos = new Float32Array((360 / precision) * 2 + 4);
            pos[0] = x / this.HALFWIDTH;
            pos[1] = y / this.HALFHEIGHT;
            i++;
        }else{
            pos = new Float32Array((360 / precision) * 2 + 2);
        }
        var loc = new Array(2);
        for(i; i <= 360 / precision + 1; i++){
            loc[0] = x + radx * Math.cos(i * precision * Matrix.oneDeg);
            loc[1] = y + rady * Math.sin(i * precision * Matrix.oneDeg);
            Matrix.rotateVector2D([x, y], loc, rotation);
            pos[i * 2] = loc[0] / this.HALFWIDTH;
            pos[i * 2 + 1] = loc[1] / this.HALFHEIGHT;
        }
            
        return this.renderEllipsoidImpl(pos, x, y, Math.max(radx, rady), 2 * Math.max(radx, rady), fill, line, lineColor, fillColor, 2);
    }

    //draws a circle
    public fillCircle(x: number, y: number, radius: number, fillColor: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.FILL_CIRCLE)){
            return this.shaderCircle(x, y, radius, ShaderMode.FILL_CIRCLE, OpenGL.toColor(fillColor), null);
        }else{
            return this.drawCircleImpl(x, y, radius, true, false, fillColor, null, precision);
        }
    }

    //draws a circle
    public drawCircle(x: number, y: number, radius: number, lineColor: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.DRAW_CIRCLE)){
            return this.shaderCircle(x, y, radius, ShaderMode.DRAW_CIRCLE, OpenGL.toColor(lineColor), null);
        }else{
            return this.drawCircleImpl(x, y, radius, false, true, null, lineColor, precision);
        }
    }

    //draws a circle
    public fillLinedCircle(x: number, y: number, radius: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.LINED_CIRCLE)){
            return this.shaderCircle(x, y, radius, ShaderMode.LINED_CIRCLE, OpenGL.toColor(fillColor), OpenGL.toColor(lineColor));
        }else{
            return this.drawCircleImpl(x, y, radius, true, true, fillColor, lineColor, precision);
        }
    }

    //renders a circle
    private drawCircleImpl(x: number, y: number, radius: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): number {
        var pos;
        var i = 0;
        if(fill){
            pos = new Float32Array((360 / precision) * 2 + 4);
            pos[0] = x / this.HALFWIDTH;
            pos[1] = y / this.HALFHEIGHT;
            i++;
        }else{
            pos = new Float32Array((360 / precision) * 2 + 2);
        }
        var loc = [x + radius, y];
        var rotation = new Array(9);
        Matrix.multiply(rotation, Matrix.create2DTranslationMatrix([-x, -y]), Matrix.create2DRotationMatrix(precision));
        Matrix.multiply(rotation, rotation, Matrix.create2DTranslationMatrix([x, y]));
        for(i; i <= 360 / precision + 1; i++){
            Matrix.multiplyVector2D(loc, rotation);
            pos[i * 2] = loc[0] / this.HALFWIDTH;
            pos[i * 2 + 1] = loc[1] / this.HALFHEIGHT;
        }
            
        return this.renderEllipsoidImpl(pos, x, y, radius, 2 * radius, fill, line, lineColor, fillColor, 2);
    }

    //shader circle buffer subroutine
    private shaderCircle(x: number, y: number, radius: number, mode: ShaderMode, mainColor: Float32Array, extraColor: Float32Array): number {
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = new Float32Array(8);
        pos[0] = (x + radius * 1.001) / this.HALFWIDTH;
        pos[1] = (y + radius * 1.001) / this.HALFHEIGHT;
        pos[2] = (x - radius * 1.001) / this.HALFWIDTH;
        pos[3] = (y + radius * 1.001) / this.HALFHEIGHT;
        pos[4] = (x + radius * 1.001) / this.HALFWIDTH;
        pos[5] = (y - radius * 1.001) / this.HALFHEIGHT;
        pos[6] = (x - radius * 1.001) / this.HALFWIDTH;
        pos[7] = (y - radius * 1.001) / this.HALFHEIGHT;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

        if(mode != ShaderMode.LINED_CIRCLE){
            this.arrays.push(<CircleElement>{
                pos: positionBuffer,
                color: mainColor,
                x: x,
                y: y,
                rad: radius,
                span: radius * 2,
                length: 4,
                radius: radius / this.HALFHEIGHT,
                shader: mode
            });
        }else{
            this.arrays.push(<CircleElement>{
                pos: positionBuffer,
                color: mainColor,
                lineColor: extraColor,
                x: x,
                y: y,
                rad: radius,
                span: radius * 2,
                length: 4,
                radius: radius / this.HALFHEIGHT,
                shader: ShaderMode.LINED_CIRCLE
            });
        }
        
        return this.id++;
    }

    //draws a ring slice
    public drawRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.DRAW_RING_SLICE)){
            return this.shaderRingSlice(x, y, near, far, start, end, OpenGL.toColor(color), null, ShaderMode.DRAW_RING_SLICE);
        }else{
            const pos = new Float32Array(Math.floor((end - start) / precision) * 4 + 4);
            var c = 0;
            for(var i = start; i < end; i += precision){
                pos[c * 2] = (x + far * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH;
                pos[c++ * 2 + 1] = (y + far * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT;
            }
            pos[c * 2] = (x + far * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH;
            pos[c++ * 2 + 1] = (y + far * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT;
            for(var i = end; i > start; i -= precision){
                pos[c * 2] = (x + near * Math.cos(i * Matrix.oneDeg)) / this.HALFWIDTH;
                pos[c++ * 2 + 1] = (y + near * Math.sin(i * Matrix.oneDeg)) / this.HALFHEIGHT;
            }
            pos[c * 2] = (x + near * Math.cos(start * Matrix.oneDeg)) / this.HALFWIDTH;
            pos[c++ * 2 + 1] = (y + near * Math.sin(start * Matrix.oneDeg)) / this.HALFHEIGHT;

            var posBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

            if(end - start > 90){
                this.arrays.push({
                    pos: posBuffer,
                    color: OpenGL.toColor(color),
                    mode: this.gl.LINE_LOOP,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: pos.length / 2
                });
            }else{
                var dcx = far * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
                var dcy = far * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);
                this.arrays.push({
                    pos: posBuffer,
                    color: OpenGL.toColor(color),
                    mode: this.gl.LINE_LOOP,
                    x: x + dcx,
                    y: y + dcy,
                    rad: far * 0.71,
                    span: Math.min(far - near, Math.hypot(far * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), far * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: pos.length / 2
                });
            }
            
            return this.id++;
        }
    }

    //draws a ring slice
    public fillRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.FILL_RING_SLICE)){
            return this.shaderRingSlice(x, y, near, far, start, end, OpenGL.toColor(color), null, ShaderMode.FILL_RING_SLICE);
        }else{
            return this.fillRingSliceImpl(x, y, near, far, start, end, false, color, null, precision);
        }
    }

    //draws a ring slice
    public fillLinedRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.LINED_RING_SLICE)){
            return this.shaderRingSlice(x, y, near, far, start, end, OpenGL.toColor(fillColor), OpenGL.toColor(lineColor), ShaderMode.LINED_RING_SLICE);
        }else{
            return this.fillRingSliceImpl(x, y, near, far, start, end, true, fillColor, lineColor, precision);
        }
    }

    //shader ring slice buffer subroutine
    private shaderRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, mainColor: Float32Array, extraColor: Float32Array, mode: ShaderMode): number{
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = new Float32Array(8);

        if(end - start > 90){
            pos[0] = (x + far * 1.001) / this.HALFWIDTH;
            pos[1] = (y + far * 1.001) / this.HALFHEIGHT;
            pos[2] = (x - far * 1.001) / this.HALFWIDTH;
            pos[3] = (y + far * 1.001) / this.HALFHEIGHT;
            pos[4] = (x + far * 1.001) / this.HALFWIDTH;
            pos[5] = (y - far * 1.001) / this.HALFHEIGHT;
            pos[6] = (x - far * 1.001) / this.HALFWIDTH;
            pos[7] = (y - far * 1.001) / this.HALFHEIGHT;
            
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

            if(mode != ShaderMode.LINED_RING_SLICE){
                this.arrays.push(<RingSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: 4,
                    near: near / this.HALFHEIGHT,
                    radius: far / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: mode
                });
            }else{
                this.arrays.push(<RingSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    lineColor: extraColor,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: 4,
                    radius: far / this.HALFHEIGHT,
                    near: near / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: ShaderMode.LINED_RING_SLICE
                });
            }
        }else{
            var dcx = far * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
            var dcy = far * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);

            pos[0] = (x + dcx + far * 0.71 * 1.001) / this.HALFWIDTH;
            pos[1] = (y + dcy + far * 0.71 * 1.001) / this.HALFHEIGHT;
            pos[2] = (x + dcx - far * 0.71 * 1.001) / this.HALFWIDTH;
            pos[3] = (y + dcy + far * 0.71 * 1.001) / this.HALFHEIGHT;
            pos[4] = (x + dcx + far * 0.71 * 1.001) / this.HALFWIDTH;
            pos[5] = (y + dcy - far * 0.71 * 1.001) / this.HALFHEIGHT;
            pos[6] = (x + dcx - far * 0.71 * 1.001) / this.HALFWIDTH;
            pos[7] = (y + dcy - far * 0.71 * 1.001) / this.HALFHEIGHT;
            
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);
            
            if(mode != ShaderMode.LINED_CIRCLE_SLICE){
                this.arrays.push(<RingSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    x: x + dcx,
                    y: y + dcy,
                    cx: x,
                    cy: y,
                    rad: far * 0.71,
                    span: Math.min(far - near, Math.hypot(far * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), far * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: 4,
                    near: near / this.HALFHEIGHT,
                    radius: far / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: mode
                });
            }else{
                this.arrays.push(<RingSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    lineColor: extraColor,
                    x: x + dcx,
                    y: y + dcy,
                    cx: x,
                    cy: y,
                    rad: far * 0.71,
                    span: Math.min(far - near, Math.hypot(far * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), far * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: 4,
                    near: near / this.HALFHEIGHT,
                    radius: far / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: ShaderMode.LINED_RING_SLICE
                });
            }
        }    
        
        return this.id++;
    }

    //draws a ring slice
    private fillRingSliceImpl(x: number, y: number, near: number, far: number, start: number, end: number, line: boolean, fillColor: number[], lineColor: number[], precision: number): number {
        const pos = new Float32Array(Math.floor((end - start) / precision) * 4 + 4);
        for(var i = 0; end > start + i * precision; i++){
            pos[i * 4] = (x + far * Math.cos((start + i * precision) * Matrix.oneDeg)) / this.HALFWIDTH;
            pos[i * 4 + 1] = (y + far * Math.sin((start + i * precision) * Matrix.oneDeg)) / this.HALFHEIGHT;
            pos[i * 4 + 2] = (x + near * Math.cos((start + i * precision) * Matrix.oneDeg)) / this.HALFWIDTH;
            pos[i * 4 + 3] = (y + near * Math.sin((start + i * precision) * Matrix.oneDeg)) / this.HALFHEIGHT;
        }
        pos[i * 4] = (x + far * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH;
        pos[i * 4 + 1] = (y + far * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT;
        pos[i * 4 + 2] = (x + near * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH;
        pos[i * 4 + 3] = (y + near * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT;

        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

        if(line){
            if(lineColor == null){
                lineColor = fillColor;
            }
            
            const indices = new Uint8Array(pos.length / 2);
            for(var i = 0; i < pos.length / 4; i++){
                indices[i] = i * 2;
                indices[pos.length / 2 - 1 - i] = i * 2 + 1;
            }

            var indicesBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
        
            if(end - start > 90){
                this.arrays.push({
                    pos: posBuffer,
                    color: OpenGL.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: pos.length / 2,
                    overlay: {
                        pos: posBuffer,
                        indices: indicesBuffer,
                        color: OpenGL.toColor(lineColor),
                        mode: this.gl.LINE_LOOP,
                        length: pos.length / 2
                    }
                });
            }else{
                var dcx = far * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
                var dcy = far * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);
                this.arrays.push({
                    pos: posBuffer,
                    color: OpenGL.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x + dcx,
                    y: y + dcy,
                    rad: far * 0.71,
                    span: Math.min(far - near, Math.hypot(far * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), far * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: pos.length / 2,
                    overlay: {
                        pos: posBuffer,
                        indices: indicesBuffer,
                        color: OpenGL.toColor(lineColor),
                        mode: this.gl.LINE_LOOP,
                        length: pos.length / 2
                    }
                });
            }
        }else{
            if(end - start > 90){
                this.arrays.push({
                    pos: posBuffer,
                    color: OpenGL.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x,
                    y: y,
                    rad: far,
                    span: far * 2,
                    length: pos.length / 2
                });
            }else{
                var dcx = far * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
                var dcy = far * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);
                this.arrays.push({
                    pos: posBuffer,
                    color: OpenGL.toColor(fillColor),
                    mode: this.gl.TRIANGLE_STRIP,
                    x: x + dcx,
                    y: y + dcy,
                    rad: far * 0.71,
                    span: Math.min(far - near, Math.hypot(far * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), far * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: pos.length / 2
                });
            }
        }
        
        return this.id++;
    }
    
    //draws a circular slice  
    public drawCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.DRAW_CIRCLE_SLICE)){
            return this.shaderCircleSlice(x, y, radius, start, end, ShaderMode.DRAW_CIRCLE_SLICE, OpenGL.toColor(color), null);
        }else{
            return this.drawCircleSliceImpl(x, y, radius, start, end, false, true, null, color, precision);
        }
    }

    //draws a circular slice
    public fillCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.FILL_CIRCLE_SLICE)){
            return this.shaderCircleSlice(x, y, radius, start, end, ShaderMode.FILL_CIRCLE_SLICE, OpenGL.toColor(color), null);
        }else{
            return this.drawCircleSliceImpl(x, y, radius, start, end, true, false, color, null, precision);
        }
    }

    //draws a circular slice
    public fillLinedCircleSlice(x: number, y: number, radius: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): number {
        if(this.shader.isShaderEnabled(ShaderMode.LINED_CIRCLE_SLICE)){
            return this.shaderCircleSlice(x, y, radius, start, end, ShaderMode.LINED_CIRCLE_SLICE, OpenGL.toColor(fillColor), OpenGL.toColor(lineColor));
        }else{
            return this.drawCircleSliceImpl(x, y, radius, start, end, true, true, fillColor, lineColor, precision);
        }
    }

    //shader circle slice buffer subroutine
    private shaderCircleSlice(x: number, y: number, radius: number, start: number, end: number, mode: ShaderMode, mainColor: Float32Array, extraColor: Float32Array): number {
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = new Float32Array(8);

        if(end - start > 90){
            pos[0] = (x + radius * 1.001) / this.HALFWIDTH;
            pos[1] = (y + radius * 1.001) / this.HALFHEIGHT;
            pos[2] = (x - radius * 1.001) / this.HALFWIDTH;
            pos[3] = (y + radius * 1.001) / this.HALFHEIGHT;
            pos[4] = (x + radius * 1.001) / this.HALFWIDTH;
            pos[5] = (y - radius * 1.001) / this.HALFHEIGHT;
            pos[6] = (x - radius * 1.001) / this.HALFWIDTH;
            pos[7] = (y - radius * 1.001) / this.HALFHEIGHT;
            
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);
            
            if(mode != ShaderMode.LINED_CIRCLE_SLICE){
                this.arrays.push(<CircleSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    x: x,
                    y: y,
                    rad: radius,
                    span: radius * 2,
                    length: 4,
                    radius: radius / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: mode
                });
            }else{
                this.arrays.push(<CircleSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    lineColor: extraColor,
                    x: x,
                    y: y,
                    rad: radius,
                    span: radius * 2,
                    length: 4,
                    radius: radius / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: ShaderMode.LINED_CIRCLE_SLICE
                });
            }
        }else{
            var dcx = radius * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
            var dcy = radius * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);

            pos[0] = (x + dcx + radius * 0.71 * 1.001) / this.HALFWIDTH;
            pos[1] = (y + dcy + radius * 0.71 * 1.001) / this.HALFHEIGHT;
            pos[2] = (x + dcx - radius * 0.71 * 1.001) / this.HALFWIDTH;
            pos[3] = (y + dcy + radius * 0.71 * 1.001) / this.HALFHEIGHT;
            pos[4] = (x + dcx + radius * 0.71 * 1.001) / this.HALFWIDTH;
            pos[5] = (y + dcy - radius * 0.71 * 1.001) / this.HALFHEIGHT;
            pos[6] = (x + dcx - radius * 0.71 * 1.001) / this.HALFWIDTH;
            pos[7] = (y + dcy - radius * 0.71 * 1.001) / this.HALFHEIGHT;
            
            this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);
            
            if(mode != ShaderMode.LINED_CIRCLE_SLICE){
                this.arrays.push(<CircleSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    x: x + dcx,
                    y: y + dcy,
                    cx: x,
                    cy: y,
                    rad: radius * 0.71,
                    span: Math.min(radius, Math.hypot(radius * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), radius * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: 4,
                    radius: radius / this.HALFHEIGHT,
                    start: start * Matrix.oneDeg,
                    end: end * Matrix.oneDeg,
                    shader: mode
                });
            }else{
                this.arrays.push(<CircleSliceElement>{
                    pos: positionBuffer,
                    color: mainColor,
                    lineColor: extraColor,
                    x: x + dcx,
                    y: y + dcy,
                    cx: x,
                    cy: y,
                    rad: radius * 0.71,
                    span: Math.min(radius, Math.hypot(radius * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), radius * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))),
                    length: 4,
                    radius: radius / this.HALFHEIGHT,
                    shader: ShaderMode.LINED_CIRCLE_SLICE
                });
            }
        }
        
        return this.id++;
    }

    //draws a circular slice
    private drawCircleSliceImpl(x: number, y: number, radius: number, start: number, end: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): number {
        const pos = new Float32Array(Math.floor((end - start) / precision) * 2 + 4);
        pos[0] = x / this.HALFWIDTH;
        pos[1] = y / this.HALFHEIGHT;
        for(var i = 0; end > start + i * precision; i++){
            pos[i * 2 + 2] = (x + radius * Math.cos((start + i * precision) * Matrix.oneDeg)) / this.HALFWIDTH;
            pos[i * 2 + 3] = (y + radius * Math.sin((start + i * precision) * Matrix.oneDeg)) / this.HALFHEIGHT;
        }
        pos[i * 2 + 2] = (x + radius * Math.cos(end * Matrix.oneDeg)) / this.HALFWIDTH;
        pos[i * 2 + 3] = (y + radius * Math.sin(end * Matrix.oneDeg)) / this.HALFHEIGHT;

        if(end - start > 90){
            return this.renderEllipsoidImpl(pos, x, y, radius, radius * 2, fill, line, lineColor, fillColor, 0);
        }else{
            var dcx = radius * 0.71 * Math.cos((start + ((end - start) / 2)) * Matrix.oneDeg);
            var dcy = radius * 0.71 * Math.sin((start + ((end - start) / 2)) * Matrix.oneDeg);
            return this.renderEllipsoidImpl(pos, x + dcx, y + dcy, radius * 0.71, Math.min(radius, Math.hypot(radius * (Math.cos(start * Matrix.oneDeg) - Math.cos(end * Matrix.oneDeg)), radius * (Math.sin(start * Matrix.oneDeg) - Math.sin(end * Matrix.oneDeg)))), fill, line, lineColor, fillColor, 0);
        }
    }

    //draws an ellipsoid
    private renderEllipsoidImpl(pos: Float32Array, x: number, y: number, rad: number, span: number, fill: boolean, line: boolean, lineColor: number[], fillColor: number[], offset: number): number {     
        var posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pos, this.gl.STATIC_DRAW);

        if(!(fill && line)){
            this.arrays.push({
                pos: posBuffer,
                color: OpenGL.toColor(line ? lineColor : fillColor),
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
                color: OpenGL.toColor(fillColor),
                mode: this.gl.TRIANGLE_FAN,
                x: x,
                y: y,
                rad: rad,
                span: span,
                length: pos.length / 2,
                overlay: {
                    pos: posBuffer,
                    color: OpenGL.toColor(lineColor),
                    mode: this.gl.LINE_LOOP,
                    length: pos.length / 2 - offset,
                    offset: offset * 4
                }
            });
        }
        
        return this.id++;
    }

    //clear the screen
    private clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    //draw all the OpenGL buffers
    private drawBuffers(start: number): void {
        var vertices = 0;
        var total = 0;
        var elem;
        for(var i = 0; i < this.arrays.length; i++){
            elem = this.arrays[i];
            vertices += this.drawElement(elem);
            total += elem.overlay == null ? elem.length : (elem.length + elem.overlay.length);
        }
        if(OpenGL.verbose){
            console.log("[OpenGL] Rendered " + vertices + " out of " + total + " vertices in", (performance.now() - start), "ms");
        }
    }

    //checks if an element is visible
    private isVisible(elem: Element): boolean {
        if((this.mode == Mode.WIDTH_FIRST && elem.span < ((this.WIDTH / this.factor) / this.width) * this.sizethreshold) || (this.mode == Mode.HEIGHT_FIRST && elem.span < ((this.HEIGHT / this.factor) / this.height) * this.sizethreshold)){
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
        if(!elem.hidden && this.isVisible(elem)){
            if(elem.mode != null){
                return this.drawElementImpl(elem);
            }else{
                return this.shader.renderElement(elem);
            }
        }else{
            return 0;
        }
    }

    //renders the given element
    private drawElementImpl(elem: Element): number {
        this.shader.bindDefault();
        if(elem.pos != null){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.pos);
            this.gl.vertexAttribPointer(this.shader.defaultAttribPosition(),    //attribute
                                        2,                                      //2D so two values per iteration: x, y
                                        this.gl.FLOAT,                          //data type is float32
                                        false,                                  //no normalisation
                                        0,                                      //stride = automatic
                                        elem.offset == null ? 0 : elem.offset); //skip
            this.gl.enableVertexAttribArray(this.shader.defaultAttribPosition());
        }

        if(elem.color != null){
            this.shader.preProcess(elem);
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
    private static toColor(array: number[]): Float32Array{
        if(array == null){
            return null;
        }else{
            while(array.length > 3){
                array.pop();
            }
            return new Float32Array(array);
        }
    }
}
/** @end-author Roan Hofland */

# OpenGL documentation
For people working with the OpenGL abstraction layer. These are the only methods that you should ever need all collected in one document.

# Constructor
`var gl = new OpenGL(WebGLRenderingContext)`

# General
## Public subroutines
- `public releaseBuffers(): void`    
Releases all the buffers currently held in memory, should always be called when recomputing the scene.
- `public resize(width: number, height: number): void`    
Resizes the OpenGL viewport to the optimal size for the given dimensions. Should be called on canvas resize events.
- `public render(): void`    
Renders the OpenGL scene.
- `public transformPoint(x: number, y: number): number[]`    
Maps a true canvas coordinate to the imaginary OpenGL coordinate system. The `x` and `y` parameters denote the point. The returned array contains at index 0 the transformed `x` coordinate and at index 1 the transformed `y` coordinate.
- `public scale(factor: number): void`   
Scales the OpenGL view by the given factor. Scaling is multiplicative.
- `public translate(dx: number, dy: number): void`  
Translates the OpenGL view by the given distance. The `dx` and `dy` parameters denote the distance to translate the model in the x and y direction respectively. Translations are cumulative and `dx` and `dy` are in canvas space.
- `public glTranslate(dx: number, dy: number): void`  
Translates the OpenGL view by the given distance. The `dx` and `dy` parameters denote the distance to translate the model in the x and y direction respectively. Translations are cumulative and `dx` and `dy` are in imaginary OpenGL space.
- `public rotate(rotation: number): void`    
Rotates the OpenGL view by the given number of degrees. Rotations are additive.
- `public getRotation(): number`    
Returns the view rotation in degrees.
- `public getZoom(): number`    
Return the zoom factor.
- `public resetTransformations(): void`    
Resets all transformations (zoom, rotation and translation).
- `public resetZoom(): void`    
Resets the zoom level back to 1.
- `public resetRotation(): void`    
Resets the rotation back to 0 degrees.
- `public resetTranslation(): void`    
Resets the origin back to (0, 0).
- `public isDedicatedGPU(): boolean`    
Checks whether or not the GPU used by OpenGL is a dedicated GPU.
- `public getWidth(): number`    
Returns the width of the visible OpenGL canvas space. 
- `public getHeight(): number`    
Returns the height of the visible OpenGL canvas space.
- `public getXTranslation(): number`    
Returns the aggregated translation on the x-axis in OpenGL space.
- `public getYTranslation(): number`    
Returns the aggregated translation on the y-axis in OpenGL space.
- `public setBackgroundColor(r: number, g: number, b: number): void`   
Sets the viewport background color. Arguments should be in range 0-1. Changes will only take effect after a rerender.
- `public optimizeFor(mode: ShaderMode): void`    
Optimises draw calls for the given shader mode. 
- `public optimizeDefault(): void`   
Optimises draw calls for shapes are were not drawn with a specialized shader.
- `public enableShaders(shader: ShaderMode): void`    
Enables the shader(s) specified by the given shader mode.

## Available but not intended to be used
- `public getModelviewMatrix(): Float32Array`    
Gets the modelview matrix.
- `public getDY(): number`    
Gets the y translation in true OpenGL space.
- `public getDX(): number`    
Gets the x translation in true OpenGL space.
- `public getRY(): number`    
Gets the rotation on the y axis.
- `public getRX(): number`    
Gets the rotation on the x axis.


# Shaders

## Modes
Crossed out modes are not implemented. In general you should only enable a parent mode if you intent to use all its child modes.    
*Enum: ShaderMode.*
- `ALL`
    - `CIRCLES`
        - `LINED_CIRCLE`
        - `FILL_CIRCLE`
        - `DRAW_CIRCLE`
    - `CIRCLE_SLICES`
        - ~~`LINED_CIRCLE_SLICE`~~
        - `FILL_CIRCLE_SLICE`
        - `DRAW_CIRCLE_SLICE`
    - `RING_SLICES`
        - ~~`LINED_RING_SLICE`~~
        - `FILL_RING_SLICE`
        - `DRAW_RING_SLICE`
    - `ELLIPSOIDS`
        - ~~`DRAW_ELLIPSOID`~~
        - ~~`FILL_ELLIPSOID`~~
        - ~~`LINED_ELLIPSOID`~~
    - `ARCS`
        - ~~`ELLIPSOIDAL_ARC`~~
        - `CIRCULAR_ARC`
        
## Enable Shaders
Visualisations that want to use shaders should explictly enable the shaders they need using one of more calls to the `gl.enableShaders(ShaderMode mode)` function. To do this visualisations can implement the optional `enableShaders(gl: OpenGL): void` subroutine.

## Optimize Shaders
Visualisations that use more than one shader (more than one leaf in the hierarcy above) should optimize their shader calls. This means that they should take care to group calls of the same type. If however this is not possible then there is a method that can do this afterwards. 

To make use of this functionality a visualisation can implement the optional `optimizeShaders(gl: OpenGL): void` subroutine. In this subroutine the visualisation can then make one or more calls to the `gl.optimizeFor(ShaderMode mode)` and one call to the `gl.optimizeDefault()` subroutine.

**However doing this will change the order that shapes are drawn in. The order will be determined by the order of the `optimizeFor` calls with the first type that is optimized also being the first type that is drawn.** Other than that the optimisation procedure is stable with respect to shapes of the same type. Types that don't make use of a specialized shader are drawn last or when the `gl.optimizeDefault()` subroutine was called.
        
## Important notes
When using shaders to render arcs, circle slices or ring slices behavoir for start or end angles outside of 0-360 is *undefined*.

# Rendering

### Color
All the rendering methods will ask for a color to use. The color should be provided as an array containing the red, green and blue values as floats. These floats should all be in range 0 to 1.    

Examples:    
- `var red = [1.0, 0.0, 0.0];`
- `var purple = [1.0, 0.0, 1.0];`
- `var black = [0.0, 0.0, 0.0];`

### Precision
All the ellipsoid methods will ask for an optional precision argument. This has to be a positive integer that is also a divisor of 360. This means that the only valid values are: `1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180 and 360`. The precision roughly corresponds to the length of the small lines that make up the outer perimiter of the circle, thus this means that smaller precision values imply shorter lines and thus a smoother ellipsoid. Shorter lines also implies more lines though so performance goes down when the precision value is lowered. If a shader is used the precision is always infinite.

## Quads
- `public fillAAQuad(x: number, y: number, width: number, height: number, color: number[]): void`    
Draws a filled quad with the lower left corner at the given x and y coordinate. A width and height relative to that point and the given color.
- `public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): void`    
Outlines a quad with the lower left corner at the given x and y coordinate. A width and height relative to that point and the given color.
- `public fillLinedAAQuad(x: number, y: number, width: number, height: number, fillColor: number[], lineColor: number[]): void`        
Draws a filled quad with a line around it with the lower left corner at the given x and y coordinate. A width and height relative to that point, a color to fill the quad with and a color for the line around it. If the line color is set to `null` then the fill color is also used as the line color.
- `public fillRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void`    
Draws a filled quad with a given center coordinate, width, height, rotation and color. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void`    
Outlines a quad with a given center coordinate, width, height, rotation and color. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public fillLinedRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, fillColor: number[], lineColor: number[]): void`    
Draws a filled quad with a line around it with a given center coordinate, width, height, rotation, a color to fill the quad with and a color for the line around it. If the line color is set to `null` then the fill color is also used as the line color. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public fillCustomQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: number[]): void`    
Draws a filled quad with the given `color` and with the given corner points.
- `public drawCustomQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: number[]): void`    
Outlines a quad with the given `color` and with the given corner points.
- `public fillLinedCustomQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, fillColor: number[], lineColor: number[]): void`    
Draws a filled quad with a line around it with the given `lineColor` and `fillColor` and with the given corner points.

## Ellipsoids
- `public fillEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], precision: number): void`    
Draws a filled ellipsoid with a given center coordinate, x radius, y radius, rotation and fill color. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public drawEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, lineColor: number[], precision: number): void`    
Outlines an ellipsoid with a given center coordinate, x radius, y radius, rotation and line color. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public fillLinedEllipsoid(x: number, y: number, radx: number, rady: number, rotation: number, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a filled ellipsoid with a line around it with a given center coordinate, x radius, y radius, rotation, fill color and line color. If the line color is set to `null` then the fill color is also used as the line color. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used. The rotation is consistent with the unit circle meaning that the ellipsoid will rotate anticlockwise.
- `public fillCircle(x: number, y: number, radius: number, fillColor: number[], precision: number): void`    
Draws a filled circle with a given center coordinate, radius, rotation and color. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used.
- `public drawCircle(x: number, y: number, radius: number, lineColor: number[], precision: number): void`    
Outlines a circle with a given center coordinate, radius, rotation and color. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used.
- `public fillLinedCircle(x: number, y: number, radius: number, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a filled circle with a line around it with a given center coordinate, x radius, y radius, rotation, fill color and line color. If the line color is set to `null` then the fill color is also used as the line color. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used.

## Slices
**Note:** The precision argument for slices is a bit more relaxed and does not have to be a divisor of 360. In fact the best results are achieved when it is a divisor of the difference between the `start` and `end` argument. For a small enough precision value this difference is however unnoticeable.

- `public fillLinedCircleSlice(x: number, y: number, radius: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a filled slice with a line around it of the circle with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `fillColor` specifies the color to use to fill the slice and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The optional precision argument specifies how good the slice approximation has to be. If the precision argument is not specified then the default value of 10 is used.
- `public fillCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number): void`    
Draws a filled slice of the circle with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius` and `color`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The optional precision argument specifies how good the slice approximation has to be. If the precision argument is not specified then the default value of 10 is used.
- `public drawCircleSlice(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number): void`    
Outlines a slice of the circle with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius` and `color`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `lineColor` specifies the color to use to fill the slice. The optional precision argument specifies how good the slice approximation has to be. If the precision argument is not specified then the default value of 10 is used.
- `public fillLinedRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a filled slice with a line around it of the ring/donut with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `near` argument specifies the inner radius of the ring (the radius of the hole). The `far` argument specifies the outer radius of the ring. The `fillColor` specifies the color to use to fill the slice and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The optional precision argument specifies how good the slice approximation has to be. If the precision argument is not specified then the default value of 10 is used.
- `public fillRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number): void`    
Draws a filled slice of the ring/donut with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius` and `color`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `near` argument specifies the inner radius of the ring (the radius of the hole). The `far` argument specifies the outer radius of the ring. The optional precision argument specifies how good the slice approximation has to be. If the precision argument is not specified then the default value of 10 is used.
- `public drawRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, color: number[], precision: number): void`    
Outlines a slice of the ring/donut with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius` and `color`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `near` argument specifies the inner radius of the ring (the radius of the hole). The `far` argument specifies the outer radius of the ring. The optional precision argument specifies how good the slice approximation has to be. If the precision argument is not specified then the default value of 10 is used.

## Lines
- `public drawPolyLine(x: number[], y: number[], color: number[]): void`    
Draws a line through the given x and y coordinates and with the given color. The x and y lists should have the same size and numbers at the same array index correspond to each other. For instance, the first line segment would be drawn between (`x[0]`, `y[0]`) and (`x[1]`, `y[1]`).
- `public drawLine(x1: number, y1: number, x2: number, y2: number, color: number[]): void`    
Draws a straight line between two points and with the given color, the first point being (`x1`, `y1`) and the second point being (`x2`, `y2`).

## Arcs
- `public drawEllipsoidalArc(x: number, y: number, radx: number, rady: number, start: number, end: number, color: number[], precision: number): void`    
Draws an ellipsoidal arc centred at the given `x` and `y` coordinate (if the full arc were to be drawn) and with the given x and y radiuses. The `start` variable specifies at what number of degrees the arc start and the `end` variable specifies at what number of degrees the arc should end. For example drawing from `start=90` to `end=180` would draw the leftmost upper quarter of the ellipsoid. Additionally a line color has to be given. The optional precision argument specifies how good the ellipsoid approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used.
- `public drawCircularArc(x: number, y: number, radius: number, start: number, end: number, color: number[], precision: number): void`    
Draws an circular arc centred at the given `x` and `y` coordinate (if the full arc were to be drawn) and with the given radius. The `start` variable specifies at what number of degrees the arc start and the `end` variable specifies at what number of degrees the arc should end. For example drawing from `start=90` to `end=180` would draw the leftmost upper quarter of the circle. Additionally a line color has to be given. The optional precision argument specifies how good the circle approximation has to be, this value has to be a divisor of 360 for correct results. If the precision argument is not specified then the default value of 10 is used.

# Private subroutines
- `private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, x: number, y: number, rad: number, span: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void`        
Draws the quad specified by the 4 sets of coordinates, the given colors and the specified regions. The meaning of the x and y coordinates is dependent on the values of the `line` and `fill` variables. If `fill` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. If `fill` is false and `line` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. The `fill` boolean denotes whether or not to fill the quad with the given color. The `line` boolean denotes whether or not to draw a line around this quad. The `fillColor` is the color used to fill the quad. The `lineColor` is the color used to draw the line around the quad, if `line` is set to true and this is set to `null` the `fillColor` will instead be used to draw the line. The size argument specifies the approximate size of the shape. The `rad` argument specifies the radius of a circle that when certered at `x` and `y` encircles the entire quad. Span specifies the maximized internal shape distance.
- `private renderRotatedQuad(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, size: number, span: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void`    
Draws the quad specified by the 4 sets of coordinates, the center coordinate, the given colors, the specified regions and the given rotation. The meaning of the x and y coordinates is dependent on the values of the `line` and `fill` variables. If `fill` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. If `fill` is false and `line` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. The `fill` boolean denotes whether or not to fill the quad with the given color. The `line` boolean denotes whether or not to draw a line around this quad. The `fillColor` is the color used to fill the quad. The `lineColor` is the color used to draw the line around the quad, if `line` is set to true and this is set to `null` the `fillColor` will instead be used to draw the line. The size argument specifies the approximate size of the shape. The span argument specifies the minimized internal shape distance.
- `private renderEllipsoidImpl(pos: Float32Array, x: number, y: number, rad: number, span: number, fill: boolean, line: boolean, lineColor: number[], fillColor: number[], offset: number): void`    
Draws the ellipsoid defined by the given position array. The array contains the x coordinates at the even indices and the y coordinates at the odd indices. The `fillColor` is used as the fill color for the ellipsoid or as the line color if `fill` is false and `lineColor` equal to `null`. The `fill` and `line` booleans specify whether or not to fill the ellipsoid and whether or not to draw a line around it respectively. The size argument specifies the approximate size of the shape. The `rad` argument specifies the radius of a circle that when certered at `x` and `y` encircles the entire ellipsoid. Span specifies the maximized internal shape distance. The offset specifies the secondary buffer offset.
- `private drawCircleImpl(x: number, y: number, radius: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a circle with the given x and y coordinate as the center and the given radius. The `fill` and `line` booleans specify whether or not to fill the circle and whether or not to draw a line around it respectively. The `fillColor` specifies the color to use to fill the circle and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The precision argument specifies how good the ellipsoid approximation has to be, this values has to be a divisor of 360 for correct results.
- `private drawEllipsoidImpl(x: number, y: number, radx: number, rady: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void`    
Draws an ellipsoid with the given x and y coordinate as the center, the given radius in x and y direction and the given rotation. The `fill` and `line` booleans specify whether or not to fill the ellipsoid and whether or not to draw a line around it respectively. The `fillColor` specifies the color to use to fill the ellipsoid and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The precision argument specifies how good the ellipsoid approximation has to be, this values has to be a divisor of 360 for correct results.
- `private drawCircleSliceImpl(x: number, y: number, radius: number, start: number, end: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a slice of the circle with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `fill` and `line` booleans specify whether or not to fill the slice and whether or not to draw a line around it respectively. The `fillColor` specifies the color to use to fill the slice and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The precision argument specifies how good the slice approximation has to be.
- `private fillRingSliceImpl(x: number, y: number, near: number, far: number, start: number, end: number, line: boolean, fillColor: number[], lineColor: number[], precision: number): void`    
Draws a slice of the ring/donut with its center at `x` and `y` starting at `start` degrees and ending at `end` degrees and with the given `radius`. For correct results `end` should always be greater than `start`. The `end` and `start` arguments are consistent with the unit circle meaning that the direction is anti-clockwise and that 0 degrees is the 3 o' clock position. The `near` argument specifies the inner radius of the ring (the radius of the hole). The `far` argument specifies the outer radius of the ring. The `line` boolean specifies whether or not to draw a line around the slice. The `fillColor` specifies the color to use to fill the slice and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The precision argument specifies how good the slice approximation has to be.
- `private drawArcImpl(pos: Float32Array, color: number[], x: number, y: number, rad: number, span: number): void`  
Draws the arc defined by the given position array. The array contains the x coordinates at the even indices and the y coordinates at the odd indices. The color array is used as the line color for the arc. The `rad` argument specifies the radius of a circle that when certered at `x` and `y` encircles the entire arc. Span specifies the maximized internal shape distance.
- `private shaderCircle(x: number, y: number, radius: number, mode: ShaderMode, mainColor: Float32Array, extraColor: Float32Array`    
Draws a circle with the given center point and radius. The `mode` indicates the shader to use to draw the circle. The `mainColor` and `extraColor` are passed to the shader for use. If the shader mode is set to the filled circle variant the `extraColor` will be ignored and the `mainColor` used to draw the circle. If the shader mode is set to the drawn circle variant the `extraColor` will be ignored and the `mainColor` used to draw the circle. If the shader mode is set to the lined circle variant the `mainColor` will be used to fill the circle and the `extraColor` will be used to draw the outline.
- `private shaderRingSlice(x: number, y: number, near: number, far: number, start: number, end: number, mainColor: Float32Array, extraColor: Float32Array, mode: ShaderMode): void`    
Draws a ring slice with the given center point, near, far, start and end arguments. The `mode` indicates the shader to use to draw the circle. The `mainColor` and `extraColor` are passed to the shader for use. If the shader mode is set to the filled ring slice variant the `extraColor` will be ignored and the `mainColor` used to draw the ring slice. If the shader mode is set to the drawn ring slice variant the `extraColor` will be ignored and the `mainColor` used to draw the ring slice. If the shader mode is set to the lined ring slice variant the `mainColor` will be used to fill the ring slice and the `extraColor` will be used to draw the outline.
- `private shaderCircleSlice(x: number, y: number, radius: number, start: number, end: number, mode: ShaderMode, mainColor: Float32Array, extraColor: Float32Array): void`    
Draws a circle slice with the given center point, radius, start and end arguments. The `mode` indicates the shader to use to draw the circle. The `mainColor` and `extraColor` are passed to the shader for use. If the shader mode is set to the filled circle slice variant the `extraColor` will be ignored and the `mainColor` used to draw the circle slice. If the shader mode is set to the drawn circle slice variant the `extraColor` will be ignored and the `mainColor` used to draw the circle slice. If the shader mode is set to the lined circle slice variant the `mainColor` will be used to fill the circle slice and the `extraColor` will be used to draw the outline.

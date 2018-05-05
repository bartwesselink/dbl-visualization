# OpenGL documentation
For people working with the OpenGL abstraction layer. These are the only methods that you should ever need all collected in one document.

# Constructor
`var gl = new OpenGL(WebGLRenderingContext)`

# General
- `public releaseBuffers(): void`    
Releases all the buffers currently held in memory, should always be called when recomputing the scene.
- `public useShader(shader: Shader): void`    
Sets the shader to use for rendering the scene.
- `public resize(width: number, height: number): void`    
Resizes the OpenGL viewport to the optimal size for the given dimensions. Should be called on canvas resize events.
- `public render(): void`    
Renders the OpenGL scene.
- `public initShaders(): Shader`    
Intialises the only shader we have at the moment.

# Rendering
All the rendering methods will ask for a color to use. The color should be provided as an array containing the red, green, blue and alpha values as floats. These floats should all be in range 0 to 1.    

Examples:    
- `var red = [1.0, 0.0, 0.0, 1.0];`
- `var purple = [1.0, 0.0, 1.0, 1.0];`
- `var black = [0.0, 0.0, 0.0, 1.0];`

## Quads
- `public fillAAQuad(x: number, y: number, width: number, height: number, color: number[]): void`    
Draws a filled quad with the lower left corner at the given x and y coordinate. A width and height relative to that point and the given color.
- `public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): void`    
Outlines a quad with the lower left corner at the given x and y coordinate. A width and height relative to that point and the given color.
- `public fillLinedAAQuad(x: number, y: number, width: number, height: number, fillColor: number[], lineColor: number[]): void`        
Draws a filled quad with a line around it with the lower left corner at the given x and y coordinate. A width and height relative to that point, a color to fill the quad with and a color for the line around it.
- `public fillRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void`    
Draws a filled quad with a given center coordinate, width, height, rotation and color. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void`    
Outlines a quad with a given center coordinate, width, height, rotation and color. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.
- `public fillLinedRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, fillColor: number[], lineColor: number[]): void`    
Draws a filled quad with a line around it with a given center coordinate, width, height, rotation, a color to fill the quad with and a color for the line around it. The rotation is consistent with the unit circle meaning that the quad will rotate anticlockwise.

## Ellipsoids
- TODO

# Private subroutines

- `private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void`        
Draws the quad specified by the 4 sets of coordinates, the given colors and the specified regions. The meaning of the x and y coordinates is dependent on the values of the `line` and `fill` variables. If `fill` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. If `fill` is false and `line` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. The `fill` boolean denotes whether or not to fill the quad with the given color. The `line` boolean denotes whether or not to draw a line around this quad. The `fillColor` is the color used to fill the quad. The `lineColor` is the color used to draw the line around the quad, if `line` is set to true and this is set to `null` the `fillColor` will instead be used to draw the line.
- `private renderRotatedQuad(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void`
Draws the quad specified by the 4 sets of coordinates, the center coordinate, the given colors, the specified regions and the given rotation. The meaning of the x and y coordinates is dependent on the values of the `line` and `fill` variables. If `fill` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. If `fill` is false and `line` is true then `x1` and `y1` specify the upper right corner of the quad, `x2` and `y2` specify the upper left corner of the quad, `x3` and `y3` specify the lower right corner of the quad and `x4` and `y4` specify the lower left corner of the quad. The `fill` boolean denotes whether or not to fill the quad with the given color. The `line` boolean denotes whether or not to draw a line around this quad. The `fillColor` is the color used to fill the quad. The `lineColor` is the color used to draw the line around the quad, if `line` is set to true and this is set to `null` the `fillColor` will instead be used to draw the line.
- `private renderEllipsoidImpl(colors: number[], pos: number[], fill: boolean, line: boolean, lineColor: number[]): void`
Draws the ellipsoid defined by the given position array. The array contains the x coordinates at the even indices and the y coordinates at the odd indices. The colors array is used as the fill color for the ellipsoid or as the line color of `fill` is false and `lineColor` equal to `null`. The `fill` and `line` booleans specify whether or not to fill the ellipsoid and whether or not to draw a line around it respectively.    
- `private drawCircleImpl(x: number, y: number, radius: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void`
Draws a circle with the given x and y coordinate as the center and the given radius. The `fill` and `line` booleans specify whether or not to fill the circle and whether or not to draw a line around it respectively. The `fillColor` specifies the color to use to fill the circle and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The precision specifies how good the circle approximation has to be, this values has to be a divisor of 360 for correct results.    
- `private drawEllipsoidImpl(x: number, y: number, radx: number, rady: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[], precision: number = this.PRECISION): void`
Draws an ellipsoid with the given x and y coordinate as the center and the given radius in x and y direction. The `fill` and `line` booleans specify whether or not to fill the ellipsoid and whether or not to draw a line around it respectively. The `fillColor` specifies the color to use to fill the ellipsoid and the `lineColor` specifies the color to use to draw the outline. If the `lineColor` is `null` but `line` is set to true then the `fillColor` is used to draw the outline. The precision specifies how good the circle approximation has to be, this values has to be a divisor of 360 for correct results.

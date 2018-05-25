# NGL tree

This repository contains the source code for the DBL HTI + Webtech course for group 1D.

## Feature overview
The following features and or functionality have been implemented:
- Newick parser / uploader (with feedback)
- 2 Visualizations: Generalized Pythagorean Tree, Simple (Nested) Tree Map
- Interaction through panning / zooming / rotation
- Tree navigator element
- Screenshot / Export of current visualization
- Dark-mode
- Global settings integration for the entire tool
- Per visualization settings capabilities

## Upcoming changes
Here we will highlight some of the upcoming changes and improvements to our tool.
- OpenGL/WebGL performance optimizations
- Improved interaction through e.g. node selections
- Additional visualizations
- Multiple visualizations simultaneously
- Color deficiency support
- GPU availability information feedback to user

## Usage tips
1. There is a step-by-step help feature at the top right.
2. Navigation in the canvas can also be done through:
 - W, A, S, D : panning
 - Q, E : rotating
 - R, F : zooming
 - T : reset canvas transformations

## Live demo
A hosted version of our application can be found on: [dbl.mboezer.com](http://dbl.mboezer.com)

## Running the app locally
### Production
- Check if the `dist/` folder exists
- In case this folder exists, open the `index.html` file in a browser, and you should be good to go!
- If this directory does not (yet) exists, continue.
- Make sure you have NodeJS ([https://nodejs.org/en/download/](https://nodejs.org/en/download/), choose LTS) and the package manager Yarn ([https://yarnpkg.com/lang/en/docs/install/](https://yarnpkg.com/lang/en/docs/install/)) installed and added to your path (meaning it should be accessible via the command line).
- Run `yarn` from the project directory
- Run `yarn build`
- Repeat step 1

### Development
- Make sure you have NodeJS ([https://nodejs.org/en/download/](https://nodejs.org/en/download/), choose LTS) and the package manager Yarn ([https://yarnpkg.com/lang/en/docs/install/](https://yarnpkg.com/lang/en/docs/install/)) installed and added to your path (meaning it should be accessible via the command line).
- Run `yarn` from the project directory
- Run `yarn start`
- You're all setup! Live-reload should automatically update your code while you're working on it.

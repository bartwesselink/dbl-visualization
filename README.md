![Image missing: NGL Tree product image](src/assets/images/product-promo.png "NGL Tree product image")

# NGL tree

This repository contains the source code for the DBL HTI + Webtech course for group 1D.

## Feature overview
The following features and or functionality have been implemented:
- Newick parser / uploader (with feedback)
- A total of 8 different visualizations
- High performance web-based OpenGL implementation
- Interaction through panning / zooming / rotation
- Interaction through node selections
- Tree navigator element with a search filter
- Showing multiple visualizations side by side
- Screenshot / Export of current visualization
- Dark-mode
- Global settings integration for the entire tool
- Per visualization settings capabilities
- Support for color vision deficient users through color palettes
- Exploring and exporting subtrees

## Visualizations
In order to support data scientists with the right tools we made a selection of 8 visualizations which we implemented. By offering a wide range of visualization styles we think our tool is suitable for visualizing many hierarchies, regardless of their structure.

![Image missing: All available visualizations](src/assets/images/readme-all_visualizations.png "All available visualizations")


## Future changes
NGL Tree is the result of a TU/e student group project. Currently the deadline for the project has passed and hence the work here can be seen as "final". There are no immediate steps we intend to take towards improving the current implementation.

## Usage tips
1. There is a step-by-step help feature at the top right.
2. Navigation in the canvas can also be done through:
 - W, A, S, D : panning
 - Q, E : rotating
 - R, F : zooming
 - T : reset canvas transformations

## Live demo
A hosted version of our application can currently be found on: [dbl.mboezer.com](http://dbl.mboezer.com)

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

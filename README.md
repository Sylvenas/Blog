# little forest

## Getting started

### Prerequisites

1. Git
1. Node: install version 8.4 or greater
1. Yarn: See [Yarn website for installation instructions](https://yarnpkg.com/lang/en/docs/install/)
1. A clone of the [blog repo](https://github.com/lit-forest/blog) on your local machine
1. A fork of the repo (for any contributions)

### Installation

1. `cd blog` to go into the project root
1. `yarn` to install the website's npm dependencies

### Running locally

1. `yarn dev` to start the hot-reloading development server (powered by [Gatsby](https://www.gatsbyjs.org))
1. `open http://localhost:8000` to open the site in your favorite browser


### Make the change

1. Follow the "Running locally" instructions
1. Save the files and check in the browser
  1. Changes to React components in `src` will hot-reload
  1. Changes to markdown files in `content` will hot-reload
  1. If working with plugins, you may need to remove the `.cache` directory and restart the server

### Test the change

1. If possible, test any visual changes in all latest versions of common browsers, on both desktop and mobile.
1. Run `yarn check-all` from the project root. (This will run Prettier, ESLint, and Flow.)


## Troubleshooting

- `yarn reset` to clear the local cache
- `yarn build` to build this repo
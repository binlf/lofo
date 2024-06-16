# LoFo

CLI for adding local fonts to your Next.js projects!

```
 npx lofo
```

## Quick Start

To get started, run the above command in your project directory and `lofo` would try to get everything set up properly for you automatically.

> _It's recommended you put all your local font files in a directory named `fonts` in the root directory of your project!_

### How it works.

When the CLI is executed, it would look through your project for a `fonts` directory[_putting all your local font files in a `fonts` directory ensures faster results_] and create one if it doesn't exist in the root directory of your project.

In the latter scenario, after the creation of the `fonts` directory, it would analyze your project and try to find your local font files -- these are files that typically have the `.otf`, `.ttf`, `.woff`, `.woff2` extensions and then move them all into the `fonts` directory.

It would then resolve the paths to all the font files in your `fonts` directory and then generate the right code snippet to add the font imports into your Next.js project. _This would typically be written/appended to your `layout.tsx` file._

### Recommended Folder Structure

```
example-project
|-- app
|-- pages
|-- public
|-- fonts
`-- ...
```

### Roadmap

- [ ] Add support for projects using TailwindCSS
- [ ] Add support for React.js projects
- [ ] Add support for Vanilla.js projects

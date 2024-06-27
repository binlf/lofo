# LoFo

CLI for adding local fonts to your Next.js projects!

```
 npx lofo
```

## Quick Start

To get started, run the above command in your project directory and `lofo` would try to get everything set up properly for you automatically. You can also install the program on your machine by running the command below:

```
npm install lofo
```

After which you can execute the CLI by just running the command: `lofo` in your terminal...

### How it works.

When the CLI is executed, it would look through your project for a `fonts` directory and create one if it doesn't exist in the root directory of your project.

> _It's recommended you put all your local font files in a directory named `fonts` in the root directory of your project!_

In the latter scenario, after the creation of the `fonts` directory, it would prompt you to move your local font files[_these are files that typically have the `.otf`, `.ttf`, `.woff`, `.woff2` extensions_] into the `fonts` directory.

It would then resolve the paths to all the font files in your `fonts` directory and then generate the right code snippet to add the font imports into your Next.js project. _This would typically be written/appended to your `layout.tsx` file._

### Recommended Folder Structure

_This is just the ideal folder structure to start with before running the cli -- not cumpulsory_

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
- [ ] Add support for projects still on pages router
- [ ] Add support for React.js projects
- [ ] Add support for Vanilla.js projects
- [ ] Add support for monorepo projects

> ⚠Warning: _This project, at this time, makes quite a few assumptions about your project and conventions. Proceed with caution!_

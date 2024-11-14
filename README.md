# LoFo

CLI for managing local fonts in your Next.js project!

### 🛑Prerequisites.

- Node.js version >= **10.8.0**

```
 npx lofo
```

## ⬜Installation

To get started, run the above command in the root directory of your project and `lofo` would try to get everything set up properly for you automatically. You can also install the CLI on your machine by running the command below:

```
npm install -g lofo
```

After which you can execute the CLI by just running the command: `lofo` in your terminal...

### 🔍How it works.

When the CLI is executed, it would look through your project for a `fonts` directory and create one(_if it doesn't exist_) in the root directory of your project.

> [!NOTE]
> _It would **not** check your entire project directory tree recursively, it instead checks directories that a `fonts` directory would likely be found(based on common [conventions](https://github.com/binlf/lofo/blob/abd7a448baacb791037d3627139d620c14530f31/src/constants.ts#L2)). As this would most likely vary from person-to-person, you could put all your local font files in a directory named `fonts` in the root directory of your project. You could [move](https://github.com/binlf/lofo?tab=readme-ov-file#fonts-directory-destination) it somewhere else afterwards! A common convention you could also consider is putting your `fonts` directory(containing all your font files) in the `public/` directory of your Next.js project._

In the latter scenario, after the creation of the `fonts` directory, it would prompt you to move your local font files[_these files typically have extensions such as `.otf`, `.ttf`, `.woff`, `.woff2` etc._] into the `fonts` directory.

It would then resolve the paths to all the font files in your `fonts` directory and then generate the code snippet to add the font imports into your Next.js project. _This would typically be written to your root `layout.tsx` file._

### 📂Project Structure

_This is an example project structure to begin with before running the cli -- not cumpulsory_

```
my-project/
├── app
├── pages
├── public
├── fonts/
│   ├── my-font.woff2
│   └── ...
└── ...
```

### 📍Fonts Directory Destination

The final destination of the `fonts` directory is up to you. You can decide to move the `fonts` directory to a different location, this can be achieved by running the CLI with an argument[_yet to be implemented_] or manually moving the `fonts` directory through your project directory tree(in your IDE). If you prefer the latter, remember to run `lofo` afterwards to auto-update your import path[**_this is a compulsory step_**]...

Using a command line argument with the `lofo` command:
> _Replace values in angle brackets with real values_

| Command | Description | Example |
| --- | --- | --- |
| `lofo --dest <path>` or `lofo -d <path>` | Run this command when adding a new font to your project to designate a "final destination" for the `fonts` directory. The value of `<path>` is resolved relative to your root directory | `lofo --dest public/assets/` |
| `lofo remove [font_family]` or `lofo rm <font_family>` | Run this command to remove a specified font family from your project -- the `fonts` directory. _Run `lofo rm` or `lofo remove` to display the existing list of fonts from which you can select one to delete._ | `lofo rm Roboto` |
| `lofo remove --all` or `lofo remove -a ` | Run this command to remove all font files and font family directories from your project -- the `fonts` directory | `lofo rm --all` |

### 👀Quirks

> These are known "quirks" that you may notice during usage, some are by design, others are minor issues that would be fixed.

#### _Quirk: Nothing happens when I add a folder containing my font files to the `fonts` directory._

For now, the CLI only checks for font files that are direct "children" of the `fonts` directory -- it doesn't look inside sub-directoiries of `fonts`. This means that, you can't add whole directories containing all the files you need, instead you add the individual font files to the `fonts` directory and let the CLI group them for you...

This can admittedly get troublesome and we're looking into [it](https://github.com/binlf/lofo/issues/32). You can keep track of this [issue](https://github.com/binlf/lofo/issues/32) to know when it's been resolved.

#### _Quirk: Something GOOFED._

Unfortunately, every failure can't be accounted for and the only "escape hatch" for now is the command: `lofo rm --all` -- this command would remove all the font files and directories in the `fonts` directory, this should give you a "fresh" slate. If after doing this, something still goofs[something still goes wrong], please don't hesitate to open an [issue](https://github.com/binlf/lofo/issues/new).

### 🗾Roadmap

- [ ] Add support for Next.js projects using the pages router
- [ ] Add support for React.js projects
- [ ] Add support for Vanilla.js projects
- [ ] Add support for React Native projects

> [!WARNING]
> _This project, at this time, is in active development and makes some assumptions about your project and conventions. Feel free to open an [issue](https://github.com/binlf/lofo/issues/new) if you catch something🧐!_

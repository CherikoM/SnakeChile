import ts from "rollup-plugin-typescript2"
import html from "@rollup/plugin-html"
import postcss from "rollup-plugin-postcss"
import copy from "rollup-plugin-copy"
import { terser } from "rollup-plugin-terser"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
const metaUrl = fileURLToPath(import.meta.url)
const dirName = path.dirname(metaUrl)

export default {
  input: "src/index.ts",
  output: {
    dir: path.resolve(dirName, "dist"),
    format: "es",
    sourcemap: true
  },
  plugins: [
    ts(),
    terser(),
    html({
      include: "**/*.html",
      inject: true,
      template: ()=> {
        return fs.readFileSync(path.resolve(dirName, 'src/index.html'), 'utf8')
      },
      fileName: 'index.html'
    }),
    postcss({
      extract: "index.css",
      minimize: true,
    }),
    copy({
      targets: [
        {
          src: 'src/img/*',
          dest: 'dist/img/'
        }
      ]
    })
  ]
}
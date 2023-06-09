import P from 'path'
import { pathToFileURL } from 'url'

export default (path, nuxt) => {
  if (process.env.NODE_ENV === 'development') {
    return pathToFileURL(P.resolve(nuxt.options.buildDir, path)).href
  }

  return P.resolve(nuxt.options.buildDir, path)
}

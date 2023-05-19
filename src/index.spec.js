import { endent as javascript, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import axios from 'axios'
import { execaCommand } from 'execa'
import outputFiles from 'output-files'
import portReady from 'port-ready'

export default tester(
  {
    valid: async () => {
      await outputFiles({
        'modules/mod.js': javascript`
          import { addTemplate } from '@nuxt/kit'

          import self from '../../src/index.js'

          export default (options, nuxt) => {
            addTemplate({
              filename: 'foo.mjs',
              getContents: () => "export default { foo: 'bar' }",
              write: true,
            })
            nuxt.options.alias['#foo'] = self('foo.mjs', nuxt)
          }
        `,
        'server/api/foo.js': javascript`
          import { defineEventHandler } from '#imports'

          import foo from '#foo'

          export default defineEventHandler(() => foo)
        `,
      })
      await execaCommand('nuxt build')

      const nuxt = execaCommand('nuxt start')
      try {
        await portReady(3000)
        expect(
          axios.get('http://localhost:3000/api/foo')
            |> await
            |> property('data'),
        ).toEqual({ foo: 'bar' })
      } finally {
        await nuxt.kill()
      }
    },
  },
  [testerPluginTmpDir()],
)

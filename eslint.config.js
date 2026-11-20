import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// レイヤーの依存の向き(ui / infrastructure → application → domain)を守らせる。
// main.tsx と tools/ は composition root なので、どのレイヤーにも依存してよい。
const layer = (name, message) => ({ group: [`**/${name}/**`, `**/${name}`], message })
const react = { group: ['react', 'react-dom', 'react-dom/*'], message: 'React に依存しないレイヤーです' }
const mediapipe = { group: ['@mediapipe/*'], message: 'MediaPipe は infrastructure/ でだけ使います' }

const restrict = (files, patterns) => ({
  files,
  rules: { 'no-restricted-imports': ['error', { patterns }] },
})

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  restrict(
    ['src/domain/**'],
    [
      layer('application', 'domain は application に依存しません'),
      layer('infrastructure', 'domain は infrastructure に依存しません'),
      layer('ui', 'domain は ui に依存しません'),
      react,
      mediapipe,
    ],
  ),
  restrict(
    ['src/application/**'],
    [
      layer('infrastructure', 'application は infrastructure に依存しません。port を通して使います'),
      layer('ui', 'application は ui に依存しません'),
      react,
      mediapipe,
    ],
  ),
  restrict(
    ['src/infrastructure/**'],
    [layer('ui', 'infrastructure は ui に依存しません'), react],
  ),
  restrict(
    ['src/ui/**'],
    [
      layer('infrastructure', 'ui は infrastructure に依存しません。実装は main.tsx で選んで渡します'),
      mediapipe,
    ],
  ),
])

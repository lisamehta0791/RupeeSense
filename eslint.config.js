import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh' should be replaced with the correct capitalization: 
import reactRefresh from 'eslint-plugin-react-refresh' -> import reactRefresh from '@eslint-plugin-react-refresh' does not apply here as there is no indication of a scope so:
import reactRefresh from 'eslint-plugin-react-refresh' -> import reactRefresh from 'eslint-plugin-react-refresh' does not need a replacement but 'reactRefresh' should be 'react-refresh' in the extends configs section
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      'eslint-plugin-react-refresh/configs/vite',
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])

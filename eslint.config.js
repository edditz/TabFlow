import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  // 忽略文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'specs/**',
      'playwright-report/**',
      'test-results/**'
    ]
  },

  // 基础推荐规则
  js.configs.recommended,

  // TypeScript 推荐规则 (仅应用到 .ts 和 .tsx 文件)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn'
    }
  },

  // Node.js 脚本配置
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }]
    }
  },

  // React 配置
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2020
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // React 规则
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要导入 React
      'react/prop-types': 'off', // 使用 TypeScript，不需要 prop-types
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // 通用规则
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'multi-line']
    }
  }
)

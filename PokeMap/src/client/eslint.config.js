import js from '@eslint/js';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default [
  // Basic JavaScript rules
  js.configs.recommended,
  
  {
    // Apply to JS and JSX files
    files: ['**/*.{js,jsx}'],
    
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    
    plugins: {
      react,
    },      
    
        
    // Enhanced JavaScript error checking rules
    rules: {
      // Critical errors - will break your code
      'no-undef': 'error',              // Undefined variables
      'no-unreachable': 'error',        // Unreachable code after return/throw
      'no-duplicate-imports': 'error',  // Duplicate imports
      'no-self-compare': 'error',       // Comparing variable to itself
      'no-template-curly-in-string': 'error', // Missing ${} in template strings
      
      // Logic errors
      'no-unused-vars': 'warn',         // Unused variables  
      'no-console': 'off',              // Allow console (you might need it for debugging)
      'eqeqeq': 'warn',                 // Use === instead of ==
      'no-constant-condition': 'warn',  // Constant conditions in if/while
      
      // React essentials
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error', 
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'warn',          // Missing key in lists
      'react/prop-types': 'off',        // We don't use prop-types
      
      // Code quality
      'prefer-const': 'warn',           // Use const when possible
      'no-var': 'error',                // Don't use var
      
      // Advanced error detection
      'no-loss-of-precision': 'warn',   // Loss of precision in numbers
      'no-unsafe-negation': 'error',    // Unsafe negation (!)
      'valid-typeof': 'error',          // Invalid typeof comparisons
      'no-fallthrough': 'error',        // Missing break in switch
      'no-sparse-arrays': 'error',      // Sparse arrays with empty slots
    },
    
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
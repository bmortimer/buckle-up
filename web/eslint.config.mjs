import nextConfig from 'eslint-config-next'
import prettierConfig from 'eslint-config-prettier'

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off', // setMounted(true) in useEffect is standard Next.js hydration pattern
      'react-hooks/immutability': 'off', // false positives on Map mutation in render logic
    },
  },
]

export default eslintConfig

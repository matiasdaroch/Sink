export default defineAppConfig({
  // MIK customization: white-label
  title: 'MIK.archi Links',
  documentation: '',
  github: '',
  coffee: '',
  twitter: '',
  telegram: '',
  description: 'Short links and QR codes for MIK Architecture.',
  image: 'https://mik.archi/banner.png',
  previewTTL: 300, // 5 minutes
  slugRegex: /^[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i,
  reserveSlug: [
    'dashboard',
    'admin',
  ],
})

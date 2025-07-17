module.exports = {
  packagerConfig: {
    name: 'RecyTrack',
    executableName: 'RecyTrack',
    asar: true,
    icon: './icons/icon',
    appBundleId: 'com.recytrack.app',
    appCategoryType: 'public.app-category.business',
    win32metadata: {
      CompanyName: 'RecyTrack',
      FileDescription: 'Gestion des déchets pour entreprises',
      OriginalFilename: 'RecyTrack.exe',
      ProductName: 'RecyTrack',
      InternalName: 'RecyTrack'
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'RecyTrack',
        authors: 'RecyTrack Team',
        exe: 'RecyTrack.exe',
        setupExe: 'RecyTrack-Setup.exe',
        setupIcon: './icons/icon.ico',
        loadingGif: './icons/installer.gif',
        noMsi: false
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'RecyTrack Team',
          homepage: 'https://recytrack.com',
          icon: './icons/icon.png'
        }
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'recytrack',
          name: 'recytrack'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
};
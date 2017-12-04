# dbkoda-win
*dbKoda for Windows*

<p align="left">
  <a href="https://ci.appveyor.com/project/SouthbankDeveloper/dbkoda-win">
    <img src="https://img.shields.io/appveyor/ci/SouthbankDeveloper/dbkoda-win.svg?style=flat-square">
  </a>
  <a href="https://david-dm.org/SouthbankSoftware/dbkoda-win">
    <img src="https://img.shields.io/david/SouthbankSoftware/dbkoda-win.svg?style=flat-square">
  </a>
  <a href="https://david-dm.org/SouthbankSoftware/dbkoda-win?type=dev">
    <img src="https://img.shields.io/david/dev/SouthbankSoftware/dbkoda-win.svg?style=flat-square">
  </a>
</p>

## Requirement
* Node 8.9.1
* Yarn
* node-gyp: `yarn global add node-gyp` or `npm install -g node-gyp`
* JDK 1.8.0
* **_optional_** windows-build-tools (some windows may need this): `yarn global add windows-build-tools` or `npm install -g windows-build-tools`
* **_optional_** Python 2.7 (for testing)

## Build from source
1. `yarn install`
2. `yarn gulp`

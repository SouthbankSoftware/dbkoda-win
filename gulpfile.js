/**
 * @Author: Guan Gui <guiguan>
 * @Date:   1970-01-01T10:00:00+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-10T14:10:13+11:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

const gulp = require('gulp');
const sh = require('shelljs');
const shell = require('gulp-shell');
const { argv } = require('yargs');
const through = require('through2');
const pump = require('pump');
const sequence = require('gulp-sequence');
const request = require('request');
const fs = require('fs');
const path = require('path');
const rename = require('gulp-rename');
const del = require('del');
const vinylPaths = require('vinyl-paths');

const GITHUB_BASE_URL = 'https://github.com/SouthbankSoftware';
const CSC_FILE_NAME = 'ssl_com_code_signing_certificate.p12';

/**
 * Update Submodules
 */
gulp.task(
  'updateSubmodules',
  shell.task(
    'git submodule update --init --recursive --recommend-shallow --remote',
    { cwd: __dirname }
  )
);

/**
 * Switch Submodule Branch
 *
 * -b: branch name
 * --depth: clone depth. Make sure the target branch is within the clone depth
 */
gulp.task('switchSubmoduleBranch', (cb) => {
  const branchName = argv.b;
  if (!branchName) {
    cb(new Error('Please specify a branch name using -b'));
  }
  const depth = argv.depth || false;
  process.chdir(__dirname);
  pump(
    [
      gulp.src(''),
      shell([
        'git submodule deinit --all -f',
        'git rm -f --ignore-unmatch dbkoda*'
      ]),
      through.obj((file, _encoding, done) => {
        sh.rm('-rf', 'dbkoda*', '.git/modules/dbkoda*');
        done(null, file);
      }),
      shell([
        `git submodule add -b ${branchName} ${depth
          ? `--depth=${depth}`
          : ''} ${GITHUB_BASE_URL}/dbkoda-ui.git`,
        `git submodule add -b ${branchName} ${depth
          ? `--depth=${depth}`
          : ''} ${GITHUB_BASE_URL}/dbkoda-controller.git`,
        `git submodule add -b ${branchName} ${depth
          ? `--depth=${depth}`
          : ''} ${GITHUB_BASE_URL}/dbkoda.git`
      ])
    ],
    cb
  );
});

/**
 * Build dbKoda UI
 */
gulp.task('buildUi', (cb) => {
  process.chdir(path.resolve(__dirname, 'dbkoda-ui'));
  pump(
    [
      gulp.src(''),
      shell([
        'yarn install --no-progress',
        'node --max_old_space_size=1536 ./node_modules/webpack/bin/webpack.js --config webpack/prod.js'
      ])
    ],
    cb
  );
});

/**
 * Build dbKoda Controller
 */
gulp.task('buildController', (cb) => {
  process.chdir(path.resolve(__dirname, 'dbkoda-controller'));
  pump([gulp.src(''), shell(['yarn install --no-progress'])], cb);
});

/**
 * Build dbKoda App
 */
gulp.task('buildDbKoda', (cb) => {
  process.chdir(path.resolve(__dirname, 'dbkoda'));

  pump(
    [
      gulp.src(''),
      shell([
        'yarn install --no-progress',
        'yarn dev:link:win',
        'yarn dist:win:release'
      ])
    ],
    cb
  );
});

/**
 * Download code signing certificate
 */
gulp.task('downloadCSC', (cb) => {
  const { CSC_LINK } = process.env;
  request
    .get(CSC_LINK)
    .on('error', cb)
    .pipe(fs.createWriteStream(CSC_FILE_NAME))
    .on('error', cb)
    .on('end', cb);
});

/**
 * Add version (from AppVeyor) suffix to build artifact
 */
gulp.task('addVersionSuffixToBuildArtifact', (cb) => {
  process.chdir(__dirname);

  const { APPVEYOR_BUILD_VERSION } = process.env;

  pump(
    [
      gulp.src(['./dbkoda/dist/*.exe', './dbkoda/dist/*.yml', './dbkoda/dist/*.sha1']),
      vinylPaths(del),
      rename((path) => {
        path.basename += `-${APPVEYOR_BUILD_VERSION}`;
      }),
      gulp.dest('./dbkoda/dist')
    ],
    cb
  );
});

/**
 * Build all
 */
gulp.task('build', sequence('buildUi', 'buildController', 'buildDbKoda'));

/**
 * Default
 */
gulp.task('default', sequence('updateSubmodules', 'build'));

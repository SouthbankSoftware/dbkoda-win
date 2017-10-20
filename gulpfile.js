/**
 * @Author: Guan Gui <guiguan>
 * @Date:   1970-01-01T10:00:00+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-18T13:26:25+11:00
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

const GITHUB_BASE_URL = 'https://github.com/SouthbankSoftware';

gulp.task(
  'updateSubmodules',
  shell.task('git submodule update --init --recursive --recommend-shallow --depth=1 --remote')
);

gulp.task('switchSubmoduleBranch', (cb) => {
  const branchName = argv.b;
  if (!branchName) {
    cb(new Error('Please specify a branch name using -b'));
  }
  const depth = argv.depth || false;
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

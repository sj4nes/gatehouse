# Gatehouse: Authentication Monitor

## Installation

 * Install vagrant on your PC. You can get it from https://www.vagrantup.com/
 * Install GIT. You can get that from https://git-scm.com/ if you don't already have it.
 * `git clone https://github.com/sj4nes/gatehouse.git`
 * `cd gatehouse`
 * `vagrant up`
 * Browse to http://127.0.0.1:3080/ after Vagrant completes provisioning MongoDB, runs the build/quality pipeline with NPM and starts the server.
 
 ## The Quality Pipeline
 
 * `npm run quality` will in turn run an `npm run quality:lint` and an `npm run quality:unit-tests` stage.
 * The `quality:lint` stage uses `tslint` which will really drive you up the wall with complaints that later help your team save time fighting with commit messages over certain kinds of formatting.  
 * The `quality:unit-test` stage then uses Facebook Jest to run tests against the system.  One thing I like to do is run "fitness" tests against the environment that blow up--these are better than assuming that npm installed enough of the required modules but not as great as continuous deployment with automated environment construction. If you have never used `vagrant` before, you just used it.  When the "fitness" tests pass Jest has shown you that the environment the system is running in will support it.
 

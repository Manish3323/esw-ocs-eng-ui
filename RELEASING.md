# Releasing

1. Create a branch named `branch-<major>.<minor>.x` if not already exists from `master`. Example branch name `branch-3.0.x`.
   All subsequent release for this release cycle should be done on this branch. All further steps are to be done on this branch.
1. Add release notes (`notes/<version>.markdown`) - only for RC and Main release
1. Update top-level `CHANGELOG.md`
1. Update top-level `README.md`
1. Update `@tmtsoftware/esw-ts` & other dependencies in the package.json
1. Update `version` number in `package.json`
1. Create a version compatibility table in the Readme.md (if there is none) - for esw, csw and esw-ocs-eng-ui
1. Commit and push the changes to `branch-<major>.<minor>.x` branch. Ensure that pipeline is green.
1. Run `release.sh $VERSION$` script by providing version number argument (This triggers release workflow)
   For ex: If you are publishing `1.0.0` then run `release.sh v1.0.0`
   Note: `PROD=true` environment variable needs to be set before running `release.sh`

After release pipeline is green:
1. Merge this release branch to master.


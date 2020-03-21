/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/execution/cluster/package_json_updater" />
import { AbsoluteFsPath } from '../../../../src/ngtsc/file_system';
import { JsonObject } from '../../packages/entry_point';
import { PackageJsonChange, PackageJsonUpdate, PackageJsonUpdater } from '../../writing/package_json_updater';
/**
 * A `PackageJsonUpdater` that can safely handle update operations on multiple processes.
 */
export declare class ClusterPackageJsonUpdater implements PackageJsonUpdater {
    private delegate;
    constructor(delegate: PackageJsonUpdater);
    createUpdate(): PackageJsonUpdate;
    writeChanges(changes: PackageJsonChange[], packageJsonPath: AbsoluteFsPath, preExistingParsedJson?: JsonObject): void;
}

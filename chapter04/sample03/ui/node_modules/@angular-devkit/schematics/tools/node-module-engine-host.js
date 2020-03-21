"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const export_ref_1 = require("./export-ref");
const file_system_engine_host_base_1 = require("./file-system-engine-host-base");
const file_system_utility_1 = require("./file-system-utility");
class NodePackageDoesNotSupportSchematics extends core_1.BaseException {
    constructor(name) {
        super(`Package ${JSON.stringify(name)} was found but does not support schematics.`);
    }
}
exports.NodePackageDoesNotSupportSchematics = NodePackageDoesNotSupportSchematics;
/**
 * A simple EngineHost that uses NodeModules to resolve collections.
 */
class NodeModulesEngineHost extends file_system_engine_host_base_1.FileSystemEngineHostBase {
    constructor(paths) {
        super();
        this.paths = paths;
    }
    _resolveCollectionPath(name) {
        let collectionPath = undefined;
        if (name.startsWith('.') || name.startsWith('/')) {
            name = path_1.resolve(name);
        }
        if (path_1.extname(name)) {
            // When having an extension let's just resolve the provided path.
            collectionPath = require.resolve(name, { paths: this.paths });
        }
        else {
            const packageJsonPath = require.resolve(path_1.join(name, 'package.json'), { paths: this.paths });
            const { schematics } = require(packageJsonPath);
            if (!schematics || typeof schematics !== 'string') {
                throw new NodePackageDoesNotSupportSchematics(name);
            }
            collectionPath = path_1.resolve(path_1.dirname(packageJsonPath), schematics);
        }
        try {
            file_system_utility_1.readJsonFile(collectionPath);
            return collectionPath;
        }
        catch (e) {
            if (e instanceof core_1.InvalidJsonCharacterException || e instanceof core_1.UnexpectedEndOfInputException) {
                throw new file_system_engine_host_base_1.InvalidCollectionJsonException(name, collectionPath, e);
            }
        }
        throw new file_system_engine_host_base_1.CollectionCannotBeResolvedException(name);
    }
    _resolveReferenceString(refString, parentPath) {
        const ref = new export_ref_1.ExportStringRef(refString, parentPath);
        if (!ref.ref) {
            return null;
        }
        return { ref: ref.ref, path: ref.module };
    }
    _transformCollectionDescription(name, desc) {
        if (!desc.schematics || typeof desc.schematics != 'object') {
            throw new file_system_engine_host_base_1.CollectionMissingSchematicsMapException(name);
        }
        return {
            ...desc,
            name,
        };
    }
    _transformSchematicDescription(name, _collection, desc) {
        if (!desc.factoryFn || !desc.path || !desc.description) {
            throw new file_system_engine_host_base_1.SchematicMissingFieldsException(name);
        }
        return desc;
    }
}
exports.NodeModulesEngineHost = NodeModulesEngineHost;

/// <amd-module name="@angular/compiler-cli/ngcc" />
import { AsyncNgccOptions, SyncNgccOptions } from './src/main';
export { ConsoleLogger, LogLevel } from './src/logging/console_logger';
export { Logger } from './src/logging/logger';
export { AsyncNgccOptions, NgccOptions, SyncNgccOptions } from './src/main';
export { PathMappings } from './src/utils';
export declare function process(options: AsyncNgccOptions): Promise<void>;
export declare function process(options: SyncNgccOptions): void;

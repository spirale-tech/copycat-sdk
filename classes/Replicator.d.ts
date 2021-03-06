import * as DB from "./DB";
import { DataRow } from "./Driver";
import { Node } from '../interfaces/Nodes';
import { ClientConfiguration } from '../interfaces/ClientConfig';
import { RestClient } from "./Drivers/Rest";
import { SQLDriver } from './SQLDriver';
export declare class Replicator {
    private localConfig;
    cloudConnection: RestClient;
    node: Node;
    tables: DB.TableDefinition[];
    constructor(localConf: ClientConfiguration);
    refreshConfig(): Promise<void>;
    createLocalTriggers(localDB: SQLDriver, tableName: string): Promise<void>;
    uploadBlobs(row: DataRow): Promise<DataRow>;
    pumpTableToCloud(table: DB.TableDefinition): Promise<void>;
    initializeLocalNode(): Promise<void>;
    initializeCloudDatabase(): Promise<void>;
    replicate(): Promise<void>;
}

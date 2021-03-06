/// <reference types="node" />
import { Driver, ReplicationBlock, DataRow } from "../Driver";
import { Node } from "../../interfaces/Nodes";
import * as DB from "../DB";
import { ReplicationCycle } from "../../interfaces/Log";
export declare const MAX_REQUEST_SIZE = 100000;
export declare class RestClient extends Driver {
    accessToken: string;
    baseURL: string;
    newReplicationCycle(): Promise<ReplicationCycle>;
    private httpClient;
    private restClient;
    private requestOptions;
    constructor(accessToken: string, baseURL: string);
    callSSE(url: string, options: any, callback: (data: any) => Promise<any>): Promise<void>;
    uploadBlob(value: Buffer, blobID: string): Promise<void>;
    getDataRows(tableName: string, callback: (row: DataRow) => Promise<boolean>): Promise<void>;
    importTableData(tableName: string, records: DataRow[], finished: boolean): Promise<void>;
    createOrUpdateTable(table: DB.TableDefinition): Promise<string>;
    createTable(table: DB.TableDefinition): Promise<string>;
    updateTable(table: DB.TableDefinition): Promise<string>;
    getNodeInfo(): Promise<Node>;
    getTransactionsToReplicate(destNode: string): Promise<number[]>;
    getRowsToReplicate(destNode: string, transaction_number: number, minCode: number): Promise<ReplicationBlock>;
    validateBlock(transactionNumber: number, maxCode: number, destNode: string): Promise<void>;
    replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
    listTables(): Promise<string[]>;
    getTableDef(tableName: string, fullFieldDefs: boolean): Promise<DB.TableDefinition>;
    private doGet<T>(url);
    private doPut<T>(url, obj);
    private doPost<T>(url, obj);
    private doPostEmpty(url);
    private doDelete<T>(url);
    initReplicationMetadata(): Promise<void>;
    clearReplicationMetadata(): Promise<void>;
}

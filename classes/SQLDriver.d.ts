import * as DB from './DB';
import { Driver, ReplicationBlock, ReplicationRecord } from './Driver';
import { TableOptions } from '../interfaces/Nodes';
export declare abstract class SQLDriver extends Driver {
    protected dbDefinition: DB.DatabaseDefinition;
    protected constructor(dbDef: DB.DatabaseDefinition);
    protected abstract isConnected(): boolean;
    protected abstract connect(): void;
    protected abstract disconnect(): void;
    protected abstract inTransaction(): boolean;
    protected abstract startTransaction(): void;
    protected abstract commit(): void;
    protected abstract rollback(): void;
    protected abstract executeSQL(sql: string, fetchResultSet?: boolean, callback?: (record: DB.Record) => boolean | void, params?: Object[]): boolean;
    private processParams(sql, resultParams, namedParams?, unnamedParams?);
    protected query(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[], callback?: (record: DB.Record) => boolean | void): boolean;
    protected exec(sql: string, namedParams?: DB.Field[], unnamedParams?: Object[]): void;
    protected abstract dropTable(tableName: string): void;
    protected abstract tableExists(tableName: string): boolean;
    protected abstract customMetadataExists(objectName: string, objectType: string): boolean;
    protected abstract createCustomMetadata(metadata: DB.CustomMetadataDefinition): void;
    addNode(nodeName: string): void;
    initReplicationMetadata(): Promise<void>;
    clearReplicationMetadata(): Promise<void>;
    protected abstract getTriggerNames(tableName: string): string[];
    protected abstract getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => boolean): void;
    abstract triggerExists(triggerName: string): boolean;
    abstract dropTriggers(tableName: string): void;
    createTriggers(tableOptions: TableOptions): void;
    getTransactionsToReplicate(destNode: string): Promise<number[]>;
    getRowsToReplicate(destNode: string, transaction_number: number, minCode?: number): Promise<ReplicationBlock>;
    protected abstract getFieldType(sqlType: number): DB.DataType;
    protected getChangedFields(change_number: string, nodeName: string): DB.Field[];
    validateBlock(transaction_number: number, maxCode: number, destNode: string): Promise<void>;
    protected abstract setReplicatingNode(origNode: string): void;
    protected abstract checkRowExists(record: ReplicationRecord): boolean;
    protected abstract getDataTypesOfFields(tableName: string, keyName: string[]): DB.DataType[];
    protected abstract parseFieldValue(dataType: DB.DataType, fieldValue: string): Object;
    protected getSQLStatement(record: ReplicationRecord): string;
    private parseKeys(keys);
    private parseKeyValues(tableName, keyNames, keyValues);
    protected getWhereClause(record: ReplicationRecord): string;
    protected getWhereFieldValues(record: ReplicationRecord): Object[];
    replicateBlock(origNode: string, block: ReplicationBlock): Promise<void>;
}

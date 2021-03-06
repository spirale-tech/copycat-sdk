import { DataRow } from "../classes/Driver";
import * as DB from "../classes/DB";
import { SQLDriver } from "../classes/SQLDriver";
import { TableOptions } from "../interfaces/Nodes";
export declare class FirebirdDriver extends SQLDriver {
    protected fbConnection: any;
    private tableDefs;
    connectionParams: {
        database: string;
        databaseVersion: string;
        username: string;
        password: string;
        role: string;
    };
    constructor();
    isConnected(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    inTransaction(): Promise<boolean>;
    startTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    getDataTypesOfFields(tableName: string, keyName: string[]): Promise<DB.DataType[]>;
    private parseDateTime(value);
    parseFieldValue(dataType: DB.DataType, fieldValue: string): Promise<Object>;
    convertAPIFieldType(sqlType: number): DB.DataType;
    getFieldType(sqlType: number): DB.DataType;
    private convertDataType(sqlType, subType);
    checkRowExists(record: DataRow): Promise<boolean>;
    executeSQL(sql: string, autocreateTR: boolean, fetchResultSet: boolean, callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean>;
    dropTable(tableName: string): Promise<void>;
    tableExists(tableName: string): Promise<boolean>;
    triggerExists(triggerName: string): Promise<boolean>;
    private getMaxTableCounter();
    private getTableCounter(tableName);
    private getTriggerName(tableName, counter, trigger_number);
    getDBVersion(): number;
    getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => Promise<boolean>): Promise<void>;
    protected getTriggerNames(tableName: string): Promise<string[]>;
    dropTriggers(tableName: string): Promise<void>;
    private getFieldDef(field);
    createOrUpdateTable(tableDef: DB.TableDefinition): Promise<string>;
    createTable(tableDef: DB.TableDefinition): Promise<string>;
    updateTable(tableDef: DB.TableDefinition): Promise<string>;
    customMetadataExists(objectName: string, objectType: string): Promise<boolean>;
    createCustomMetadata(metadata: DB.CustomMetadataDefinition): Promise<void>;
    setReplicatingNode(origNode: string): Promise<void>;
    listPrimaryKeyFields(tableName: string): Promise<string[]>;
    getTableDef(tableName: string, fullFieldDefs: boolean): Promise<DB.TableDefinition>;
    listTables(): Promise<string[]>;
}

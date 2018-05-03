import * as DB from './DB';
import { SQLDriver } from "./SQLDriver";
import { TableDefinition, CustomMetadataDefinition, DataType } from "./DB";
import { TableOptions } from "../interfaces/Nodes";
import { DataRow } from "./Driver";
import * as MySQL from 'mysql'

export class MySQLDriver extends SQLDriver {    
    connected : boolean = false;
    transactionActive: boolean = false;
    connection : MySQL.Connection
    
 // Connection
 constructor(Config : MySQL.ConnectionConfig) {
    super({
            "databaseType": "MySQL",
            "customMetadata": [],
            "triggerTemplates": []
        });

        this.connection = MySQL.createConnection(Config);        
        this.connection.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });
    }
    
        
    protected async isConnected(): Promise<boolean> {
        return this.connected;
    }
    protected async connect(): Promise<void> {
        await this.connection.connect();
        this.connected = true;
    }
    protected async disconnect(): Promise<void> {
        await this.connection.end();
        this.connected = false;
    }
    protected async inTransaction(): Promise<boolean> {
        return this.transactionActive;
    }
    protected async startTransaction(): Promise<void> {
        await this.connection.query("BEGIN");
        this.transactionActive = true;
    }
    protected async commit(): Promise<void> {
        await this.connection.query("COMMIT");
        this.transactionActive = false;
    }
    protected async rollback(): Promise<void> {
        await this.connection.query("ROLLBACK");
        this.transactionActive = false;
    }
    public async executeSQL(sql: string, autocreateTR: boolean, fetchResultSet?: boolean, 
        callback?: (record: DB.Record) => Promise<boolean | void>, params?: Object[]): Promise<boolean> {                
        let autoStartTR: boolean = autocreateTR && !await this.inTransaction();
        if (autoStartTR)
            await this.startTransaction();
            
        try {
            if (params && params.length > 0) {
                //Preprocess SQL text to change param markers from ? to $1, $2, etc
                let paramIndex = 1;
                sql = sql.replace(/\?/g, (substr) => {
                    return "$" + paramIndex++;
                })
            }
            
            let query = new Promise<boolean>((resolve, reject) =>{
                this.connection.query(sql,(err, results, fields)=>{                
                    if (fetchResultSet) {
                        if (callback) {
                           if(results && results.length > 0) {            
                                let resultIndex = 0;                                    
                                let sendResults = () => {                                       
                                    let record = new DB.Record();
                                    let fieldIndex = 0;
                                    for (let field of fields) {
                                        let fieldname = field.name
                                        let f: DB.Field = record.addField(fieldname)
                                        f.value = results[resultIndex].fieldname
                                        fieldIndex++
                                    }
                                    callback(record).then((result) => {
                                        if ((typeof result === "boolean") && !result)
                                            resolve(true);
                                        else{
                                            resultIndex++
                                            if (resultIndex == results.length) {
                                                resolve(true);
                                            }
                                            else{
                                                sendResults();
                                            }
                                        }
                                    })
                                };
                                sendResults();                                                                                                                         
                            }
                            else{
                               resolve(false);
                            }
                        }
                        else{ 
                            resolve(results.length > 0);
                        }           
                    }
                    else{
                        resolve(true);     
                    } 
                        
                });                            
            });
            let result = await query;
            if (autoStartTR){
                if (await this.inTransaction())
                    this.commit();
            }
            return result;
        }
        catch(E) {
            if (autoStartTR && await this.inTransaction())
                await this.rollback();
            throw E;
        }        
    }
    protected dropTable(tableName: string): Promise<void> {
        this.exec('DROP TABLE IF EXISTS' + tableName.toLowerCase() + ';');
        throw new Error("Method not implemented.");
    }
    protected tableExists(tableName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public async createTable(table: TableDefinition): Promise<string> {  
        let tableDefSQL = 'CREATE TABLE IF NOT EXISTS "' + table.tableName.toLowerCase() + '" ( ' 
        + table.fieldDefs.join(', ') 
        + ((table.primaryKeys.length > 0)? ", primary key (" + table.primaryKeys.map(pk => '"' + pk.trim().toLowerCase() + '"').join(', ') + ")": "")
        + ")";
        this.exec(tableDefSQL)
        throw new Error("Method not implemented.");
    }

    listPrimaryKeyFields(tableName: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    protected customMetadataExists(objectName: string, objectType: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    protected createCustomMetadata(metadata: CustomMetadataDefinition): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected getTriggerNames(tableName: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    protected getTriggerSQL(tableOptions: TableOptions, callback: (triggerName: string, sql: string) => Promise<boolean>): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public triggerExists(triggerName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public dropTriggers(tableName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected getFieldDef(field: DB.FieldDefinition): string {
        let fieldType: string;
        switch (field.dataType) {
            case DB.DataType.String: fieldType = 'varchar(' + field.length.toString() + ")"; break;
            case DB.DataType.FixedChar: fieldType = 'char(' + field.length.toString() + ")"; break;
            case DB.DataType.Integer: fieldType = 'int'; break;
            case DB.DataType.Int64: fieldType = 'bigint'; break;
            case DB.DataType.AutoInc: fieldType = 'auto_increment'; break;
            // case DB.DataType.BCD: fieldType = ''; break;
            case DB.DataType.Float: fieldType = "float"; break;
            case DB.DataType.Boolean: fieldType = 'boolean'; break;
            case DB.DataType.Blob: fieldType = 'blob'; break;
            case DB.DataType.Memo: fieldType = 'text'; break;
            case DB.DataType.Date: fieldType = 'date'; break;
            case DB.DataType.DateTime: fieldType = 'timestamp'; break;
            case DB.DataType.Time: fieldType = 'time'; break;
            case DB.DataType.SmallInt: fieldType = 'smallint'; break;
            default: throw new Error('Data type ' + DB.DataType[field.dataType] + " (" + field.dataTypeStr +") not handle by Firebird!");
        }
        return '"' + field.fieldName.toLowerCase().trim() + '" ' + fieldType + (field.notNull? " not null": "");
    }
    protected setReplicatingNode(origNode: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected checkRowExists(record: DataRow): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    protected getDataTypesOfFields(tableName: string, keyName: string[]): Promise<DataType[]> {
        throw new Error("Method not implemented.");
    }
    protected parseFieldValue(dataType: DataType, fieldValue: string): Promise<Object> {
        throw new Error("Method not implemented.");
    }
    async listTables(): Promise<string[]> {
        let tables: string[] = [];
        await this.query('SELECT table_name FROM information_schema.tables ' +
            "WHERE table_schema NOT IN ('pg_catalog', 'information_schema') " +
            "and table_type in ('BASE TABLE','LOCAL TEMPORARY') ORDER BY table_name", null, null, async (tableRec: DB.Record) => {
                //let tableDef = await this.getTableDef(<string>tableRec.fieldByName('table_name').value, fullFieldDefs);
                tables.push(<string>tableRec.fieldByName('table_name').value);
            });
        return tables;
    }
    public async getTableDef(tableName: string, fullFieldDefs: boolean): Promise<TableDefinition> {
      
        let tableDef = new DB.TableDefinition();

        tableDef.tableName = tableName.toLowerCase();






        throw new Error("Method not implemented.");
    }

    protected getFieldType(sqlType: number): DB.DataType {
        throw new Error("Method not implemented.");
    }
    createOrUpdateTable(table: TableDefinition): Promise<string> {
        throw new Error("Method not implemented.");
    }
}

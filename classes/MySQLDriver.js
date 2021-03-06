"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DB = require("./DB");
const SQLDriver_1 = require("./SQLDriver");
const MySQL = require("mysql");
class MySQLDriver extends SQLDriver_1.SQLDriver {
    // Connection
    constructor(Config) {
        super({
            "databaseType": "MySQL",
            "customMetadata": [],
            "triggerTemplates": []
        });
        this.connected = false;
        this.transactionActive = false;
        this.connection = MySQL.createConnection(Config);
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connected;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.connect();
            this.connected = true;
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.end();
            this.connected = false;
        });
    }
    inTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transactionActive;
        });
    }
    startTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query("BEGIN");
            this.transactionActive = true;
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query("COMMIT");
            this.transactionActive = false;
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.query("ROLLBACK");
            this.transactionActive = false;
        });
    }
    executeSQL(sql, autocreateTR, fetchResultSet, callback, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let autoStartTR = autocreateTR && !(yield this.inTransaction());
            if (autoStartTR)
                yield this.startTransaction();
            try {
                let query = new Promise((resolve, reject) => {
                    this.connection.query(sql, params, (err, results, fields) => {
                        if (err)
                            throw new Error(err.message);
                        if (fetchResultSet) {
                            if (callback) {
                                if (results && results.length > 0) {
                                    let resultIndex = 0;
                                    let sendResults = () => {
                                        let record = new DB.Record();
                                        let fieldIndex = 0;
                                        for (let field of fields) {
                                            let fieldname = field.name;
                                            let f = record.addField(fieldname);
                                            f.value = results[resultIndex][fieldname];
                                            fieldIndex++;
                                        }
                                        callback(record).then((result) => {
                                            if ((typeof result === "boolean") && !result)
                                                resolve(true);
                                            else {
                                                resultIndex++;
                                                if (resultIndex == results.length) {
                                                    resolve(true);
                                                }
                                                else {
                                                    sendResults();
                                                }
                                            }
                                        });
                                    };
                                    sendResults();
                                }
                                else {
                                    resolve(false);
                                }
                            }
                            else {
                                resolve((results && results.length > 0));
                            }
                        }
                        else {
                            resolve(true);
                        }
                    });
                });
                let result = yield query;
                if (autoStartTR) {
                    if (yield this.inTransaction())
                        this.commit();
                }
                return result;
            }
            catch (E) {
                if (autoStartTR && (yield this.inTransaction()))
                    yield this.rollback();
                throw E;
            }
        });
    }
    dropTable(tableName) {
        this.exec('DROP TABLE IF EXISTS ' + tableName.toLowerCase() + ';');
        return;
    }
    tableExists(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.query('SELECT table_name FROM information_schema.tables WHERE table_schema IN (\'copycat\') AND table_name= ?', null, [tableName.toLowerCase()]);
        });
    }
    createTable(tableDef) {
        return __awaiter(this, void 0, void 0, function* () {
            let fieldDefs = [];
            tableDef.fieldDefs.forEach((field) => {
                let fieldDef = this.getFieldDef(field);
                fieldDefs.push(fieldDef);
            });
            let tableDefSQL = 'CREATE TABLE ' + tableDef.tableName.toLowerCase() + ' ( '
                + fieldDefs.join(', ')
                + ((tableDef.primaryKeys.length > 0) ? ", " + tableDef.primaryKeys.map(pk => pk.trim().toLowerCase()).join(', ') + " int(6)  UNSIGNED AUTO_INCREMENT PRIMARY KEY" : "")
                + ")";
            console.log('creating table: ' + tableDefSQL);
            yield this.exec(tableDefSQL);
            yield this.commit();
            return tableDefSQL;
        });
    }
    listPrimaryKeyFields(tableName) {
        throw new Error("Method not implemented.");
    }
    customMetadataExists(objectName, objectType) {
        throw new Error("Method not implemented.");
    }
    createCustomMetadata(metadata) {
        throw new Error("Method not implemented.");
    }
    getTriggerNames(tableName) {
        throw new Error("Method not implemented.");
    }
    getTriggerSQL(tableOptions, callback) {
        throw new Error("Method not implemented.");
    }
    triggerExists(triggerName) {
        throw new Error("Method not implemented.");
    }
    dropTriggers(tableName) {
        throw new Error("Method not implemented.");
    }
    getFieldDef(field) {
        let fieldType;
        switch (field.dataType) {
            case DB.DataType.String:
                fieldType = 'varchar(50)';
                break;
            case DB.DataType.FixedChar:
                fieldType = 'char(' + field.length.toString() + ")";
                break;
            case DB.DataType.Integer:
                fieldType = 'int';
                break;
            case DB.DataType.Int64:
                fieldType = 'bigint';
                break;
            case DB.DataType.AutoInc:
                fieldType = 'auto_increment';
                break;
            // case DB.DataType.BCD: fieldType = ''; break;
            case DB.DataType.Float:
                fieldType = "float";
                break;
            case DB.DataType.Boolean:
                fieldType = 'boolean';
                break;
            case DB.DataType.Blob:
                fieldType = 'blob';
                break;
            case DB.DataType.Memo:
                fieldType = 'text';
                break;
            case DB.DataType.Date:
                fieldType = 'date';
                break;
            case DB.DataType.DateTime:
                fieldType = 'timestamp';
                break;
            case DB.DataType.Time:
                fieldType = 'time';
                break;
            case DB.DataType.SmallInt:
                fieldType = 'smallint';
                break;
        }
        return field.fieldName.toLowerCase().trim() + ' ' + fieldType + (field.notNull ? " not null" : "");
    }
    setReplicatingNode(origNode) {
        throw new Error("Method not implemented.");
    }
    checkRowExists(record) {
        throw new Error("Method not implemented.");
    }
    getDataTypesOfFields(tableName, keyName) {
        throw new Error("Method not implemented.");
    }
    parseFieldValue(dataType, fieldValue) {
        throw new Error("Method not implemented.");
    }
    listTables() {
        return __awaiter(this, void 0, void 0, function* () {
            let tables = [];
            yield this.query('SELECT table_name FROM information_schema.tables' +
                " WHERE table_schema IN ('copycat', 'information_schema')" +
                " and table_type in ('BASE TABLE','LOCAL TEMPORARY') ORDER BY table_name", null, null, (tableRec) => __awaiter(this, void 0, void 0, function* () {
                //let tableDef = await this.getTableDef(<string>tableRec.fieldByName('table_name').value, fullFieldDefs);
                tables.push(tableRec.fieldByName('table_name').value);
            }));
            return tables;
        });
    }
    getTableDef(tableName, fullFieldDefs) {
        return __awaiter(this, void 0, void 0, function* () {
            let tableDef = new DB.TableDefinition();
            tableDef.tableName = tableName.toLowerCase();
            tableDef.fieldDefs = [];
            yield this.query("SELECT column_name, is_nullable FROM information_schema.columns c WHERE table_name = ?" +
                " AND EXISTS (SELECT * FROM information_schema.tables t WHERE table_type = 'BASE TABLE' AND c.table_name = t.table_name)", null, [tableDef.tableName], (fieldRec) => __awaiter(this, void 0, void 0, function* () {
                let fieldDef = new DB.FieldDefinition();
                fieldDef.fieldName = fieldRec.fieldByName('column_name').value.toLowerCase();
                if (fullFieldDefs) {
                    fieldDef.dataType = DB.DataType.String;
                    fieldDef.notNull = (fieldRec.fieldByName('is_nullable').value == 'NO');
                    fieldDef.precision = 0;
                    fieldDef.scale = 0;
                    fieldDef.length = 0;
                    fieldDef.autoInc = false;
                }
                tableDef.fieldDefs.push(fieldDef);
            }));
            if (fullFieldDefs)
                tableDef.primaryKeys = [];
            return tableDef;
        });
    }
    updateTable(tableDef) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingTable = yield this.getTableDef(tableDef.tableName, false);
            let fieldDefs = [];
            tableDef.fieldDefs.forEach((field) => {
                if (!existingTable.fieldDefs.find((f) => (f.fieldName.toLowerCase() == field.fieldName.toLowerCase()))) {
                    let fieldDef = this.getFieldDef(field);
                    fieldDefs.push(' ADD ' + fieldDef);
                }
                if (existingTable.fieldDefs.find((f) => (f.fieldName.toLowerCase() == field.fieldName.toLowerCase()))) {
                    let fieldDef = this.getFieldDef(field);
                    fieldDefs.push(' MODIFY COLUMN ' + fieldDef);
                }
            });
            let tableDefSQL = 'ALTER TABLE ' + tableDef.tableName.toLowerCase()
                + fieldDefs.join(', ');
            console.log('altering table: ' + tableDefSQL);
            this.exec(tableDefSQL);
            this.commit();
            return tableDefSQL;
        });
    }
    getFieldType(sqlType) {
        throw new Error("Method not implemented.");
    }
    createOrUpdateTable(tableDef) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.tableExists(tableDef.tableName))
                return yield this.updateTable(tableDef);
            else
                return yield this.createTable(tableDef);
        });
    }
}
exports.MySQLDriver = MySQLDriver;
//# sourceMappingURL=MySQLDriver.js.map
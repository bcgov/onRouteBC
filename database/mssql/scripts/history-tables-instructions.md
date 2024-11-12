# History Tables and Triggers
MoTI database standards dictate a specific approach for maintaining history of database changes. This is handled in ORBC with 'mirror' history tables, named identically to the base table with a _HIST suffix.

The history tables are populated on each insert, update, and delete operation via a trigger on the base table which inserts a new row into the history table for every action.

The history tables rely on a database sequence to generate their unique identifier (as opposed to identity columns which are typically used in ORBC for this purpose in the base tables).

## New Tables
Each new table created in the ORBC database which is not a 'lookup' or 'type' table will need three additional objects created alongside: a history table, a trigger, and a sequence.

For new tables, the SQL to generate these three objects can be retrieved by running the generate-history-tables-and-triggers.sql file in your local (docker) development database once the new business tables are in place. The .sql file will generate the DDL for all base tables in the database, not just the new ones you've added, so you will need to search the output for your new table name to find the three objects. You can ignore the rest.

The name of the trigger that the .sql generates in the DDL is not appropriate - you will need to come up with an appropriate name for the trigger that is based on a shortened version of the base table name. Refer to the other triggers in the database for guidance - it isn't critical that it be done a certain way just that it be fairly consistent with the rest of the trigger names, and that it be unique in the database.

## Updated Tables
When a table is updated in ORBC to add or remove columns, to change the data type of the column, or to change a column from nullable to non-nullable, more manual effort is required.

__Important__: when copying the DDL that's generated from the attached .sql script, __do not__ copy the 'drop table' or 'drop sequence' components. History tables, once modified, are to remain permanently in the database. For sequences, if it is dropped and re-created it will start at 1 again which will generate errors.

### Column Additions
New columns must be added to both the history table and the trigger. You can use the generated DDL for guidance with how to add it, or you can add it in manually if just one or two columns (probably easier that way).

### Column Deletions
Deleted columns must be removed from the trigger, but should remain in the history table. Never delete any columns with data from the history tables, they will remain in perpetuity.

### Column Renames
However the column rename is done in the base table DDL is how it should be done also in the history table DDL. The trigger will also need to be updated to reflect the new column name, though this is just a text modification to the trigger DDL and not as complex as the table rename.

### Column Data Type Changes
As with the column renames, the column data type changes must be done in the history table in the same way as it is done in the base table (avoidance of data loss / truncation is important). No changes need to be made to the trigger DDL.

### Column NULL / NOT NULL Switches
Columns changing from NOT NULL to NULL require that the same change be done to the history table. No changes are required to the trigger.

Columns changing from NULL to NOT NULL require __no__ changes to the history table to avoid creating fake 'history' data where null is appropriate. No changes are required to the trigger.
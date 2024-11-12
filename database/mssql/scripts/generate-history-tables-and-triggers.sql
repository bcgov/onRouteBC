SET XACT_ABORT, NOCOUNT ON

-- --------------------------------------------------------------------------------------------
-- Drop function fnFirsties 
-- --------------------------------------------------------------------------------------------
IF OBJECT_ID ( 'fnFirsties', 'FN' ) IS NOT NULL   
  drop FUNCTION dbo.fnFirsties;
go

-- --------------------------------------------------------------------------------------------
-- Create function fnFirsties 
-- --------------------------------------------------------------------------------------------
CREATE FUNCTION dbo.fnFirsties ( @str NVARCHAR(4000) )
RETURNS NVARCHAR(max)
AS
BEGIN
    DECLARE @retval NVARCHAR(2000);

    SET @str    = RTRIM(LTRIM(@str));
    SET @retval = LEFT(@str, 1);

    WHILE CHARINDEX(' ',@str,1)>0 BEGIN
        SET @str    = LTRIM(RIGHT(@str, LEN(@str) - CHARINDEX(' ', @str, 1)));
        SET @retval = LEFT(@str, 1);
    END

    RETURN @retval;
END
GO

-- --------------------------------------------------------------------------------------------
-- Drop function fnGetColumnsString 
-- --------------------------------------------------------------------------------------------
IF OBJECT_ID ( 'fnGetColumnsString', 'FN' ) IS NOT NULL   
  drop FUNCTION dbo.fnGetColumnsString;
go

-- --------------------------------------------------------------------------------------------
-- Create function fnGetColumnsString 
-- --------------------------------------------------------------------------------------------
CREATE FUNCTION dbo.fnGetColumnsString ( @str NVARCHAR(4000) )
RETURNS NVARCHAR(max)
AS
BEGIN
  DECLARE @retval NVARCHAR(max) = '';

  declare @statement_sql cursor
  set @statement_sql = cursor for
    select   COLUMN_NAME
	         , data_type
		       , CHARACTER_MAXIMUM_LENGTH
		       , IS_NULLABLE 
	  from     INFORMATION_SCHEMA.COLUMNS
    where    TABLE_NAME                            =  @str
	       and DATA_TYPE                             != 'varbinary' 
		     and coalesce(character_maximum_length, 1) != -1
    order by table_name
	         , ORDINAL_POSITION;

  declare @sql_txt1 nvarchar(max) = '';
  declare @sql_txt2 nvarchar(max) = '';
  declare @sql_txt3 nvarchar(max) = '';
  declare @sql_txt4 nvarchar(max) = '';
  
  OPEN @statement_sql
  
  FETCH NEXT
  FROM @statement_sql INTO @sql_txt1, @sql_txt2, @sql_txt3, @sql_txt4
  
  WHILE @@FETCH_STATUS = 0
    BEGIN
    set @retval += ', [' + @sql_txt1 + '] ' + @sql_txt2 + case when @sql_txt2 in ('char', 'nchar', 'varchar','nvarchar') then '(' + @sql_txt3 + ')' else '' end +case when @sql_txt4 = 'NO' then ' NOT' else ''  end+' NULL';
    FETCH NEXT
    FROM @statement_sql INTO @sql_txt1, @sql_txt2, @sql_txt3, @sql_txt4
    END

  CLOSE @statement_sql
  DEALLOCATE @statement_sql

  RETURN @retval;
END
GO

--:OUT "G:\OneDrive\Documents\LMS Biz\Quartech\MOTI\PSP\Data Model\Build\Working\ORBC_generate_history_table.sql"

begin
declare @statement_sql cursor
set @statement_sql = cursor for
  select N'IF OBJECT_ID (''' + isnull(convert(varchar(max), p.value), stuff(dbo.fnFirsties(replace(t.name, '_', ' ')), 1, 1, '') + cast(row_number() over (order by t.name asc) as varchar(max))) + '_A_S_IUD_TR'', ''TR'') IS NOT NULL   
  drop trigger ' + isnull(convert(varchar(max), p.value), stuff(dbo.fnFirsties(replace(t.name, '_', ' ')), 1, 1, '') + cast(row_number() over (order by t.name asc) as varchar(max))) + '_A_S_IUD_TR
go

IF OBJECT_ID (''' + t.name + '_HIST'', ''U'') IS NOT NULL   
  drop table ' + t.name + '_HIST
go

IF OBJECT_ID (''' + t.name + '_H_ID_SEQ'', ''SO'') IS NOT NULL   
  drop sequence ' + t.name + '_H_ID_SEQ
go

'
from  sys.tables  t                                   join
      sys.schemas s on s.schema_id = t.schema_id left join 
      (select table_alias COLLATE catalog_default value
            , table_name  COLLATE catalog_default table_name 
       from   ORBCX_TableDefinitions) p on t.name COLLATE catalog_default = p.table_name COLLATE catalog_default,
      INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc -- INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE t.TYPE_desc        =        'USER_TABLE'
  and t.NAME             like     'ORBC_%'
  and tc.table_name      =        t.name
  and tc.CONSTRAINT_TYPE =        'PRIMARY KEY'
  and t.NAME             not like '%HIST'
  and t.NAME             not like 'ORBCX%'
  and t.NAME             not like '%EFMigration%'
  and t.NAME             not like 'ETL%'
  and t.NAME             not like 'PMBC%'
  and t.NAME             not like '%SYS_VERS%'
  -- code value (type and subtype) tables
  and t.NAME             not like '%TYPE'
  and t.NAME             not like '%SUBTYPE'
  -- tables that do no have APP audit attributes
  and t.name             !=       'ORBC_COUNTRY'
  and t.name             !=       'ORBC_DISTRICT'
  and t.name             !=       'ORBC_PROVINCE_STATE'
  and t.name             !=       'ORBC_REGION'
  and t.name             !=       'ORBC_TENANT'
  and s.name             !=       'tps'
order by t.name;  

declare @sql_txt varchar(max) = '';

OPEN @statement_sql

FETCH NEXT
FROM @statement_sql INTO @sql_txt

WHILE @@FETCH_STATUS = 0
    BEGIN
    print @sql_txt
    FETCH NEXT
    FROM @statement_sql INTO @sql_txt
    END

CLOSE @statement_sql
DEALLOCATE @statement_sql

set @statement_sql = cursor for
select N'CREATE SEQUENCE [' + s.name + '].[' + t.name + '_H_ID_SEQ] AS [bigint] START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 50;

CREATE TABLE [' + s.name + '].[' + t.name + '_HIST](
  '+substring(t.name, 5, len(t.name)) + '_HIST_ID [bigint] DEFAULT (NEXT VALUE FOR [' + s.name + '].['  + t.name + '_H_ID_SEQ]) NOT NULL
  ,EFFECTIVE_DATE_HIST [datetime] NOT NULL default getutcdate()
  ,END_DATE_HIST [datetime]
  '+dbo.fnGetColumnsString(t.name)+'
  )
ALTER TABLE [' + s.name + '].[' + t.name + '_HIST] ADD CONSTRAINT ' + isnull(convert(varchar(max), substring(cast(p.value as varchar), 1, 11)), 'ORBC_' + stuff(dbo.fnFirsties(replace(t.name, '_', ' ')), 1, 1, '') + cast(row_number() over (order by t.name asc) as varchar(max))) + '_H_PK PRIMARY KEY CLUSTERED (' + substring(t.name, 5, len(t.name)) + '_HIST_ID);  
ALTER TABLE [' + s.name + '].[' + t.name + '_HIST] ADD CONSTRAINT ' + isnull(convert(varchar(max), substring(cast(p.value as varchar), 1, 11)), 'ORBC_' + stuff(dbo.fnFirsties(replace(t.name, '_', ' ')), 1, 1, '') + cast(row_number() over (order by t.name asc) as varchar(max))) + '_H_UK UNIQUE (' + substring(t.name, 5, len(t.name)) + '_HIST_ID,END_DATE_HIST)
go

'
from  sys.tables  t                                   join
      sys.schemas s on s.schema_id = t.schema_id left join
      (select table_alias COLLATE catalog_default value
            , table_name  COLLATE catalog_default table_name 
       from   ORBCX_TableDefinitions) p on t.name COLLATE catalog_default = p.table_name COLLATE catalog_default,
       INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc --INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE t.TYPE_desc        =        'USER_TABLE'
  and t.NAME             like     'ORBC_%'
  and tc.table_name      =        t.name
  and tc.CONSTRAINT_TYPE =        'PRIMARY KEY'
  and t.NAME             not like '%HIST'
  and t.NAME             not like 'ORBCX%'
  and t.NAME             not like '%EFMigration%'
  and t.NAME             not like 'ETL%'
  and t.NAME             not like 'PMBC%'
  and t.NAME             not like '%SYS_VERS%'
  -- code value (type and subtype) tables
  and t.NAME             not like '%TYPE'
  and t.NAME             not like '%SUBTYPE'
  -- tables that do no have APP audit attributes
  and t.name             !=       'ORBC_COUNTRY'
  and t.name             !=       'ORBC_DISTRICT'
  and t.name             !=       'ORBC_PROVINCE_STATE'
  and t.name             !=       'ORBC_REGION'
  and t.name             !=       'ORBC_TENANT'
  and s.name             !=       'tps'
order by 1;

OPEN @statement_sql
FETCH NEXT
FROM @statement_sql INTO @sql_txt
WHILE @@FETCH_STATUS = 0
BEGIN
    print @sql_txt
    FETCH NEXT
    FROM @statement_sql INTO @sql_txt
END

CLOSE @statement_sql
DEALLOCATE @statement_sql

end
-- ............................................................................................

--drop function dbo.fnFirsties;
--drop function fnGetColumnsString;

------------------------------------------------
SET XACT_ABORT, NOCOUNT ON


-- --------------------------------------------------------------------------------------------
-- Drop function fnFirsties 
-- --------------------------------------------------------------------------------------------
IF OBJECT_ID ( 'fnFirsties', 'FN' ) IS NOT NULL   
  drop FUNCTION dbo.fnFirsties;
go
-- ............................................................................................


-- --------------------------------------------------------------------------------------------
-- Create function fnFirsties 
-- --------------------------------------------------------------------------------------------
CREATE FUNCTION dbo.fnFirsties ( @str NVARCHAR(4000) )
RETURNS NVARCHAR(max)
AS
BEGIN
    DECLARE @retval NVARCHAR(2000);

    SET @str=RTRIM(LTRIM(@str));
    SET @retval=LEFT(@str,1);

    WHILE CHARINDEX(' ',@str,1)>0 BEGIN
        SET @str=LTRIM(RIGHT(@str,LEN(@str)-CHARINDEX(' ',@str,1)));
        SET @retval+=LEFT(@str,1);
    END

    RETURN @retval;
END
GO
-- ............................................................................................


-- --------------------------------------------------------------------------------------------
-- Drop function fnGetColumnsString2 
-- --------------------------------------------------------------------------------------------
IF OBJECT_ID ( 'fnGetColumnsString2', 'FN' ) IS NOT NULL   
  drop FUNCTION dbo.fnGetColumnsString2;
go
-- ............................................................................................


-- --------------------------------------------------------------------------------------------
-- Create function fnGetColumnsString2 
-- --------------------------------------------------------------------------------------------
CREATE FUNCTION dbo.fnGetColumnsString2 ( @str NVARCHAR(4000) )
RETURNS NVARCHAR(max)
AS
BEGIN
  DECLARE @retval NVARCHAR(max) = '';

  declare @statement_sql cursor
  set @statement_sql = cursor for
  select COLUMN_NAME from INFORMATION_SCHEMA.columns 
    where TABLE_NAME = @str
	and   DATA_TYPE != 'varbinary' and coalesce(character_maximum_length,1) != -1
    order by table_name, ORDINAL_POSITION;

  declare @sql_txt1 nvarchar(max) = '';
  OPEN @statement_sql
  FETCH NEXT
  FROM @statement_sql INTO @sql_txt1
  WHILE @@FETCH_STATUS = 0
  begin
    set @retval = @retval + '['+ @sql_txt1+'], ';
  FETCH NEXT
  FROM @statement_sql INTO @sql_txt1
  END

  CLOSE @statement_sql
  DEALLOCATE @statement_sql

  RETURN @retval;
END
GO
-- ............................................................................................

--:OUT "G:\OneDrive\Documents\LMS Biz\Quartech\MOTI\PSP\Data Model\Build\Working\ORBC_iud_trigger.sql"

begin

declare @statement_sql cursor
declare @sql_txt varchar(max) = '';
--declare @previous_sql_txt varchar(max) = '';

set @statement_sql = cursor for
select distinct N'CREATE TRIGGER '+isnull(convert(varchar(max),p.value), stuff(dbo.fnFirsties(replace(t.name,'_',' ')),1,1,'')+cast(row_number()over(order by t.name asc) as varchar(max)))+'_A_S_IUD_TR ON [' + s.name + '].[' + t.name + '] FOR INSERT, UPDATE, DELETE AS
SET NOCOUNT ON
BEGIN TRY
DECLARE @curr_date datetime;
SET @curr_date = getutcdate();
  IF NOT EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted) 
    RETURN;

  -- historical
  IF EXISTS(SELECT * FROM deleted)
    update [' + s.name + '].[' + t.name + '_HIST] set END_DATE_HIST = @curr_date where ' + ccu.COLUMN_NAME + ' in (select ' + ccu.COLUMN_NAME + ' from deleted) and END_DATE_HIST is null;
  
  IF EXISTS(SELECT * FROM inserted)
    insert into [' + s.name + '].[' + t.name + '_HIST] (' + dbo.fnGetColumnsString2(t.name) + substring(t.name, 5, len(t.name)) + '_HIST_ID, END_DATE_HIST, EFFECTIVE_DATE_HIST)
      select ' + dbo.fnGetColumnsString2(t.name) + '(next value for [' + s.name + '].[' + t.name + '_H_ID_SEQ]) as ['+substring(t.name, 5, len(t.name)) + '_HIST_ID], null as [END_DATE_HIST], @curr_date as [EFFECTIVE_DATE_HIST] from inserted;

END TRY
BEGIN CATCH
   IF @@trancount > 0 ROLLBACK TRANSACTION
   EXEC orbc_error_handling
END CATCH;
go

'
from  sys.tables  t                                   join
      sys.schemas s on s.schema_id = t.schema_id left join
      (select table_alias COLLATE catalog_default value
            , table_name  COLLATE catalog_default table_name 
       from   ORBCX_TableDefinitions) p on t.name COLLATE catalog_default = p.table_name COLLATE catalog_default,
       INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE t.TYPE_desc        =        'USER_TABLE'
  and t.NAME             like     'ORBC_%'
  and tc.table_name      =        t.name
  and tc.CONSTRAINT_TYPE =        'PRIMARY KEY'
  and t.NAME             not like '%HIST'
  and t.NAME             not like 'ORBCX%'
  and t.NAME             not like '%EFMigration%'
  and t.NAME             not like 'ETL%'
  and t.NAME             not like 'PMBC%'
  and t.NAME             not like '%SYS_VERS%'
  -- code value (type and subtype) tables
  and t.NAME             not like '%TYPE'
  and t.NAME             not like '%SUBTYPE'
  -- tables that do no have APP audit attributes
  and t.name             !=       'ORBC_COUNTRY'
  and t.name             !=       'ORBC_DISTRICT'
  and t.name             !=       'ORBC_PROVINCE_STATE'
  and t.name             !=       'ORBC_REGION'
  and t.name             !=       'ORBC_TENANT'
  and s.name             !=       'tps'
order by 1;

OPEN @statement_sql
FETCH NEXT
FROM @statement_sql INTO @sql_txt
WHILE @@FETCH_STATUS = 0
BEGIN	
	print @sql_txt	
    FETCH NEXT
    FROM @statement_sql INTO @sql_txt
END

CLOSE @statement_sql
DEALLOCATE @statement_sql

end

-- --------------------------------------------------------------------------------------------
-- Drop functions created earlier 
-- --------------------------------------------------------------------------------------------

drop function dbo.fnFirsties;
drop function fnGetColumnsString;
drop function fnGetColumnsString2;
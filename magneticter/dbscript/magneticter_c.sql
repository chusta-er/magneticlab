-- THIS SCRIPT IS INTENDED TO BE EXECUTED WITH:
--    sudo -u postgres psql -f magneticter_c.sql ---> from the shell.
-- or
--    \i magneticter_c.sql                       ---> from within psql (assumed user postgres).
-- It creates a database and a user, in POSTGRESQL, both called "magneticter".
--
-- Once in psql:
-- - Help about SQL \h [<keyword>]
-- - Help about metacommands: \?
--
-- list databases with \l
-- list roles (users) with \dg
-- encoding is default: UTF8 (check it with '\encoding')
-- show current connection parameters with '\conninfo'
--
-- In order to delete the database and its owner:
-- - DROP DATABASE magneticter;
-- - DROP USER magneticter;
--
-- This database is created as superuser: "postgres"
-- however is accessed for writting (and catalog creation) as "magneticter"
-- and for reading as "www-data", which is the user nginx and php execute
-- under, or should be configured to do so.

CREATE USER magneticter;
CREATE USER "www-data";
CREATE DATABASE magneticter OWNER=magneticter;

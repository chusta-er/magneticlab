-- THIS SCRIPT IS INTENDED TO BE EXECUTED WITH:
--    sudo -u magneticter psql -f magneticter.sql ---> from the shell.
-- or
--    \i magneticter.sql                          ---> from within psql (assumed user magneticter).
-- It creates the catalog in the 'magneticter' database.
--
-- Once in psql:
-- - Help about SQL \h [<keyword>]
-- - Help about metacommands: \?
--
-- encoding is default: UTF8 (check it with '\encoding')
-- show current connection parameters with '\conninfo'

CREATE TABLE IF NOT EXISTS exec_instance (
    instance_id UUID PRIMARY KEY NOT NULL,
    exec_id     SERIAL UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS magnetic_info (
    id             SERIAL PRIMARY KEY NOT NULL,
    exec_id        INTEGER REFERENCES exec_instance(exec_id),
    timer_secs     BIGINT  NOT NULL,
    timer_nsecs    BIGINT  NOT NULL,
    sys_time_secs  BIGINT  NOT NULL,
    sys_time_usecs INTEGER NOT NULL,
    num_samples    INTEGER NOT NULL,
    b_mean         INTEGER NOT NULL,
    b_median       INTEGER NOT NULL,
    b_median_x     INTEGER NOT NULL,
    b_median_y     INTEGER NOT NULL,
    b_median_z     INTEGER NOT NULL,
    b_min          INTEGER NOT NULL,
    b_min_x        INTEGER NOT NULL,
    b_min_y        INTEGER NOT NULL,
    b_min_z        INTEGER NOT NULL,
    b_max          INTEGER NOT NULL,
    b_max_x        INTEGER NOT NULL,
    b_max_y        INTEGER NOT NULL,
    b_max_z        INTEGER NOT NULL,
    b_x_mean       INTEGER NOT NULL,
    b_x_median     INTEGER NOT NULL,
    b_x_max        INTEGER NOT NULL,
    b_x_min        INTEGER NOT NULL,
    b_y_mean       INTEGER NOT NULL,
    b_y_median     INTEGER NOT NULL,
    b_y_max        INTEGER NOT NULL,
    b_y_min        INTEGER NOT NULL,
    b_z_mean       INTEGER NOT NULL,
    b_z_median     INTEGER NOT NULL,
    b_z_max        INTEGER NOT NULL,
    b_z_min        INTEGER NOT NULL,
    sens_temp_min  SMALLINT NOT NULL,
    sens_temp_max  SMALLINT NOT NULL,
    sens_temp_med  SMALLINT NOT NULL,
    bat_min        SMALLINT NOT NULL,
    bat_max        SMALLINT NOT NULL,
    bat_med        SMALLINT NOT NULL,
    sys_temp_min   SMALLINT NOT NULL,
    sys_temp_max   SMALLINT NOT NULL,
    sys_temp_med   SMALLINT NOT NULL
);

CREATE OR REPLACE FUNCTION insert_full_register
(
    instance       UUID,
    timer_secs     BIGINT,
    timer_nsecs    BIGINT,
    sys_time_secs  BIGINT,
    sys_time_usecs INTEGER,
    num_samples    INTEGER,
    b_mean         INTEGER,
    b_median       INTEGER,
    b_median_x     INTEGER,
    b_median_y     INTEGER,
    b_median_z     INTEGER,
    b_min          INTEGER,
    b_min_x        INTEGER,
    b_min_y        INTEGER,
    b_min_z        INTEGER,
    b_max          INTEGER,
    b_max_x        INTEGER,
    b_max_y        INTEGER,
    b_max_z        INTEGER,
    b_x_mean       INTEGER,
    b_x_median     INTEGER,
    b_x_max        INTEGER,
    b_x_min        INTEGER,
    b_y_mean       INTEGER,
    b_y_median     INTEGER,
    b_y_max        INTEGER,
    b_y_min        INTEGER,
    b_z_mean       INTEGER,
    b_z_median     INTEGER,
    b_z_max        INTEGER,
    b_z_min        INTEGER,
    sens_temp_min  SMALLINT,
    sens_temp_max  SMALLINT,
    sens_temp_med  SMALLINT,
    bat_min        SMALLINT,
    bat_max        SMALLINT,
    bat_med        SMALLINT,
    sys_temp_min   SMALLINT,
    sys_temp_max   SMALLINT,
    sys_temp_med   SMALLINT
)
RETURNS void AS
$$
    DECLARE
        id INTEGER;
    BEGIN
        SELECT exec_id INTO id FROM exec_instance WHERE instance_id=instance;
        IF id IS NULL
        THEN
            INSERT INTO exec_instance VALUES (instance) RETURNING exec_id INTO id;
        END IF;
        INSERT INTO magnetic_info
        (exec_id, timer_secs, timer_nsecs, sys_time_secs, sys_time_usecs,
         num_samples,
         b_mean, b_median, b_median_x, b_median_y, b_median_z, b_min, b_min_x, b_min_y, b_min_z, b_max, b_max_x, b_max_y, b_max_z,
         b_x_mean, b_x_median, b_x_max, b_x_min,
         b_y_mean, b_y_median, b_y_max, b_y_min,
         b_z_mean, b_z_median, b_z_max, b_z_min,
         sens_temp_min, sens_temp_max, sens_temp_med,
         bat_min, bat_max, bat_med,
         sys_temp_min, sys_temp_max, sys_temp_med)
        VALUES
        (id, timer_secs, timer_nsecs, sys_time_secs, sys_time_usecs,
         num_samples,
         b_mean, b_median, b_median_x, b_median_y, b_median_z, b_min, b_min_x, b_min_y, b_min_z, b_max, b_max_x, b_max_y, b_max_z,
         b_x_mean, b_x_median, b_x_max, b_x_min,
         b_y_mean, b_y_median, b_y_max, b_y_min,
         b_z_mean, b_z_median, b_z_max, b_z_min,
         sens_temp_min, sens_temp_max, sens_temp_med,
         bat_min, bat_max, bat_med,
         sys_temp_min, sys_temp_max, sys_temp_med);
        RETURN;
    END;
$$
LANGUAGE plpgsql;

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

CREATE TABLE IF NOT EXISTS timing (
    exec_id        INTEGER REFERENCES exec_instance(exec_id),
    time_id        SERIAL PRIMARY KEY NOT NULL,
    timer_secs     BIGINT NOT NULL,
    timer_nsecs    BIGINT NOT NULL,
    sys_time_secs  BIGINT NOT NULL,
    sys_time_usecs INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS magnetic_info (
    time_id       INTEGER REFERENCES timing(time_id),
    num_samples   INTEGER NOT NULL,
    b_mean        INTEGER NOT NULL,
    b_std         INTEGER NOT NULL,
    b_median      INTEGER NOT NULL,
    b_median_x    INTEGER NOT NULL,
    b_median_y    INTEGER NOT NULL,
    b_median_z    INTEGER NOT NULL,
    b_min         INTEGER NOT NULL,
    b_min_x       INTEGER NOT NULL,
    b_min_y       INTEGER NOT NULL,
    b_min_z       INTEGER NOT NULL,
    b_max         INTEGER NOT NULL,
    b_max_x       INTEGER NOT NULL,
    b_max_y       INTEGER NOT NULL,
    b_max_z       INTEGER NOT NULL,
    b_x_mean      INTEGER NOT NULL,
    b_x_std       INTEGER NOT NULL,
    b_x_median    INTEGER NOT NULL,
    b_x_max       INTEGER NOT NULL,
    b_x_min       INTEGER NOT NULL,
    b_y_mean      INTEGER NOT NULL,
    b_y_std       INTEGER NOT NULL,
    b_y_median    INTEGER NOT NULL,
    b_y_max       INTEGER NOT NULL,
    b_y_min       INTEGER NOT NULL,
    b_z_mean      INTEGER NOT NULL,
    b_z_std       INTEGER NOT NULL,
    b_z_median    INTEGER NOT NULL,
    b_z_max       INTEGER NOT NULL,
    b_z_min       INTEGER NOT NULL,
    sens_temp_min SMALLINT NOT NULL,
    sens_temp_max SMALLINT NOT NULL,
    sens_temp_med SMALLINT NOT NULL,
    bat_min       SMALLINT NOT NULL,
    bat_max       SMALLINT NOT NULL,
    bat_med       SMALLINT NOT NULL,
    sys_temp_min  SMALLINT NOT NULL,
    sys_temp_max  SMALLINT NOT NULL,
    sys_temp_med  SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS gps_info (
    time_id        INTEGER REFERENCES timing(time_id),
    time_ref       INTEGER NOT NULL,
    num_samples    INTEGER NOT NULL,
    latitute_mean  FLOAT4 NOT NULL,
    latitute_std   FLOAT4 NOT NULL,
    latitute_med   FLOAT4 NOT NULL,
    latitute_min   FLOAT4 NOT NULL,
    latitute_max   FLOAT4 NOT NULL,
    longitude_mean FLOAT4 NOT NULL,
    longitude_std  FLOAT4 NOT NULL,
    longitude_med  FLOAT4 NOT NULL,
    longitude_min  FLOAT4 NOT NULL,
    longitude_max  FLOAT4 NOT NULL,
    altitude_mean  FLOAT4 NOT NULL,
    altitude_std   FLOAT4 NOT NULL,
    altitude_med   FLOAT4 NOT NULL,
    altitude_min   FLOAT4 NOT NULL,
    altitude_max   FLOAT4 NOT NULL
);

CREATE TABLE IF NOT EXISTS chrony_info (
    time_id     INTEGER REFERENCES timing(time_id),
    time_ref    INTEGER NOT NULL,
    stratum     INTEGER NOT NULL,
    last_offset FLOAT8 NOT NULL,
    rms_offset  FLOAT8 NOT NULL
);

CREATE OR REPLACE FUNCTION insert_full_register
(
    -- execution uuid
    instance       UUID,
 
    -- timing info.
    timer_secs     BIGINT,
    timer_nsecs    BIGINT,
    sys_time_secs  BIGINT,
    sys_time_usecs INTEGER,

    -- magnetic info.
    num_samples_b  INTEGER,
    b_mean         INTEGER,
    b_std          INTEGER,
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
    b_x_std        INTEGER,
    b_x_median     INTEGER,
    b_x_max        INTEGER,
    b_x_min        INTEGER,
    b_y_mean       INTEGER,
    b_y_std        INTEGER,
    b_y_median     INTEGER,
    b_y_max        INTEGER,
    b_y_min        INTEGER,
    b_z_mean       INTEGER,
    b_z_std        INTEGER,
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
    sys_temp_med   SMALLINT,

    -- gps info.
    time_ref_g     INTEGER,
    num_samples_g  INTEGER,
    latitute_mean  FLOAT4,
    latitute_std   FLOAT4,
    latitute_med   FLOAT4,
    latitute_min   FLOAT4,
    latitute_max   FLOAT4,
    longitude_mean FLOAT4,
    longitude_std  FLOAT4,
    longitude_med  FLOAT4,
    longitude_min  FLOAT4,
    longitude_max  FLOAT4,
    altitude_mean  FLOAT4,
    altitude_std   FLOAT4,
    altitude_med   FLOAT4,
    altitude_min   FLOAT4,
    altitude_max   FLOAT4,

    -- chrony info.
    time_ref_c  INTEGER,
    stratum     INTEGER,
    last_offset FLOAT8,
    rms_offset  FLOAT8
)
RETURNS void AS
$$
    DECLARE
        id INTEGER;
    BEGIN
        -- Add uuid to exec_instance if not done yet
        SELECT exec_id INTO id FROM exec_instance WHERE instance_id=instance;
        IF id IS NULL
        THEN
            INSERT INTO exec_instance VALUES (instance) RETURNING exec_id INTO id;
        END IF;
        
        -- Insert timing information
        INSERT INTO timing
        (exec_id, timer_secs, timer_nsecs, sys_time_secs, sys_time_usecs)
        VALUES
        (id, timer_secs, timer_nsecs, sys_time_secs, sys_time_usecs)
        RETURNING time_id INTO id;

        -- Insert B field information
        IF num_samples_b IS NOT NULL
        THEN
            INSERT INTO magnetic_info
            VALUES
            (id, num_samples_b,
             b_mean, b_std, b_median, b_median_x, b_median_y, b_median_z, b_min, b_min_x, b_min_y, b_min_z, b_max, b_max_x, b_max_y, b_max_z,
             b_x_mean, b_x_std, b_x_median, b_x_max, b_x_min,
             b_y_mean, b_y_std, b_y_median, b_y_max, b_y_min,
             b_z_mean, b_z_std, b_z_median, b_z_max, b_z_min,
             sens_temp_min, sens_temp_max, sens_temp_med,
             bat_min, bat_max, bat_med,
             sys_temp_min, sys_temp_max, sys_temp_med);
        END IF;

        -- Insert gps_info, if available
        IF time_ref_g IS NOT NULL
        THEN
            INSERT INTO gps_info
            VALUES
            (id, time_ref_g, num_samples_g,
             latitute_mean, latitute_std, latitute_med, latitute_min, latitute_max,
             longitude_mean, longitude_std, longitude_med, longitude_min, longitude_max,
             altitude_mean, altitude_std, altitude_med, altitude_min, altitude_max);
        END IF;

        -- Insert chrony_info, if available
        IF time_ref_c IS NOT NULL
        THEN
            INSERT INTO chrony_info
            VALUES
            (id, time_ref_c, stratum, last_offset, rms_offset);
        END IF;

        RETURN;
    END;
$$
LANGUAGE plpgsql;

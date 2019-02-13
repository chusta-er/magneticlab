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
    b_mean        FLOAT8 NOT NULL,
    b_std         FLOAT8 NOT NULL,
    b_median      FLOAT8 NOT NULL,
    b_median_x    FLOAT8 NOT NULL,
    b_median_y    FLOAT8 NOT NULL,
    b_median_z    FLOAT8 NOT NULL,
    b_min         FLOAT8 NOT NULL,
    b_min_x       FLOAT8 NOT NULL,
    b_min_y       FLOAT8 NOT NULL,
    b_min_z       FLOAT8 NOT NULL,
    b_max         FLOAT8 NOT NULL,
    b_max_x       FLOAT8 NOT NULL,
    b_max_y       FLOAT8 NOT NULL,
    b_max_z       FLOAT8 NOT NULL,
    b_x_mean      FLOAT8 NOT NULL,
    b_x_std       FLOAT8 NOT NULL,
    b_x_median    FLOAT8 NOT NULL,
    b_x_max       FLOAT8 NOT NULL,
    b_x_min       FLOAT8 NOT NULL,
    b_y_mean      FLOAT8 NOT NULL,
    b_y_std       FLOAT8 NOT NULL,
    b_y_median    FLOAT8 NOT NULL,
    b_y_max       FLOAT8 NOT NULL,
    b_y_min       FLOAT8 NOT NULL,
    b_z_mean      FLOAT8 NOT NULL,
    b_z_std       FLOAT8 NOT NULL,
    b_z_median    FLOAT8 NOT NULL,
    b_z_max       FLOAT8 NOT NULL,
    b_z_min       FLOAT8 NOT NULL,
    sens_temp_min FLOAT4 NOT NULL,
    sens_temp_max FLOAT4 NOT NULL,
    sens_temp_med FLOAT4 NOT NULL,
    bat_min       FLOAT4,
    bat_max       FLOAT4,
    bat_med       FLOAT4,
    sys_temp_min  FLOAT4,
    sys_temp_max  FLOAT4,
    sys_temp_med  FLOAT4
);

CREATE TABLE IF NOT EXISTS gps_info (
    time_id        INTEGER REFERENCES timing(time_id),
    time_ref       INTEGER NOT NULL,
    num_samples    INTEGER NOT NULL,
    latitude_mean  FLOAT8 NOT NULL,
    latitude_std   FLOAT8 NOT NULL,
    latitude_med   FLOAT8 NOT NULL,
    latitude_min   FLOAT8 NOT NULL,
    latitude_max   FLOAT8 NOT NULL,
    longitude_mean FLOAT8 NOT NULL,
    longitude_std  FLOAT8 NOT NULL,
    longitude_med  FLOAT8 NOT NULL,
    longitude_min  FLOAT8 NOT NULL,
    longitude_max  FLOAT8 NOT NULL,
    altitude_mean  FLOAT8 NOT NULL,
    altitude_std   FLOAT8 NOT NULL,
    altitude_med   FLOAT8 NOT NULL,
    altitude_min   FLOAT8 NOT NULL,
    altitude_max   FLOAT8 NOT NULL
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
    b_mean         FLOAT8,
    b_std          FLOAT8,
    b_median       FLOAT8,
    b_median_x     FLOAT8,
    b_median_y     FLOAT8,
    b_median_z     FLOAT8,
    b_min          FLOAT8,
    b_min_x        FLOAT8,
    b_min_y        FLOAT8,
    b_min_z        FLOAT8,
    b_max          FLOAT8,
    b_max_x        FLOAT8,
    b_max_y        FLOAT8,
    b_max_z        FLOAT8,
    b_x_mean       FLOAT8,
    b_x_std        FLOAT8,
    b_x_median     FLOAT8,
    b_x_max        FLOAT8,
    b_x_min        FLOAT8,
    b_y_mean       FLOAT8,
    b_y_std        FLOAT8,
    b_y_median     FLOAT8,
    b_y_max        FLOAT8,
    b_y_min        FLOAT8,
    b_z_mean       FLOAT8,
    b_z_std        FLOAT8,
    b_z_median     FLOAT8,
    b_z_max        FLOAT8,
    b_z_min        FLOAT8,
    sens_temp_min  FLOAT4,
    sens_temp_max  FLOAT4,
    sens_temp_med  FLOAT4,
    bat_min        FLOAT4,
    bat_max        FLOAT4,
    bat_med        FLOAT4,
    sys_temp_min   FLOAT4,
    sys_temp_max   FLOAT4,
    sys_temp_med   FLOAT4,

    -- gps info.
    time_ref_g     INTEGER,
    num_samples_g  INTEGER,
    latitude_mean  FLOAT8,
    latitude_std   FLOAT8,
    latitude_med   FLOAT8,
    latitude_min   FLOAT8,
    latitude_max   FLOAT8,
    longitude_mean FLOAT8,
    longitude_std  FLOAT8,
    longitude_med  FLOAT8,
    longitude_min  FLOAT8,
    longitude_max  FLOAT8,
    altitude_mean  FLOAT8,
    altitude_std   FLOAT8,
    altitude_med   FLOAT8,
    altitude_min   FLOAT8,
    altitude_max   FLOAT8,

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
             b_mean, b_std, b_median, b_median_x, b_median_y, b_median_z,
             b_min, b_min_x, b_min_y, b_min_z, b_max, b_max_x, b_max_y, b_max_z,
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
             latitude_mean, latitude_std, latitude_med, latitude_min, latitude_max,
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

CREATE OR REPLACE VIEW web_magnetic_info
AS
SELECT t.sys_time_secs, ci.time_ref, m.b_mean, m.b_std, m.b_median, m.b_median_x, m.b_median_y, m.b_median_z, m.b_min, m.b_max
FROM timing t INNER JOIN magnetic_info m ON t.time_id=m.time_id
INNER JOIN chrony_info ci ON t.time_id=ci.time_id;

GRANT SELECT ON web_magnetic_info TO "www-data";

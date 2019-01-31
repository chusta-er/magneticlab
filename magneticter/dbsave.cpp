#include "pch.h"
#include "dbsave.h"
#include "config.h"

#include <postgresql/libpq-fe.h>
#include <syslog.h>

using namespace std;

// Function that performs the db insertion prelude:
void put_into_db( const std::string &uuid_string, const timeval &curr_time,
                  const timespec &raw_monot_time, const chrony_db_info_t &ci,
                  const vector<gps_db_info_t> &gi_c, const vector<magnetic_info_t> &mi_c )
{
    PGconn *conn = PQconnectdb("");

    ConnStatusType conn_stat = PQstatus(conn);

    if ( LOG_INFO <= get_log_level() ) // LOG_NOTICE?
       {
       cout << " == db insertion result  ==\n";
       switch ( conn_stat )
              {
              case CONNECTION_BAD:
                   cout  << " == CONNECTION_BAD       ==\n";
                   break;
              case CONNECTION_OK:
                   cout  << " == CONNECTION_OK        ==\n";
                   break;
              default:
                   cout  << " == (unknown state)      ==\n";
              }
       }

    if ( CONNECTION_OK != conn_stat ) {PQfinish(conn); return;}

/* ---------------------------------------------
    int median(vector<int> &v)
{
    size_t n = v.size() / 2;
    nth_element(v.begin(), v.begin()+n, v.end());
    return v[n];
}
   --------------------------------------------- */

    int b_mean = 0,
        b_std = 0,
        b_median = 0,
        b_median_x = 0,
        b_median_y = 0,
        b_median_z = 0,
        b_min = 0,
        b_min_x = 0,
        b_min_y = 0,
        b_min_z = 0,
        b_max = 0,
        b_max_x = 0,
        b_max_y = 0,
        b_max_z = 0,
        b_x_mean = 0,
        b_x_std = 0,
        b_x_median = 0,
        b_x_max = 0,
        b_x_min = 0,
        b_y_mean = 0,
        b_y_std = 0,
        b_y_median = 0,
        b_y_max = 0,
        b_y_min = 0,
        b_z_mean = 0,
        b_z_std = 0,
        b_z_median = 0,
        b_z_max = 0,
        b_z_min = 0;

    short sens_temp_min = 1,
          sens_temp_max = 1,
          sens_temp_med = 1,
          bat_min = 1,
          bat_max = 1,
          bat_med = 1,
          sys_temp_min = 1,
          sys_temp_max = 1,
          sys_temp_med = 1;

/*
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
    latitute_mean  FLOAT,
    latitute_std   FLOAT,
    latitute_med   FLOAT,
    latitute_min   FLOAT,
    latitute_max   FLOAT,
    longitude_mean FLOAT,
    longitude_std  FLOAT,
    longitude_med  FLOAT,
    longitude_min  FLOAT,
    longitude_max  FLOAT,
    altitude_mean  FLOAT,
    altitude_std   FLOAT,
    altitude_med   FLOAT,
    altitude_min   FLOAT,
    altitude_max   FLOAT,

    -- chrony info.
    time_ref_c  INTEGER,
    stratum     INTEGER,
    last_offset REAL,
    rms_offset  REAL
*/

    string cmd =
    "START TRANSACTION; SELECT insert_full_register('" +

    // execution uuid:
    uuid_string + "'," +
    // timing info:
    to_string( raw_monot_time.tv_sec ) + "," +
    to_string( raw_monot_time.tv_nsec ) + "," +
    to_string( curr_time.tv_sec ) + "," +
    to_string( curr_time.tv_usec ) + "," +

    // magnetic info:

    to_string( mi_c.size() ) + "," +
    to_string( b_mean ) + "," +
    to_string( b_median ) + "," +
    to_string( b_median_x ) + "," +
    to_string( b_median_y ) + "," +
    to_string( b_median_z ) + "," +
    to_string( b_min ) + "," +
    to_string( b_min_x ) + "," +
    to_string( b_min_y ) + "," +
    to_string( b_min_z ) + "," +
    to_string( b_max ) + "," +
    to_string( b_max_x ) + "," +
    to_string( b_max_y ) + "," +
    to_string( b_max_z ) + "," +
    to_string( b_x_mean ) + "," +
    to_string( b_x_median ) + "," +
    to_string( b_x_max ) + "," +
    to_string( b_x_min ) + "," +
    to_string( b_y_mean ) + "," +
    to_string( b_y_median ) + "," +
    to_string( b_y_max ) + "," +
    to_string( b_y_min ) + "," +
    to_string( b_z_mean ) + "," +
    to_string( b_z_median ) + "," +
    to_string( b_z_max ) + "," +
    to_string( b_z_min ) + "," +
    to_string( sens_temp_min ) + "::int2," +
    to_string( sens_temp_max ) + "::int2," +
    to_string( sens_temp_med ) + "::int2," +
    to_string( bat_min ) + "::int2," +
    to_string( bat_max ) + "::int2," +
    to_string( bat_med ) + "::int2," +
    to_string( sys_temp_min ) + "::int2," +
    to_string( sys_temp_max ) + "::int2," +
    to_string( sys_temp_med ) + "::int2" +

    // gps info:

    // ...

    // chrony info:

    // ...

    ");COMMIT;";

    PGresult *insert_result = PQexec(conn, cmd.c_str());
    ExecStatusType status_insert = PQresultStatus(insert_result);

    if ( LOG_INFO <= get_log_level() ) // LOG_NOTICE?
       {
       switch ( status_insert )
              {
              case PGRES_COMMAND_OK:
                   cout  << " == PGRES_COMMAND_OK     ==\n";
                   break;
              case PGRES_NONFATAL_ERROR:
                   cout  << " == PGRES_NONFATAL_ERROR ==\n";
                   break;
              case PGRES_FATAL_ERROR:
                   cout  << " == PGRES_FATAL_ERROR    ==\n";
                   break;
              default:
                   cout  << " == (unknown insert res) ==\n";
              }
       }

    if ( status_insert != PGRES_COMMAND_OK )
       {
       cerr << PQresStatus(status_insert) << endl;
       char *err_msg = PQresultErrorMessage(insert_result);
       if ( err_msg ) cerr << err_msg << endl;
       }

    // Terminate connection and liberate its resources:
    PQfinish(conn);

    if ( LOG_INFO <= get_log_level() )
       cout << " ==========================\n";
}
